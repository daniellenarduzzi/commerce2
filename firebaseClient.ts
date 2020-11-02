import firebase from 'firebase/app';
import 'firebase/firestore';

const loadFirebase = () => {
  try {
    const config  = {
        apiKey: "AIzaSyCUSCJSej37Ronl9qwL7nTHeGpANXWtFm4",
        authDomain: "pilardecotest.firebaseapp.com",
        databaseURL: "https://pilardecotest.firebaseio.com",
        projectId: "pilardecotest",
        storageBucket: "pilardecotest.appspot.com",
        messagingSenderId: "870066878275",
        appId: "1:870066878275:web:fc89df24f1f05f45c021f6",
        measurementId: "G-PYLT95N95Z"
      };
    firebase.initializeApp(config);
  } catch (error) {
    if (!/already exist/.test(error.message)) {
      console.error('Firebase initialization error', error.stack);
    }
  }
  return firebase;
};

loadFirebase()

export default firebase;