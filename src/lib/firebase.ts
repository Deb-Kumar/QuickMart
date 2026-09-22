import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where, 
  updateDoc 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { Order, CartItem } from '../types';

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

let app: any = null;
let dbInstance: any = null;
let authInstance: any = null;
let googleProviderInstance: any = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

    try {
      dbInstance = getFirestore(app);
    } catch (dbErr) {
      console.warn('Firestore initialization warning:', dbErr);
    }

    try {
      authInstance = getAuth(app);
      googleProviderInstance = new GoogleAuthProvider();
    } catch (authErr) {
      console.warn('Firebase Auth initialization warning:', authErr);
    }
  }
} catch (err) {
  console.warn('Firebase initialization skipped or warning:', err);
}

// Exported safe instances
export const db = dbInstance;
export const auth = authInstance;
export const googleProvider = googleProviderInstance;

// Auto sign-in anonymously for instant session persistence
export const initAuth = (onUserReady?: (user: User | null) => void) => {
  if (!auth) {
    onUserReady?.(null);
    return () => {};
  }
  try {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          const cred = await signInAnonymously(auth);
          onUserReady?.(cred.user);
        } catch (err) {
          console.warn('Anonymous sign-in fallback:', err);
          onUserReady?.(null);
        }
      } else {
        onUserReady?.(user);
      }
    });
  } catch (err) {
    console.warn('initAuth listener warning:', err);
    onUserReady?.(null);
    return () => {};
  }
};

export const loginWithGoogle = async () => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Auth is not initialized or configured on this domain.');
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  if (!auth) return null;
  try {
    await signOut(auth);
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (error) {
    console.error('Logout error:', error);
    return null;
  }
};

// Firestore Realtime API for Orders
export const subscribeOrders = (userId: string, callback: (orders: Order[]) => void) => {
  if (!userId || !db) return () => {};
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where('userId', '==', userId));
    
    return onSnapshot(q, (snapshot) => {
      const ordersList: Order[] = [];
      snapshot.forEach((docSnap) => {
        ordersList.push(docSnap.data() as Order);
      });
      // Sort newest first
      ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(ordersList);
    }, (error) => {
      console.warn('Orders subscription error:', error);
    });
  } catch (e) {
    console.warn('subscribeOrders error:', e);
    return () => {};
  }
};

export const saveOrderToFirestore = async (userId: string, order: Order) => {
  if (!db) return false;
  try {
    const orderRef = doc(db, 'orders', order.id);
    const payload = {
      ...order,
      userId,
      updatedAt: new Date().toISOString()
    };
    await setDoc(orderRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.warn('Failed to save order to Firestore:', err);
    return false;
  }
};

export const updateOrderStatusFirestore = async (orderId: string, status: Order['status'], elapsedSeconds?: number) => {
  if (!db) return false;
  try {
    const orderRef = doc(db, 'orders', orderId);
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (elapsedSeconds !== undefined) {
      updateData.elapsedSeconds = elapsedSeconds;
    }
    await updateDoc(orderRef, updateData);
    return true;
  } catch (err) {
    console.warn('Failed to update order in Firestore:', err);
    return false;
  }
};

// Firestore Realtime API for Cart
export const subscribeCart = (userId: string, callback: (items: CartItem[]) => void) => {
  if (!userId || !db) return () => {};
  try {
    const cartDocRef = doc(db, 'carts', userId);
    return onSnapshot(cartDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        callback(data.items || []);
      }
    }, (err) => {
      console.warn('Cart snapshot error:', err);
    });
  } catch (e) {
    return () => {};
  }
};

export const syncCartToFirestore = async (userId: string, items: CartItem[]) => {
  if (!userId || !db) return;
  try {
    const cartDocRef = doc(db, 'carts', userId);
    await setDoc(cartDocRef, {
      userId,
      items,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn('Cart sync error:', e);
  }
};

// Firestore Realtime API for Favorites
export const subscribeFavorites = (userId: string, callback: (productIds: number[]) => void) => {
  if (!userId || !db) return () => {};
  try {
    const favDocRef = doc(db, 'favorites', userId);
    return onSnapshot(favDocRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data().productIds || []);
      } else {
        callback([]);
      }
    }, (err) => {
      console.warn('Favorites snapshot error:', err);
    });
  } catch (e) {
    return () => {};
  }
};

export const toggleFavoriteInFirestore = async (userId: string, productId: number, currentList: number[]) => {
  if (!userId) return currentList;
  const exists = currentList.includes(productId);
  const nextList = exists ? currentList.filter(id => id !== productId) : [...currentList, productId];
  if (!db) return nextList;
  try {
    const favDocRef = doc(db, 'favorites', userId);
    await setDoc(favDocRef, {
      userId,
      productIds: nextList,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn('Toggle favorite error:', e);
  }
  return nextList;
};
