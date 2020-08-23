import * as firebase from 'firebase'
require('@firebase/firestore')
var firebaseConfig = {
    apiKey: "AIzaSyAjzk38gs5z2bJPidtNROFwYD7GsWzqh6k",
    authDomain: "library-app-2d2f7.firebaseapp.com",
    databaseURL: "https://library-app-2d2f7.firebaseio.com",
    projectId: "library-app-2d2f7",
    storageBucket: "library-app-2d2f7.appspot.com",
    messagingSenderId: "900276963055",
    appId: "1:900276963055:web:fd2363416aac2e12e4bd1a"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore();