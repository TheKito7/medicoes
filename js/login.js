/* =========================================================
   ORÇAMENTO RÁPIDO - ENERGISA
   LOGIN
========================================================= */


import {
    auth
} from "./firebase.js";


import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


/* =========================================================
   ELEMENTOS
========================================================= */

const formLogin =
    document.getElementById(
        "formLogin"
    );


const inputEmail =
    document.getElementById(
        "email"
    );


const inputSenha =
    document.getElementById(
        "senha"
    );


const btnMostrarSenha =
    document.getElementById(
        "btnMostrarSenha"
    );


const btnEntrar =
    document.getElementById(
        "btnEntrar"
    );


const mensagemLogin =
    document.getElementById(
        "mensagemLogin"
    );


/* =========================================================
   MOSTRAR SENHA
========================================================= */

btnMostrarSenha.addEventListener(
    "click",
    function () {

        const icone =
            btnMostrarSenha
                .querySelector("i");


        if (
            inputSenha.type ===
            "password"
        ) {

            inputSenha.type =
                "text";


            icone.classList.remove(
                "bx-hide"
            );


            icone.classList.add(
                "bx-show"
            );


            btnMostrarSenha.setAttribute(
                "aria-label",
                "Ocultar senha"
            );

        } else {

            inputSenha.type =
                "password";


            icone.classList.remove(
                "bx-show"
            );


            icone.classList.add(
                "bx-hide"
            );


            btnMostrarSenha.setAttribute(
                "aria-label",
                "Mostrar senha"
            );

        }

    }
);


/* =========================================================
   MENSAGENS
========================================================= */

function mostrarErro(
    mensagem
) {

    mensagemLogin.textContent =
        mensagem;


    mensagemLogin.classList.add(
        "erro"
    );

}


function limparErro() {

    mensagemLogin.textContent =
        "";


    mensagemLogin.classList.remove(
        "erro"
    );

}


/* =========================================================
   CARREGAMENTO
========================================================= */

function ativarCarregamento() {

    btnEntrar.disabled =
        true;


    btnEntrar.classList.add(
        "carregando"
    );


    btnEntrar.innerHTML = `

        <i class="bx bx-loader-alt bx-spin"></i>

        <span>
            Entrando...
        </span>

    `;

}


function removerCarregamento() {

    btnEntrar.disabled =
        false;


    btnEntrar.classList.remove(
        "carregando"
    );


    btnEntrar.innerHTML = `

        <span>
            Entrar
        </span>

        <i class="bx bx-right-arrow-alt"></i>

    `;

}


/* =========================================================
   LOGIN
========================================================= */

formLogin.addEventListener(
    "submit",
    async function (
        event
    ) {

        event.preventDefault();


        limparErro();


        const email =
            inputEmail.value.trim();


        const senha =
            inputSenha.value;


        if (!email) {

            mostrarErro(
                "Informe o e-mail."
            );

            inputEmail.focus();

            return;

        }


        if (!senha) {

            mostrarErro(
                "Informe a senha."
            );

            inputSenha.focus();

            return;

        }


        ativarCarregamento();


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                senha
            );


            window.location.href =
                "paginas/dashboard.html";


        } catch (erro) {

            console.error(
                "Erro no login:",
                erro
            );


            removerCarregamento();


            tratarErroFirebase(
                erro.code
            );

        }

    }
);


/* =========================================================
   ERROS
========================================================= */

function tratarErroFirebase(
    codigo
) {

    let mensagem =
        "Não foi possível acessar o sistema.";


    switch (codigo) {

        case "auth/invalid-email":

            mensagem =
                "O e-mail informado é inválido.";

            break;


        case "auth/invalid-credential":

            mensagem =
                "E-mail ou senha incorretos.";

            break;


        case "auth/user-disabled":

            mensagem =
                "Este usuário está desativado.";

            break;


        case "auth/too-many-requests":

            mensagem =
                "Muitas tentativas. Aguarde alguns minutos.";

            break;


        case "auth/network-request-failed":

            mensagem =
                "Não foi possível conectar. Verifique sua internet.";

            break;

    }


    mostrarErro(
        mensagem
    );

}


/* =========================================================
   LIMPAR ERROS
========================================================= */

inputEmail.addEventListener(
    "input",
    limparErro
);


inputSenha.addEventListener(
    "input",
    limparErro
);


/* =========================================================
   USUÁRIO JÁ AUTENTICADO
========================================================= */

onAuthStateChanged(
    auth,
    function (
        usuario
    ) {

        if (usuario) {

            window.location.href =
                "paginas/dashboard.html";

        }

    }
);