import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAlqpz5ajb966umQS2kEdbQNr4PSWKpPgs",
  authDomain: "nyota-funds-e1170.firebaseapp.com",
  projectId: "nyota-funds-e1170",
  storageBucket: "nyota-funds-e1170.firebasestorage.app",
  messagingSenderId: "980970462070",
  appId: "1:980970462070:web:53e64d8a74d4823e65f857",
  measurementId: "G-L928C589HG"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);