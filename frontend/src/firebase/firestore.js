// firebase/firestore.js
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { getAuth, signInAnonymously } from 'firebase/auth';

// Import the existing Firebase app and services from the main firebase.js file
import app, { db } from '../firebase.js';

// Env flag for development logging
const isDev = process.env.NODE_ENV !== 'production' || process.env.REACT_APP_ENABLE_DEV === 'true';

// Ensure there is an authenticated Firebase user (anonymous if needed)
let _ensuringAuth = false;
const ensureFirebaseAuth = async () => {
  try {
    const auth = getAuth(app);
    if (auth.currentUser || _ensuringAuth) return;
    _ensuringAuth = true;
    await signInAnonymously(auth).catch((e) => {
      if (isDev) {
        // eslint-disable-next-line no-console
        console.warn('[Firestore] Anonymous auth failed (rules may require auth):', e?.message);
      }
    });
  } finally {
    _ensuringAuth = false;
  }
};

// ✅ Function to fetch collection
export const getCollection = async (collectionName) => {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ✅ Function to get a single document
export const getDocument = async (collectionName, docId) => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error('Document not found');
  }
};

// ✅ Function to add a document
export const addDocument = async (collectionName, data) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

// ✅ Function to update a document
export const updateDocument = async (collectionName, docId, data) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// ✅ Function to delete a document
export const deleteDocument = async (collectionName, docId) => {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
};

// ===== ORDER MANAGEMENT FUNCTIONS =====

// ✅ Create a new order
export const createOrder = async (orderData) => {
  // Make sure Firestore write has auth context (compatible with Supabase auth flow)
  await ensureFirebaseAuth();

  // Capture current Firebase auth UID to store on the order for rule checks
  const auth = getAuth(app);
  const authUid = auth.currentUser?.uid || null;

  const order = {
    ...orderData,
    authUid, // used by security rules for reads/writes by the same Firebase user
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    orderNumber: `ORD-${Date.now()}`,
    estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
  };

  try {
    const docRef = await addDoc(collection(db, 'orders'), order);
    return docRef.id;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[Firestore] createOrder failed:', e?.code || e?.name, e?.message);
    throw e;
  }
};

// ✅ Get orders by user ID
export const getUserOrders = async (userId) => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Sort by createdAt in JavaScript to avoid needing a composite index
  return orders.sort((a, b) => {
    const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
    const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
    return bTime - aTime; // Descending order (newest first)
  });
};

// ✅ Get order by ID
export const getOrderById = async (orderId) => {
  return await getDocument('orders', orderId);
};

// ✅ Update order status
export const updateOrderStatus = async (orderId, status) => {
  await updateDocument('orders', orderId, { status });
};

// ✅ Get all orders (for admin)
export const getAllOrders = async (limitCount = 50) => {
  const q = query(
    collection(db, 'orders'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ✅ Get orders by status
export const getOrdersByStatus = async (status) => {
  const q = query(
    collection(db, 'orders'),
    where('status', '==', status)
  );
  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Sort by createdAt in JavaScript to avoid needing a composite index
  return orders.sort((a, b) => {
    const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
    const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
    return bTime - aTime; // Descending order (newest first)
  });
};

// ✅ Real-time order tracking
export const subscribeToOrder = (orderId, callback) => {
  const docRef = doc(db, 'orders', orderId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};

// ✅ Real-time user orders tracking
export const subscribeToUserOrders = (userId, callback) => {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log('Firebase subscribeToUserOrders: Setting up query for userId:', userId);
  }
  // Proxy unsubscribe to keep the same return type while we ensure auth first
  let innerUnsub = () => {};

  (async () => {
    try {
      // Ensure there is an auth context before opening a watch stream (rules require signed-in user)
      await ensureFirebaseAuth();
      const auth = getAuth(app);
      const currentUid = auth.currentUser?.uid || null;

      // Prefer secure filter by authUid (the Firebase UID stored on the order).
      // Fallback to userId equality if authUid is not available (legacy data).
      const base = collection(db, 'orders');
      const q = currentUid
        ? query(base, where('authUid', '==', currentUid))
        : query(base, where('userId', '==', userId));
      innerUnsub = onSnapshot(q, (snapshot) => {
        if (isDev) {
          // eslint-disable-next-line no-console
          console.log('Firebase subscribeToUserOrders: Snapshot received, docs count:', snapshot.docs.length);
        }
        const orders = snapshot.docs.map(doc => {
          const data = { id: doc.id, ...doc.data() };
          if (isDev) {
            // eslint-disable-next-line no-console
            console.log('Firebase subscribeToUserOrders: Order doc:', doc.id, data);
          }
          return data;
        });
        // Sort by createdAt in JavaScript to avoid needing a composite index
        const sortedOrders = orders.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return bTime - aTime; // Descending order (newest first)
        });
        if (isDev) {
          // eslint-disable-next-line no-console
          console.log('Firebase subscribeToUserOrders: Returning sorted orders:', sortedOrders.length, 'orders');
        }
        callback(sortedOrders);
      }, (error) => {
        console.error('Firebase subscribeToUserOrders: Error in snapshot listener:', error);
      });
    } catch (e) {
      console.error('Firebase subscribeToUserOrders: Failed to ensure auth or attach listener:', e);
    }
  })();

  return () => {
    try { innerUnsub(); } catch (e) {}
  };
};

// ===== MENU FUNCTIONS =====

// ✅ Get menu items
export const getMenuItems = async () => {
  try {
    const items = await getCollection('menuItems');
    if (Array.isArray(items) && items.length > 0) return items;
  } catch (e) {
    // fall through to fallback
  }
  try {
    // Fallback to legacy collection name (lowercase)
    const items = await getCollection('menu');
    if (Array.isArray(items) && items.length > 0) return items;
  } catch (e) {
    // fall through
  }
  // Final fallback to capitalized collection name
  return await getCollection('Menu');
};

// ✅ Get menu item by ID
export const getMenuItem = async (itemId) => {
  return await getDocument('menuItems', itemId);
};

// ✅ Get popular menu items
export const getPopularMenuItems = async () => {
  try {
    // Try different possible collection names
    const possibleCollections = ['popularMenu', 'popular-menu', 'popular menu', 'popular_items', 'popularItems'];
    
    for (const collectionName of possibleCollections) {
      try {
        const items = await getCollection(collectionName);
        if (items && items.length > 0) {
          if (isDev) {
            // eslint-disable-next-line no-console
            console.log(`Found popular items in collection: ${collectionName}`, items);
          }
          // Ensure each item has a valid image URL
          return items.map(item => ({
            ...item,
            image: item.image || '/placeholder-dish.png' // Fallback image
          }));
        }
      } catch (e) {
        if (isDev) {
          // eslint-disable-next-line no-console
          console.log(`Collection ${collectionName} not found, trying next...`);
        }
      }
    }
    
    // If no collection found, return fallback data
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn('No popular menu items found in any collection. Using fallback data.');
    }
    return [
      {
        id: 'fallback-1',
        name: 'Chicken Biriyani',
        description: 'Aromatic chicken biriyani',
        price: 99,
        rating: 4.8,
        deliveryTime: '30-40 min',
        isVeg: false,
        image: '/chicken-biriyani.jpeg'
      },
      {
        id: 'fallback-2',
        name: 'Mutton Biriyani',
        description: 'Aromatic mutton biriyani',
        price: 179,
        rating: 4.7,
        deliveryTime: '25-35 min',
        isVeg: true,
        image: '/mutton-biriyani.jpeg'
      }
    ];
  } catch (error) {
    console.error('Error in getPopularMenuItems:', error);
    return [];
  }
};

// ===== OFFERS (PROMOTIONS) =====

// Get all offers
export const getOffers = async () => {
  return await getCollection('offers');
};

// Real-time offers subscription
export const subscribeToOffers = (callback) => {
  const colRef = collection(db, 'offers');
  return onSnapshot(colRef, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  });
};

// ===== USER FUNCTIONS =====

// ✅ Create or update user profile
export const saveUserProfile = async (userId, userData) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    // Update existing user
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  } else {
    // Create new user with userId as document ID
    await setDoc(userRef, {
      ...userData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
};

// ✅ Get user profile
export const getUserProfile = async (userId) => {
  // Ensure there is an auth context for rules that require signed-in users
  await ensureFirebaseAuth();
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }
  return null;
};

export { db };

// ===== APP STATUS (OPEN/CLOSE) =====

// Real-time subscription to app open/close status
export const subscribeToAppStatus = (callback) => {
  const statusRef = doc(db, 'settings', 'appStatus');
  return onSnapshot(statusRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback({ isOpen: data.isOpen !== false, message: data.message || '' });
    } else {
      // Default to open if doc missing
      callback({ isOpen: true, message: '' });
    }
  }, (error) => {
    console.error('[Firestore] subscribeToAppStatus error:', error);
    // On error, default to open to avoid blocking users
    callback({ isOpen: true, message: '' });
  });
};

// Update app open/close status
export const setAppStatus = async ({ isOpen, message }, user) => {
  await ensureFirebaseAuth();
  const statusRef = doc(db, 'settings', 'appStatus');
  await setDoc(statusRef, {
    isOpen: Boolean(isOpen),
    message: message || '',
    updatedAt: serverTimestamp(),
    updatedBy: user?.email || user?.uid || 'system'
  }, { merge: true });
};

// ===== SUPPORT (TICKETS) =====

// Create a support ticket
export const createSupportTicket = async (ticket) => {
  await ensureFirebaseAuth();
  const payload = {
    status: 'open',
    source: 'web',
    ...ticket,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, 'supportTickets'), payload);
  return ref.id;
};

// Get support tickets for a user
export const getUserSupportTickets = async (userId) => {
  const q = query(
    collection(db, 'supportTickets'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return items.sort((a, b) => {
    const at = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
    const bt = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
    return bt - at;
  });
};

// Subscribe to user's support tickets
export const subscribeToUserSupportTickets = (userId, callback) => {
  const q = query(
    collection(db, 'supportTickets'),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    const sorted = items.sort((a, b) => {
      const at = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
      const bt = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
      return bt - at;
    });
    callback(sorted);
  });
};
