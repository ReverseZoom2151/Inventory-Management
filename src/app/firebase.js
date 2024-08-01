import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDrv4LSuUqBo1HA9zazsiBYvWaJrXQIYsw",
    authDomain: "inventory-management-app-747b4.firebaseapp.com",
    projectId: "inventory-management-app-747b4",
    storageBucket: "inventory-management-app-747b4.appspot.com",
    messagingSenderId: "699447033430",
    appId: "1:699447033430:web:fc2a5a1344525db49785f7",
    measurementId: "G-G6V74E7JGQ"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { app, firestore };