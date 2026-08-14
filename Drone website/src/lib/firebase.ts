import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    if (user) {
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          displayName: user.displayName || "EID Officer",
          email: user.email || "",
          photoURL: user.photoURL || "",
          role: "Environmental Intelligence Officer",
          lastLogin: new Date().toISOString(),
        },
        { merge: true }
      );

      // Log login activity
      await addDoc(collection(db, "user_activities"), {
        userId: user.uid,
        action: "SIGN_IN",
        details: `Signed in via Google OAuth (${user.email})`,
        timestamp: new Date().toISOString(),
      });
    }
    return user;
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const saveUserActivityLog = async (userId: string, action: string, details: string) => {
  try {
    await addDoc(collection(db, "user_activities"), {
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to save activity log to Firestore:", err);
  }
};

export const saveAlertResolutionFirestore = async (
  alertId: string,
  userId: string,
  userEmail: string,
  resolutionNote: string
) => {
  try {
    await addDoc(collection(db, "alert_resolutions"), {
      alertId,
      userId,
      userEmail,
      resolutionNote,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to save alert resolution to Firestore:", err);
  }
};

export type { User };
