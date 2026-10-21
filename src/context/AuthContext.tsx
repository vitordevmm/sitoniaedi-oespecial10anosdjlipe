"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { UserProfile } from "@/types/user";
import { calculateAge, sanitizeCpf, sanitizePhone } from "@/lib/validations/user";

interface RegisterData {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch user profile from Firestore "usuarios"
  const fetchProfile = async (firebaseUser: User): Promise<UserProfile | null> => {
    try {
      const email = firebaseUser.email?.toLowerCase();
      let profileData: UserProfile | null = null;

      // 1. Try finding by email (matches the 862 existing documents)
      if (email) {
        const emailDocRef = doc(db, "usuarios", email);
        const emailSnap = await getDoc(emailDocRef);
        if (emailSnap.exists()) {
          profileData = emailSnap.data() as UserProfile;
        }
      }

      // 2. If not found by email, try finding by UID (matches UID-based docs)
      if (!profileData) {
        const uidDocRef = doc(db, "usuarios", firebaseUser.uid);
        const uidSnap = await getDoc(uidDocRef);
        if (uidSnap.exists()) {
          profileData = uidSnap.data() as UserProfile;
        }
      }

      return profileData;
    } catch (err) {
      console.error("Error fetching user profile from Firestore:", err);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const p = await fetchProfile(currentUser);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      const p = await fetchProfile(user);
      setProfile(p);
    }
  };

  const login = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const p = await fetchProfile(cred.user);
    setProfile(p);
  };

  const register = async (data: RegisterData) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanCpf = sanitizeCpf(data.cpf);
    const cleanPhone = sanitizePhone(data.telefone);
    const cleanNome = data.nome.trim();
    const cleanBirth = data.dataNascimento.trim();
    const age = calculateAge(cleanBirth) || 0;

    // 1. Create account in Firebase Authentication
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
    const uid = cred.user.uid;

    // 2. Save profile in Firestore "usuarios" matching existing database organization
    const newProfile: Record<string, unknown> = {
      uid: uid,
      nome: cleanNome,
      email: cleanEmail,
      cpf: cleanCpf,
      telefone: cleanPhone,
      dataNascimento: cleanBirth,
      idade: age,
      role: "user",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Save with email as docId (exact format of existing collection)
    await setDoc(doc(db, "usuarios", cleanEmail), newProfile);

    // Also set locally
    setProfile(newProfile as unknown as UserProfile);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
