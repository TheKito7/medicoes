/* =========================================================
   ORÇAMENTO RÁPIDO - ENERGISA
   DASHBOARD
========================================================= */


import {
    auth
} from "./firebase.js";


import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


import {
    getUsuarioSistema
} from "./authGuard.js";


/* =========================================================
   ELEMENTOS
========================================================= */

const sidebar =
    document.getElementById(
        "sidebar"
    );


const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );


const btnMenuMobile =
    document.getElementById(
        "btnMenuMobile"
    );


const btnSair =
    document.getElementById(
        "btnSair"
    );


/* =========================================================
   MENU MOBILE
========================================================= */

function abrirMenu() {

    sidebar.classList.add(
        "aberta"
    );


    sidebarOverlay.classList.add(
        "ativo"
    );


    document.body.style.overflow =
        "hidden";

}


function fecharMenu() {

    sidebar.classList.remove(
        "aberta"
    );


    sidebarOverlay.classList.remove(
        "ativo"
    );


    document.body.style.overflow =
        "";

}


if (btnMenuMobile) {

    btnMenuMobile.addEventListener(
        "click",
        abrirMenu
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        fecharMenu
    );

}


/* =========================================================
   DATA
========================================================= */

function atualizarData() {

    const elemento =
        document.getElementById(
            "dataAtual"
        );


    if (!elemento) {

        return;

    }


    const hoje =
        new Date();


    const texto =
        hoje.toLocaleDateString(
            "pt-BR",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );


    elemento.textContent =
        texto.charAt(0).toUpperCase() +
        texto.slice(1);

}


atualizarData();


/* =========================================================
   SAUDAÇÃO
========================================================= */

function atualizarSaudacao(
    usuario
) {

    if (!usuario) {

        return;

    }


    const elemento =
        document.getElementById(
            "saudacaoNome"
        );


    if (!elemento) {

        return;

    }


    const primeiroNome =
        String(
            usuario.nome || "Usuário"
        )
            .trim()
            .split(/\s+/)[0];


    elemento.textContent =
        primeiroNome;

}


/*
    Caso o usuário já esteja carregado.
*/

const usuarioAtual =
    getUsuarioSistema();


if (usuarioAtual) {

    atualizarSaudacao(
        usuarioAtual
    );

}


/*
    Caso o Firestore termine de carregar depois.
*/

window.addEventListener(
    "usuarioSistemaCarregado",
    function (event) {

        atualizarSaudacao(
            event.detail
        );

    }
);


/* =========================================================
   DADOS TEMPORÁRIOS
========================================================= */

/*
    Estes dados continuarão zerados até ligarmos
    a coleção "medicoes" do Firestore.
*/

const resumoDashboard = {

    totalMedicoes:
        0,

    emAnalise:
        0,

    aprovadas:
        0,

    valorMedido:
        0,

    rascunhos:
        0,

    enviadas:
        0,

    correcoes:
        0

};


/* =========================================================
   MOEDA
========================================================= */

function formatarMoeda(
    valor
) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style:
                "currency",

            currency:
                "BRL"
        }
    ).format(
        Number(valor) || 0
    );

}


/* =========================================================
   RENDERIZAR DASHBOARD
========================================================= */

function atualizarDashboard() {

    document.getElementById(
        "totalMedicoes"
    ).textContent =
        resumoDashboard.totalMedicoes;


    document.getElementById(
        "totalAnalise"
    ).textContent =
        resumoDashboard.emAnalise;


    document.getElementById(
        "totalAprovadas"
    ).textContent =
        resumoDashboard.aprovadas;


    document.getElementById(
        "valorMedido"
    ).textContent =
        formatarMoeda(
            resumoDashboard.valorMedido
        );


    document.getElementById(
        "resumoRascunho"
    ).textContent =
        resumoDashboard.rascunhos;


    document.getElementById(
        "resumoEnviado"
    ).textContent =
        resumoDashboard.enviadas;


    document.getElementById(
        "resumoAnalise"
    ).textContent =
        resumoDashboard.emAnalise;


    document.getElementById(
        "resumoCorrecao"
    ).textContent =
        resumoDashboard.correcoes;


    document.getElementById(
        "resumoAprovado"
    ).textContent =
        resumoDashboard.aprovadas;

}


atualizarDashboard();


/* =========================================================
   LOGOUT
========================================================= */

if (btnSair) {

    btnSair.addEventListener(
        "click",
        async function () {

            const confirmar =
                window.confirm(
                    "Deseja sair do sistema?"
                );


            if (!confirmar) {

                return;

            }


            try {

                await signOut(
                    auth
                );


                window.location.href =
                    "../index.html";


            } catch (erro) {

                console.error(
                    "Erro ao sair:",
                    erro
                );


                alert(
                    "Não foi possível sair do sistema."
                );

            }

        }
    );

}