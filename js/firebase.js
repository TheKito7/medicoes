/* =========================================================
   ORÇAMENTO RÁPIDO - ENERGISA
   CONFIGURAÇÃO FIREBASE
========================================================= */


/* =========================================================
   IMPORTAÇÕES
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   CONFIGURAÇÃO FIREBASE
========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyCZ5tWSI8pHw1E3uOZl9xHdDazobKnFU9w",

    authDomain:
        "medicoes-28676.firebaseapp.com",

    projectId:
        "medicoes-28676",

    storageBucket:
        "medicoes-28676.firebasestorage.app",

    messagingSenderId:
        "718922445669",

    appId:
        "1:718922445669:web:c95575104470b3d3dee78c"

};


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

const app =
    initializeApp(
        firebaseConfig
    );


const auth =
    getAuth(app);


const db =
    getFirestore(app);


/* =========================================================
   EXPORTAÇÕES
========================================================= */

export {
    app,
    auth,
    db
};