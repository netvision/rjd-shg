import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDE5LoDKXT1CkVn5DNE4f4UZYUOQZMkOn4",
  authDomain: "rjdss-admin.firebaseapp.com",
  projectId: "rjdss-admin",
  storageBucket: "rjdss-admin.appspot.com",
  messagingSenderId: "1011102454506",
  appId: "1:1011102454506:web:98209b0f3709dcf4f0fd93",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default auth;
