// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// import {
// getAuth
// } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// import {
// getFirestore
// } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// const firebaseConfig = {
//   apiKey: "AIzaSyC6c3tPhAsQEE9frAWatyYoU3DvHSisdKM",
//   authDomain: "device-control-platform-8335d.firebaseapp.com",
//   projectId: "device-control-platform-8335d",
//   storageBucket: "device-control-platform-8335d.firebasestorage.app",
//   messagingSenderId: "978497230352",
//   appId: "1:978497230352:web:2d40fe35fdcef0bdfc5c95"
// };


// const app = initializeApp(firebaseConfig);

// const auth = getAuth(app);

// const db = getFirestore(app);

// export { auth, db };

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6c3tPhAsQEE9frAWatyYoU3DvHSisdKM",
  authDomain: "device-control-platform-8335d.firebaseapp.com",
  projectId: "device-control-platform-8335d",
  storageBucket: "device-control-platform-8335d.firebasestorage.app",
  messagingSenderId: "978497230352",
  appId: "1:978497230352:web:2d40fe35fdcef0bdfc5c95"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export { auth, db };