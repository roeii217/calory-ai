'use client';
import { create } from 'zustand';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAppStore } from './store';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  syncFromCloud: (uid: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  
  syncFromCloud: async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.store) {
          useAppStore.setState({
            meals: data.store.meals || [],
            goals: data.store.goals || { calories: 2000, protein: 150, carbs: 250, fat: 65 },
          });
        }
      }
    } catch (err) {
      console.error('Error syncing from cloud:', err);
    }
  },
  signOut: async () => {
    try {
      await auth.signOut();
      useAuthStore.getState().setUser(null);
    } catch(err) {}
  }
}));

// Set up Firebase auth listener and persist local store to Firebase
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (user) => {
    const store = useAuthStore.getState();
    store.setUser(user);
    store.setLoading(false);
    
    if (user) {
      // User just logged in -> load their cloud data into Zustand!
      await store.syncFromCloud(user.uid);
    }
  });

  // Debounced auto-save to Firestore whenever the Zustand app store changes
  let saveTimer: NodeJS.Timeout | null = null;
  useAppStore.subscribe((state) => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const authUser = auth.currentUser;
      if (authUser) {
        try {
          await setDoc(doc(db, 'users', authUser.uid), {
            store: {
              meals: state.meals,
              goals: state.goals,
            },
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (err) {
          console.error('Failed to save to cloud:', err);
        }
      }
    }, 2500); // 2.5 seconds debounce
  });
}
