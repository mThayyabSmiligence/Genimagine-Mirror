import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCpgU5-kS0MWvWKe2RUkxgR2GUs3ZSM5IY",
    authDomain: "genimagin-73d5c.firebaseapp.com",
    projectId: "genimagin-73d5c",
    storageBucket: "genimagin-73d5c.firebasestorage.app",
    messagingSenderId: "530108159843",
    appId: "1:530108159843:web:09f1a9e59b2a659a00e556"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();                        //is used to signin 

export {auth, provider};