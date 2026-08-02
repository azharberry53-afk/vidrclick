// Firebase Configuration for Vidr
const firebaseConfig = {
  apiKey: "AIzaSyC-Fj3cRkQVxIU0BaCTKzbUzij6AE6Bj_U",
  authDomain: "vird-click.firebaseapp.com",
  databaseURL: "https://vird-click-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vird-click",
  storageBucket: "vird-click.firebasestorage.app",
  messagingSenderId: "871198049588",
  appId: "1:871198049588:web:22643ccc0a4e7b0aa09161",
  measurementId: "G-NLKC6ERMTG"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const rtdb = firebase.database();

const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// New persistence API (replaces deprecated enableMultiTabIndexedDbPersistence)
try {
  db.enablePersistence({ synchronizeTabs: true }).catch(err => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not available');
    }
  });
} catch (e) {
  console.warn('Persistence setup failed:', e);
}

console.log('Firebase initialized successfully');
