const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = admin.getApps().length ? admin.getApp() : admin.initializeApp({ credential: admin.cert(serviceAccount) });
const auth = getAuth(app);
const db = getFirestore(app);

// Helpers
function sanitizeDigits(str) {
  if (!str) return '';
  return String(str).replace(/\D/g, '');
}

function calculateAge(birthDateIso) {
  if (!birthDateIso || !/^\d{4}-\d{2}-\d{2}$/.test(birthDateIso)) return null;
  const [year, month, day] = birthDateIso.split('-').map(Number);
  const birth = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

async function runMigration() {
  const isExecute = process.argv.includes('--execute');
  const deleteLegacy = process.argv.includes('--delete-legacy');

  console.log('=====================================================');
  console.log(`MIGRATION SCRIPT - USUARIOS TO /usuarios/{uid}`);
  console.log(`MODE: ${isExecute ? 'EXECUTION (LIVE WRITES)' : 'DRY-RUN (SIMULATION ONLY)'}`);
  console.log(`DELETE LEGACY EMAIL DOCS: ${deleteLegacy ? 'YES' : 'NO (PRESERVED AS BACKUP)'}`);
  console.log('=====================================================\n');

  // 1. Fetch Auth Users
  const authUsers = new Map();
  let pageToken;
  do {
    const listResult = await auth.listUsers(1000, pageToken);
    listResult.users.forEach(u => {
      authUsers.set(u.uid, u);
    });
    pageToken = listResult.pageToken;
  } while (pageToken);
  console.log(`Found ${authUsers.size} users in Firebase Authentication.`);

  // 2. Fetch Firestore Documents
  const snapshot = await db.collection('usuarios').get();
  console.log(`Found ${snapshot.size} documents in Firestore "usuarios" collection.\n`);

  let toMigrate = 0;
  let alreadyNormalized = 0;
  let errors = [];

  const cleanRecords = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    const docId = doc.id;
    const uid = data.uid;

    if (!uid) {
      errors.push(`Doc ${docId} has NO UID field!`);
      return;
    }

    const cleanNome = (data.nome || '').trim();
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const cleanCpf = sanitizeDigits(data.cpf);
    const cleanTelefone = sanitizeDigits(data.telefone);
    const cleanDataNascimento = (data.dataNascimento || '').trim();
    const calculatedAge = calculateAge(cleanDataNascimento) ?? (typeof data.idade === 'number' ? data.idade : 0);
    const role = data.role === 'admin' ? 'admin' : 'user';

    const normalizedData = {
      uid: uid,
      nome: cleanNome,
      email: cleanEmail,
      cpf: cleanCpf,
      telefone: cleanTelefone,
      dataNascimento: cleanDataNascimento,
      idade: calculatedAge,
      role: role,
      createdAt: data.createdAt || FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (data.viaBot) {
      normalizedData.viaBot = true;
    }

    cleanRecords.push({
      legacyDocId: docId,
      targetDocId: uid,
      isLegacy: docId !== uid,
      data: normalizedData
    });

    if (docId === uid) {
      alreadyNormalized++;
    } else {
      toMigrate++;
    }
  });

  console.log(`Records to migrate to /usuarios/{uid}: ${toMigrate}`);
  console.log(`Records already at /usuarios/{uid}: ${alreadyNormalized}`);
  if (errors.length > 0) {
    console.error('Errors found:', errors);
  }

  // Preview sample
  console.log('\n--- SAMPLE MIGRATED RECORD (first 2) ---');
  console.log(JSON.stringify(cleanRecords.slice(0, 2), null, 2));

  if (!isExecute) {
    console.log('\n[DRY RUN FINISHED] No database modifications were made.');
    console.log('To perform the live migration, run: node scripts/migrate_users_to_uid.js --execute');
    return;
  }

  // EXECUTION MODE
  console.log('\nExecuting live migration in Firestore batches (500 per batch)...');
  const BATCH_SIZE = 400;
  for (let i = 0; i < cleanRecords.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = cleanRecords.slice(i, i + BATCH_SIZE);

    chunk.forEach(record => {
      const targetRef = db.collection('usuarios').doc(record.targetDocId);
      batch.set(targetRef, record.data, { merge: true });

      if (deleteLegacy && record.isLegacy) {
        const legacyRef = db.collection('usuarios').doc(record.legacyDocId);
        batch.delete(legacyRef);
      }
    });

    await batch.commit();
    console.log(`Committed batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} records)`);
  }

  console.log('\n=== MIGRATION COMPLETED SUCCESSFULLY! ===');
  console.log(`Total standardized records written: ${cleanRecords.length}`);
}

runMigration()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
