"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { UserProfile } from "@/types/user";
import { Ticket } from "@/types/ticket";
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
  tickets: Ticket[];
  hasTicket: boolean;
  loading: boolean;
  ticketsLoading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (identifier: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshTickets: () => Promise<void>;
  updateUserEmail: (newEmail: string, currentPass: string) => Promise<void>;
  updateUserPhone: (newPhone: string) => Promise<void>;
  updateUserPassword: (currentPass: string, newPass: string) => Promise<void>;
  issueDemoTicket: (sector?: string) => Promise<Ticket>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);

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

  // Helper to fetch user tickets
  const fetchTickets = async (firebaseUser: User): Promise<Ticket[]> => {
    try {
      setTicketsLoading(true);
      const res = await fetch(
        `/api/tickets/my?userId=${encodeURIComponent(firebaseUser.uid)}&email=${encodeURIComponent(
          firebaseUser.email || ""
        )}`
      );
      if (!res.ok) {
        throw new Error("Falha ao carregar ingressos");
      }
      const data = await res.json();
      return data.tickets || [];
    } catch (err) {
      console.error("Error loading tickets:", err);
      return [];
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const p = await fetchProfile(currentUser);
        setProfile(p);
        const userTickets = await fetchTickets(currentUser);
        setTickets(userTickets);
      } else {
        setProfile(null);
        setTickets([]);
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

  const refreshTickets = async () => {
    if (user) {
      const userTickets = await fetchTickets(user);
      setTickets(userTickets);
    }
  };

  // Helper to resolve an identifier (email, CPF or phone) to the user's registered email
  const resolveEmail = async (identifier: string): Promise<string> => {
    const trimmed = identifier.trim();
    if (trimmed.includes("@")) {
      return trimmed.toLowerCase();
    }

    const res = await fetch("/api/auth/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: trimmed }),
    });

    const data = await res.json();
    if (!res.ok || !data.email) {
      throw new Error(data.error || "Nenhum cadastro encontrado com este CPF ou telefone.");
    }

    return String(data.email).toLowerCase();
  };

  const login = async (identifier: string, pass: string) => {
    const targetEmail = await resolveEmail(identifier);
    const cred = await signInWithEmailAndPassword(auth, targetEmail, pass);
    const p = await fetchProfile(cred.user);
    setProfile(p);
    const userTickets = await fetchTickets(cred.user);
    setTickets(userTickets);
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
    setTickets([]);
  };

  const resetPassword = async (identifier: string) => {
    const targetEmail = await resolveEmail(identifier);
    await sendPasswordResetEmail(auth, targetEmail);
  };

  // Profile update: Email
  const updateUserEmail = async (newEmail: string, currentPass: string) => {
    if (!user || !user.email) throw new Error("Usuário não autenticado.");
    const cleanNewEmail = newEmail.trim().toLowerCase();
    if (cleanNewEmail === user.email.toLowerCase()) return;

    // 1. Reauthenticate first
    const credential = EmailAuthProvider.credential(user.email, currentPass);
    await reauthenticateWithCredential(user, credential);

    // 2. Update email in Auth
    await updateEmail(user, cleanNewEmail);

    // 3. Update in Firestore
    const oldEmail = user.email.toLowerCase();
    const docRefOld = doc(db, "usuarios", oldEmail);
    const docSnapOld = await getDoc(docRefOld);

    if (docSnapOld.exists()) {
      const data = docSnapOld.data();
      // Write to new email docId and keep UID
      await setDoc(doc(db, "usuarios", cleanNewEmail), {
        ...data,
        email: cleanNewEmail,
        updatedAt: serverTimestamp(),
      });
    } else {
      // If was UID-based
      await setDoc(
        doc(db, "usuarios", user.uid),
        { email: cleanNewEmail, updatedAt: serverTimestamp() },
        { merge: true }
      );
    }

    await refreshProfile();
  };

  // Profile update: Phone
  const updateUserPhone = async (newPhone: string) => {
    if (!user) throw new Error("Usuário não autenticado.");
    const cleanPhone = sanitizePhone(newPhone);
    if (cleanPhone.length < 10) {
      throw new Error("Telefone inválido. Informe DDD + número completo.");
    }

    const email = user.email?.toLowerCase();
    if (email) {
      await setDoc(
        doc(db, "usuarios", email),
        { telefone: cleanPhone, updatedAt: serverTimestamp() },
        { merge: true }
      );
    }
    await setDoc(
      doc(db, "usuarios", user.uid),
      { telefone: cleanPhone, updatedAt: serverTimestamp() },
      { merge: true }
    );

    await refreshProfile();
  };

  // Profile update: Password
  const updateUserPassword = async (currentPass: string, newPass: string) => {
    if (!user || !user.email) throw new Error("Usuário não autenticado.");
    if (newPass.length < 6) {
      throw new Error("A nova senha deve ter no mínimo 6 caracteres.");
    }

    // 1. Reauthenticate
    const credential = EmailAuthProvider.credential(user.email, currentPass);
    await reauthenticateWithCredential(user, credential);

    // 2. Update password
    await updatePassword(user, newPass);
  };

  // Demo ticket generation helper for testing
  const issueDemoTicket = async (sector: string = "pista"): Promise<Ticket> => {
    if (!user) throw new Error("Faça login para emitir o ingresso.");
    const res = await fetch("/api/tickets/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.uid,
        userEmail: user.email,
        userName: profile?.nome || user.email?.split("@")[0] || "Portador Oficial",
        userCpf: profile?.cpf || "",
        sector,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ticket) {
      throw new Error(data.error || "Erro ao emitir ingresso de demonstração.");
    }

    setTickets((prev) => [data.ticket, ...prev]);
    return data.ticket;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        tickets,
        hasTicket: tickets.length > 0,
        loading,
        ticketsLoading,
        login,
        register,
        logout,
        resetPassword,
        refreshProfile,
        refreshTickets,
        updateUserEmail,
        updateUserPhone,
        updateUserPassword,
        issueDemoTicket,
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
