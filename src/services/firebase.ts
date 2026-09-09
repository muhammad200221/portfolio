import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  increment,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { ContactMessage, Profile, Project, SocialLink, AdminUser, Certificate } from '../types';
import { DEFAULT_PROFILE, DEFAULT_PROJECTS, DEFAULT_SOCIALS, DEFAULT_CERTIFICATES } from '../data/defaultData';

export const DEFAULT_PROJECT_CATEGORIES: string[] = [
  'وێبسایت',
  'ئەپڵیکەیشن',
  'سیستەم',
  'دیزاینی UI/UX',
  'براندینگ',
];

// Initialize Firebase safely
const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use the specific firestoreDatabaseId from the configuration
export const db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export const storage = getStorage(app);

// ----------------------------------------------------
// STORAGE & ULTRA-FAST IMAGE COMPRESSION HELPER
// ----------------------------------------------------
export async function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.80
): Promise<{ file: File; dataUrl: string }> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ file, dataUrl: reader.result as string });
      reader.readAsDataURL(file);
    });
  }

  // Fast hardware-accelerated decode with createImageBitmap
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file);
      let { width, height } = bitmap;
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        return new Promise((resolve) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File(
                  [blob],
                  file.name.replace(/\.[^.]+$/, '.jpg'),
                  { type: 'image/jpeg' }
                );
                resolve({ file: compressedFile, dataUrl });
              } else {
                resolve({ file, dataUrl });
              }
            },
            'image/jpeg',
            quality
          );
        });
      }
    } catch {
      // fallback to FileReader if createImageBitmap fails
    }
  }

  // Standard Image fallback
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File(
                  [blob],
                  file.name.replace(/\.[^.]+$/, '.jpg'),
                  { type: 'image/jpeg' }
                );
                resolve({ file: compressedFile, dataUrl });
              } else {
                resolve({ file, dataUrl });
              }
            },
            'image/jpeg',
            quality
          );
        } else {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({ file, dataUrl });
        }
      };
      img.onerror = () => {
        resolve({ file, dataUrl: (e.target?.result as string) || '' });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve({ file, dataUrl: '' });
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file: File, isAvatar = false): Promise<string> {
  try {
    // For avatar: 400x400 px at 0.78 quality yields a crisp ~25KB image that loads instantly!
    const maxDim = isAvatar ? 400 : 1000;
    const quality = isAvatar ? 0.78 : 0.80;
    const { file: processedFile, dataUrl } = await compressImage(file, maxDim, maxDim, quality);

    // If it's an avatar, dataUrl is tiny (<35KB), return immediately so it takes under 100ms!
    if (isAvatar) {
      return dataUrl;
    }

    // For project images, try Firebase Storage with a strict 2s timeout
    try {
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const storageRef = ref(storage, `portfolio_uploads/${timestamp}_${cleanFileName}`);

      const uploadPromise = uploadBytes(storageRef, processedFile).then((snap) =>
        getDownloadURL(snap.ref)
      );
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Storage timeout')), 2000)
      );

      const downloadURL = await Promise.race([uploadPromise, timeoutPromise]);
      return downloadURL;
    } catch {
      // Instantly fallback to compressed dataUrl
      return dataUrl;
    }
  } catch (err) {
    console.warn('Image processing fallback:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.readAsDataURL(file);
    });
  }
}

// ----------------------------------------------------
// AUTHENTICATION HELPERS & SESSION
// ----------------------------------------------------
let localAdminUser: AdminUser | null = (() => {
  try {
    const saved = localStorage.getItem('portfolio_admin_session');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
})();

const authListeners = new Set<(user: User | AdminUser | null) => void>();

function notifyAuthListeners() {
  const current = auth.currentUser || localAdminUser;
  authListeners.forEach((cb) => cb(current));
}

function setLocalAdminSession(user: AdminUser) {
  localAdminUser = user;
  try {
    localStorage.setItem('portfolio_admin_session', JSON.stringify(user));
  } catch {}
  notifyAuthListeners();
}

function clearLocalAdminSession() {
  localAdminUser = null;
  try {
    localStorage.removeItem('portfolio_admin_session');
  } catch {}
  notifyAuthListeners();
}

// ----------------------------------------------------
// SECURE ADMIN AUTHENTICATION (SALTED SHA-256 & FIRESTORE)
// ----------------------------------------------------
export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const enc = new TextEncoder();
    const data = enc.encode(password + ':' + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 0;
  const str = password + ':' + salt;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return 'secure_hash_' + Math.abs(h).toString(16);
}

export function generateSalt(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
    return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function getAdminCredentialsInfo(): Promise<{ adminEmail: string }> {
  try {
    const authRef = doc(db, 'settings', 'admin_auth');
    const snap = await getDoc(authRef);
    if (snap.exists()) {
      const data = snap.data();
      return { adminEmail: data.adminEmail || '' };
    }
  } catch (err) {
    console.warn('Error fetching admin auth info:', err);
  }
  return { adminEmail: '' };
}

export async function updateAdminCredentials(
  newEmail: string,
  newPassword?: string,
  currentPassword?: string
): Promise<void> {
  const cleanEmail = newEmail.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('تکایە ئیمەیڵێکی دروست بنووسە.');
  }

  const authRef = doc(db, 'settings', 'admin_auth');
  const snap = await getDoc(authRef);

  // If there's an existing record and newPassword is being set, verify currentPassword if provided
  if (snap.exists() && newPassword) {
    const data = snap.data();
    if (data.passwordHash && data.salt && currentPassword) {
      const computed = await hashPasswordWithSalt(currentPassword.trim(), data.salt);
      if (computed !== data.passwordHash) {
        throw {
          code: 'auth/wrong-password',
          message: 'وشەی نهێنی ئێستات هەڵەیە.',
        };
      }
    }
  }

  const salt = generateSalt();
  let passwordHash = '';
  if (newPassword && newPassword.trim()) {
    passwordHash = await hashPasswordWithSalt(newPassword.trim(), salt);
  } else if (snap.exists()) {
    // Keep existing password
    const data = snap.data();
    passwordHash = data.passwordHash;
  } else {
    // Default initial strong password if none provided
    passwordHash = await hashPasswordWithSalt('admin' + Date.now(), salt);
  }

  await setDoc(authRef, {
    adminEmail: cleanEmail,
    passwordHash,
    salt,
    updatedAt: Date.now(),
  });

  // Update current session user if active
  if (localAdminUser) {
    const updated: AdminUser = {
      ...localAdminUser,
      email: cleanEmail,
    };
    setLocalAdminSession(updated);
  }
}

export async function loginAdmin(email: string, pass: string): Promise<User | AdminUser> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  // 1. First try standard Firebase Auth
  try {
    const userCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
    clearLocalAdminSession();
    return userCred.user;
  } catch (error: any) {
    // 2. Check secure admin authentication record in Firestore (settings/admin_auth)
    try {
      const authRef = doc(db, 'settings', 'admin_auth');
      const snap = await getDoc(authRef);

      if (snap.exists()) {
        const data = snap.data();
        const storedEmail = (data.adminEmail || '').trim().toLowerCase();

        // Check if email matches
        if (cleanEmail !== storedEmail) {
          throw {
            code: 'auth/unauthorized',
            message: 'ئەم ئیمەیڵە ڕێگەپێدراو نییە بۆ دەستگەیشتن بەم بەشە.',
          };
        }

        // Verify password using salted SHA-256 hash
        const computedHash = await hashPasswordWithSalt(cleanPass, data.salt || '');
        if (computedHash !== data.passwordHash) {
          throw {
            code: 'auth/wrong-password',
            message: 'وشەی نهێنی (تێپەڕ) هەڵەیە.',
          };
        }

        // Authenticated! Attempt anonymous sign-in for Firebase SDK context
        try {
          const anonCred = await signInAnonymously(auth);
          const sessionUser: AdminUser = {
            uid: anonCred.user.uid,
            email: cleanEmail,
            displayName: 'بەڕێوەبەر',
          };
          setLocalAdminSession(sessionUser);
          return sessionUser;
        } catch {
          const sessionUser: AdminUser = {
            uid: 'admin_verified_session',
            email: cleanEmail,
            displayName: 'بەڕێوەبەر',
          };
          setLocalAdminSession(sessionUser);
          return sessionUser;
        }
      } else {
        // If settings/admin_auth does not exist yet (first initialization):
        // Allow the portfolio owner to set their admin credentials directly
        const profileRef = doc(db, 'settings', 'profile');
        const profileSnap = await getDoc(profileRef);
        const profileEmail = profileSnap.exists()
          ? (profileSnap.data().email || '').trim().toLowerCase()
          : '';

        // If email matches the portfolio owner's email, initialize admin credentials with this password!
        if (cleanEmail === profileEmail || !profileEmail) {
          const salt = generateSalt();
          const passwordHash = await hashPasswordWithSalt(cleanPass, salt);
          await setDoc(authRef, {
            adminEmail: cleanEmail,
            passwordHash,
            salt,
            updatedAt: Date.now(),
          });

          const sessionUser: AdminUser = {
            uid: 'admin_initial_session',
            email: cleanEmail,
            displayName: 'بەڕێوەبەر',
          };
          setLocalAdminSession(sessionUser);
          return sessionUser;
        } else {
          throw {
            code: 'auth/unauthorized',
            message: 'ئەم ئیمەیڵە تۆمار نەکراوە وەک بەڕێوەبەر.',
          };
        }
      }
    } catch (innerErr: any) {
      if (innerErr.code) throw innerErr;
      throw error;
    }
  }
}

export async function logoutAdmin(): Promise<void> {
  clearLocalAdminSession();
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('SignOut error:', err);
  }
}

export function subscribeAuth(callback: (user: User | AdminUser | null) => void) {
  authListeners.add(callback);
  // Initial callback with current user or saved local session
  callback(auth.currentUser || localAdminUser);

  const unsub = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(firebaseUser);
    } else {
      callback(localAdminUser);
    }
  });

  return () => {
    authListeners.delete(callback);
    unsub();
  };
}

// ----------------------------------------------------
// FIRESTORE DATA SANITIZER (PREVENTS UNDEFINED VALUE CRASHES)
// ----------------------------------------------------
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        result[key] = cleanFirestoreData(val);
      } else {
        result[key] = val;
      }
    }
  }
  return result;
}

// ----------------------------------------------------
// SEEDING INITIAL KURDISH DATA
// ----------------------------------------------------
export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    // Check if profile exists
    const profileRef = doc(db, 'settings', 'profile');
    const profileSnap = await getDoc(profileRef);
    if (!profileSnap.exists()) {
      await setDoc(profileRef, DEFAULT_PROFILE);
    }

    // Check if socials exist
    const socialsRef = doc(db, 'settings', 'socials');
    const socialsSnap = await getDoc(socialsRef);
    if (!socialsSnap.exists()) {
      await setDoc(socialsRef, { items: DEFAULT_SOCIALS });
    }

    // Check if projects exist
    const projectsCol = collection(db, 'projects');
    const projectsSnap = await getDocs(projectsCol);
    if (projectsSnap.empty) {
      for (const project of DEFAULT_PROJECTS) {
        const { id, ...data } = project;
        await setDoc(doc(db, 'projects', id), cleanFirestoreData(data));
      }
    }

    // Check if certificates exist
    const certsCol = collection(db, 'certificates');
    const certsSnap = await getDocs(certsCol);
    if (certsSnap.empty) {
      for (const cert of DEFAULT_CERTIFICATES) {
        const { id, ...data } = cert;
        await setDoc(doc(db, 'certificates', id), cleanFirestoreData(data));
      }
    }

    // Check if project categories exist
    const categoriesRef = doc(db, 'settings', 'project_categories');
    const categoriesSnap = await getDoc(categoriesRef);
    if (!categoriesSnap.exists()) {
      await setDoc(categoriesRef, { items: DEFAULT_PROJECT_CATEGORIES });
    }
  } catch (error) {
    console.warn('Notice seeding initial portfolio data:', error);
  }
}

export async function resetToDefaultData(): Promise<void> {
  const profileRef = doc(db, 'settings', 'profile');
  await setDoc(profileRef, DEFAULT_PROFILE);

  const socialsRef = doc(db, 'settings', 'socials');
  await setDoc(socialsRef, { items: DEFAULT_SOCIALS });

  const categoriesRef = doc(db, 'settings', 'project_categories');
  await setDoc(categoriesRef, { items: DEFAULT_PROJECT_CATEGORIES });

  for (const project of DEFAULT_PROJECTS) {
    const { id, ...data } = project;
    await setDoc(doc(db, 'projects', id), cleanFirestoreData(data));
  }

  for (const cert of DEFAULT_CERTIFICATES) {
    const { id, ...data } = cert;
    await setDoc(doc(db, 'certificates', id), cleanFirestoreData(data));
  }
}

// ----------------------------------------------------
// PROJECTS CRUD & SUBSCRIPTION
// ----------------------------------------------------
export function subscribeProjects(callback: (projects: Project[]) => void) {
  // Instant cached rendering
  try {
    const cached = localStorage.getItem('portfolio_cached_projects');
    if (cached) {
      callback(JSON.parse(cached));
    }
  } catch (e) {}

  const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // Fallback to defaults if empty
        callback(DEFAULT_PROJECTS);
      } else {
        const projects: Project[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Project, 'id'>),
        }));
        try {
          localStorage.setItem('portfolio_cached_projects', JSON.stringify(projects));
        } catch (e) {}
        callback(projects);
      }
    },
    (error) => {
      console.warn('Error subscribing to projects, using fallback data:', error);
      callback(DEFAULT_PROJECTS);
    }
  );
}

export async function createProject(project: Omit<Project, 'id'>): Promise<string> {
  const cleanData = cleanFirestoreData({
    ...project,
    createdAt: project.createdAt || Date.now(),
  });
  const docRef = await addDoc(collection(db, 'projects'), cleanData);
  return docRef.id;
}

export async function updateProject(id: string, project: Partial<Project>): Promise<void> {
  const cleanData = cleanFirestoreData(project);
  const projectRef = doc(db, 'projects', id);
  await updateDoc(projectRef, cleanData);
}

export async function deleteProject(id: string): Promise<void> {
  const projectRef = doc(db, 'projects', id);
  await deleteDoc(projectRef);
}

// ----------------------------------------------------
// PROJECT CATEGORIES CRUD & SUBSCRIPTION
// ----------------------------------------------------
export function subscribeProjectCategories(callback: (categories: string[]) => void) {
  // Check local cache
  try {
    const cached = localStorage.getItem('portfolio_cached_categories');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        callback(parsed);
      }
    }
  } catch (e) {}

  const categoriesRef = doc(db, 'settings', 'project_categories');
  return onSnapshot(
    categoriesRef,
    (snapshot) => {
      if (snapshot.exists() && Array.isArray(snapshot.data().items)) {
        const items = snapshot.data().items as string[];
        try {
          localStorage.setItem('portfolio_cached_categories', JSON.stringify(items));
        } catch (e) {}
        callback(items);
      } else {
        callback(DEFAULT_PROJECT_CATEGORIES);
      }
    },
    (error) => {
      console.warn('Error subscribing to categories, using defaults:', error);
      callback(DEFAULT_PROJECT_CATEGORIES);
    }
  );
}

export async function updateProjectCategories(categories: string[]): Promise<void> {
  const cleanCategories = Array.from(new Set(categories.map((c) => c.trim()).filter(Boolean)));
  const categoriesRef = doc(db, 'settings', 'project_categories');
  await setDoc(categoriesRef, { items: cleanCategories });
  try {
    localStorage.setItem('portfolio_cached_categories', JSON.stringify(cleanCategories));
  } catch (e) {}
}

export async function renameProjectCategory(oldCategory: string, newCategory: string): Promise<void> {
  const trimmedNew = newCategory.trim();
  const trimmedOld = oldCategory.trim();
  if (!trimmedNew || !trimmedOld || trimmedNew === trimmedOld) return;

  // 1. Update the categories list
  const categoriesRef = doc(db, 'settings', 'project_categories');
  const snap = await getDoc(categoriesRef);
  let list = DEFAULT_PROJECT_CATEGORIES;
  if (snap.exists() && Array.isArray(snap.data().items)) {
    list = snap.data().items;
  }
  const updatedList = list.map((c) => (c === trimmedOld ? trimmedNew : c));
  const cleanList = Array.from(new Set(updatedList));
  await setDoc(categoriesRef, { items: cleanList });
  try {
    localStorage.setItem('portfolio_cached_categories', JSON.stringify(cleanList));
  } catch (e) {}

  // 2. Also update all projects in Firestore that have category == oldCategory
  try {
    const projectsSnap = await getDocs(collection(db, 'projects'));
    const updates: Promise<void>[] = [];
    projectsSnap.forEach((d) => {
      const data = d.data();
      if (data.category === trimmedOld) {
        updates.push(updateDoc(doc(db, 'projects', d.id), { category: trimmedNew }));
      }
    });
    if (updates.length > 0) {
      await Promise.all(updates);
    }
  } catch (err) {
    console.warn('Error updating projects with renamed category:', err);
  }
}

export async function deleteProjectCategory(categoryToDelete: string, fallbackCategory: string = 'وێبسایت'): Promise<void> {
  const trimmed = categoryToDelete.trim();
  const categoriesRef = doc(db, 'settings', 'project_categories');
  const snap = await getDoc(categoriesRef);
  let list = DEFAULT_PROJECT_CATEGORIES;
  if (snap.exists() && Array.isArray(snap.data().items)) {
    list = snap.data().items;
  }
  const updatedList = list.filter((c) => c !== trimmed);
  await setDoc(categoriesRef, { items: updatedList });
  try {
    localStorage.setItem('portfolio_cached_categories', JSON.stringify(updatedList));
  } catch (e) {}

  // Update projects with this category to fallbackCategory
  try {
    const projectsSnap = await getDocs(collection(db, 'projects'));
    const updates: Promise<void>[] = [];
    projectsSnap.forEach((d) => {
      const data = d.data();
      if (data.category === trimmed) {
        updates.push(updateDoc(doc(db, 'projects', d.id), { category: fallbackCategory }));
      }
    });
    if (updates.length > 0) {
      await Promise.all(updates);
    }
  } catch (err) {
    console.warn('Error updating projects after category deletion:', err);
  }
}

// ----------------------------------------------------
// CERTIFICATES CRUD & SUBSCRIPTION
// ----------------------------------------------------
export function subscribeCertificates(callback: (certs: Certificate[]) => void) {
  // Load from local storage immediately for zero-lag rendering
  try {
    const cached = localStorage.getItem('portfolio_cached_certificates');
    if (cached) {
      callback(JSON.parse(cached));
    }
  } catch (e) {}

  const q = query(collection(db, 'certificates'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(DEFAULT_CERTIFICATES);
      } else {
        const certs: Certificate[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Certificate, 'id'>),
        }));
        try {
          localStorage.setItem('portfolio_cached_certificates', JSON.stringify(certs));
        } catch (e) {}
        callback(certs);
      }
    },
    (error) => {
      console.warn('Error subscribing to certificates, using default certificates:', error);
      callback(DEFAULT_CERTIFICATES);
    }
  );
}

export async function createCertificate(cert: Omit<Certificate, 'id'>): Promise<string> {
  const cleanData = cleanFirestoreData({
    ...cert,
    createdAt: cert.createdAt || Date.now(),
  });
  const docRef = await addDoc(collection(db, 'certificates'), cleanData);
  return docRef.id;
}

export async function updateCertificate(id: string, cert: Partial<Certificate>): Promise<void> {
  const cleanData = cleanFirestoreData(cert);
  const certRef = doc(db, 'certificates', id);
  await updateDoc(certRef, cleanData);
}

export async function deleteCertificate(id: string): Promise<void> {
  const certRef = doc(db, 'certificates', id);
  await deleteDoc(certRef);
}

// ----------------------------------------------------
// PROFILE SUBSCRIPTION & UPDATE
// ----------------------------------------------------
export function subscribeProfile(callback: (profile: Profile) => void) {
  const profileRef = doc(db, 'settings', 'profile');

  return onSnapshot(
    profileRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as Profile);
      } else {
        callback(DEFAULT_PROFILE);
      }
    },
    (error) => {
      console.warn('Error subscribing to profile, using fallback profile:', error);
      callback(DEFAULT_PROFILE);
    }
  );
}

// ----------------------------------------------------
// FIRESTORE SANITIZATION (PREVENTS UNDEFINED VALUE ERRORS)
// ----------------------------------------------------
export function sanitizeForFirestore<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (data !== null && typeof data === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const [key, val] of Object.entries(data as Record<string, any>)) {
      if (val !== undefined) {
        cleanObj[key] = sanitizeForFirestore(val);
      }
    }
    return cleanObj as T;
  }
  return data;
}

export async function updateProfile(profile: Profile): Promise<void> {
  const profileRef = doc(db, 'settings', 'profile');
  const cleanProfile = sanitizeForFirestore(profile);
  await setDoc(profileRef, cleanProfile);
}

// ----------------------------------------------------
// SOCIALS SUBSCRIPTION & UPDATE
// ----------------------------------------------------
export function subscribeSocials(callback: (socials: SocialLink[]) => void) {
  const socialsRef = doc(db, 'settings', 'socials');

  return onSnapshot(
    socialsRef,
    (snapshot) => {
      if (snapshot.exists() && snapshot.data().items) {
        callback(snapshot.data().items as SocialLink[]);
      } else {
        callback(DEFAULT_SOCIALS);
      }
    },
    (error) => {
      console.warn('Error subscribing to socials, using fallback socials:', error);
      callback(DEFAULT_SOCIALS);
    }
  );
}

export async function updateSocials(socials: SocialLink[]): Promise<void> {
  const socialsRef = doc(db, 'settings', 'socials');
  await setDoc(socialsRef, { items: socials });
}

// ----------------------------------------------------
// CONTACT MESSAGES
// ----------------------------------------------------
export async function sendContactMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'messages'), {
    ...msg,
    createdAt: Date.now(),
    read: false,
  });
  return docRef.id;
}

export function subscribeMessages(callback: (messages: ContactMessage[]) => void) {
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: ContactMessage[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ContactMessage, 'id'>),
      }));
      callback(messages);
    },
    (error) => {
      console.warn('Messages subscription error (normal if not admin):', error);
      callback([]);
    }
  );
}

export async function markMessageAsRead(id: string, read: boolean = true): Promise<void> {
  const docRef = doc(db, 'messages', id);
  await updateDoc(docRef, { read });
}

export async function deleteMessage(id: string): Promise<void> {
  const docRef = doc(db, 'messages', id);
  await deleteDoc(docRef);
}

// ----------------------------------------------------
// VISITOR COUNTER
// ----------------------------------------------------
export function subscribeVisitorCount(callback: (count: number) => void) {
  const visitorDocRef = doc(db, 'stats', 'visitors');

  return onSnapshot(
    visitorDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const count = typeof data?.count === 'number' ? data.count : 1;
        try {
          localStorage.setItem('portfolio_cached_visitor_count', count.toString());
        } catch (e) {}
        callback(count);
      } else {
        const cached = localStorage.getItem('portfolio_cached_visitor_count');
        const count = cached ? parseInt(cached, 10) : 1;
        callback(count);
      }
    },
    (error) => {
      console.warn('Visitor counter subscription warning:', error);
      const cached = localStorage.getItem('portfolio_cached_visitor_count');
      const count = cached ? parseInt(cached, 10) : 1;
      callback(count);
    }
  );
}

export async function recordVisit(): Promise<void> {
  if (typeof window === 'undefined') return;

  const sessionKey = 'portfolio_session_visited';
  // Avoid duplicate counting in the same browser session
  if (sessionStorage.getItem(sessionKey)) {
    return;
  }
  sessionStorage.setItem(sessionKey, 'true');

  try {
    const visitorDocRef = doc(db, 'stats', 'visitors');
    await setDoc(
      visitorDocRef,
      {
        count: increment(1),
        lastVisitedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Failed to record visit to Firestore:', error);
  }
}

