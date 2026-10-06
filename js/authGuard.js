/* =========================================================
   ORÇAMENTO RÁPIDO - ENERGISA
   AUTENTICAÇÃO E PERFIL DO USUÁRIO
========================================================= */

console.log(
    "authGuard.js carregado"
);


/* =========================================================
   FIREBASE
========================================================= */

import {
    auth,
    db
} from "./firebase.js";


import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   USUÁRIO DO SISTEMA
========================================================= */

let usuarioSistema = null;


/* =========================================================
   GERAR INICIAIS
========================================================= */

function gerarIniciais(nome) {

    if (!nome) {
        return "US";
    }


    const partes =
        String(nome)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (partes.length === 0) {
        return "US";
    }


    if (partes.length === 1) {

        return partes[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        partes[0][0] +
        partes[partes.length - 1][0]
    ).toUpperCase();

}


/* =========================================================
   FORMATAR PERFIL
========================================================= */

function formatarPerfil(perfil) {

    const perfis = {

        administrador:
            "Administrador",

        prestador:
            "Prestador",

        colaborador:
            "Colaborador"

    };


    return (
        perfis[perfil] ||
        perfil ||
        "Usuário"
    );

}


/* =========================================================
   ATUALIZAR DADOS VISUAIS DO USUÁRIO
========================================================= */

function atualizarInterfaceUsuario(
    dadosUsuario
) {

    const nome =
        dadosUsuario.nome ||
        "Usuário";


    const perfil =
        formatarPerfil(
            dadosUsuario.perfil
        );


    const iniciais =
        gerarIniciais(
            nome
        );


    /* =====================================================
       SIDEBAR - NOME
    ====================================================== */

    document
        .querySelectorAll(
            ".dados-usuario strong"
        )
        .forEach(
            function (elemento) {

                elemento.textContent =
                    nome;

            }
        );


    /* =====================================================
       SIDEBAR - PERFIL
    ====================================================== */

    document
        .querySelectorAll(
            ".dados-usuario span"
        )
        .forEach(
            function (elemento) {

                elemento.textContent =
                    perfil;

            }
        );


    /* =====================================================
       SIDEBAR - AVATAR
    ====================================================== */

    document
        .querySelectorAll(
            ".avatar-usuario"
        )
        .forEach(
            function (elemento) {

                elemento.textContent =
                    iniciais;

            }
        );


    /* =====================================================
       HEADER - NOME
    ====================================================== */

    document
        .querySelectorAll(
            ".header-dados-usuario strong"
        )
        .forEach(
            function (elemento) {

                elemento.textContent =
                    nome;

            }
        );


    /* =====================================================
       HEADER - PERFIL
    ====================================================== */

    document
        .querySelectorAll(
            ".header-dados-usuario span"
        )
        .forEach(
            function (elemento) {

                elemento.textContent =
                    perfil;

            }
        );


    /* =====================================================
       HEADER - AVATAR
    ====================================================== */

    document
        .querySelectorAll(
            ".header-avatar"
        )
        .forEach(
            function (elemento) {

                elemento.textContent =
                    iniciais;

            }
        );


    /* =====================================================
       PERFIL NO BODY
    ====================================================== */

    document.body.dataset.perfil =
        dadosUsuario.perfil || "";

}


/* =========================================================
   PERMISSÕES VISUAIS
========================================================= */

function aplicarPermissoesInterface(
    dadosUsuario
) {

    const perfil =
        dadosUsuario.perfil;


    const elementosAdmin =
        document.querySelectorAll(
            "[data-admin-only]"
        );


    elementosAdmin.forEach(
        function (elemento) {

            if (
                perfil ===
                "administrador"
            ) {

                elemento.style.display =
                    "";

            } else {

                elemento.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   BLOQUEAR ACESSO
========================================================= */

async function bloquearAcesso(
    mensagem
) {

    console.warn(
        "Acesso bloqueado:",
        mensagem
    );


    try {

        await signOut(auth);

    } catch (erro) {

        console.error(
            "Erro ao encerrar sessão:",
            erro
        );

    }


    alert(
        mensagem
    );


    window.location.href =
        "../index.html";

}


/* =========================================================
   CARREGAR PERFIL DO FIRESTORE
========================================================= */

async function carregarPerfilUsuario(
    usuarioFirebase
) {

    console.log(
        "======================================"
    );

    console.log(
        "CARREGANDO PERFIL DO USUÁRIO"
    );

    console.log(
        "E-mail autenticado:",
        usuarioFirebase.email
    );

    console.log(
        "UID autenticado:",
        usuarioFirebase.uid
    );

    console.log(
        "Caminho procurado:",
        `usuarios/${usuarioFirebase.uid}`
    );

    console.log(
        "======================================"
    );


    try {

        /* =================================================
           REFERÊNCIA DO DOCUMENTO
        ================================================= */

        const referenciaUsuario =
            doc(
                db,
                "usuarios",
                usuarioFirebase.uid
            );


        console.log(
            "Consultando Firestore..."
        );


        /* =================================================
           BUSCAR DOCUMENTO
        ================================================= */

        const documentoUsuario =
            await getDoc(
                referenciaUsuario
            );


        console.log(
            "Consulta ao Firestore concluída."
        );


        console.log(
            "Documento encontrado:",
            documentoUsuario.exists()
        );


        /* =================================================
           DOCUMENTO NÃO EXISTE
        ================================================= */

        if (
            !documentoUsuario.exists()
        ) {

            console.error(
                "Perfil não encontrado."
            );


            console.error(
                "Firestore procurou exatamente:"
            );


            console.error(
                `usuarios/${usuarioFirebase.uid}`
            );


            await bloquearAcesso(
                "Seu usuário não possui perfil cadastrado no sistema."
            );


            return;

        }


        /* =================================================
           DADOS DO DOCUMENTO
        ================================================= */

        const dados =
            documentoUsuario.data();


        console.log(
            "Dados encontrados no Firestore:",
            dados
        );


        /* =================================================
           VERIFICAR CAMPO ATIVO
        ================================================= */

        if (
            dados.ativo !== true
        ) {

            console.warn(
                "Usuário encontrado, mas está inativo."
            );


            await bloquearAcesso(
                "Seu acesso ao sistema está desativado."
            );


            return;

        }


        /* =================================================
           VERIFICAR PERFIL
        ================================================= */

        if (
            !dados.perfil
        ) {

            console.error(
                "O documento do usuário não possui o campo perfil."
            );


            await bloquearAcesso(
                "Seu perfil de acesso não está configurado corretamente."
            );


            return;

        }


        /* =================================================
           MONTAR USUÁRIO DO SISTEMA
        ================================================= */

        usuarioSistema = {

            uid:
                usuarioFirebase.uid,

            email:
                usuarioFirebase.email,

            nome:
                dados.nome ||
                usuarioFirebase.email ||
                "Usuário",

            perfil:
                dados.perfil,

            ativo:
                dados.ativo,

            ...dados

        };


        console.log(
            "Usuário do sistema montado:",
            usuarioSistema
        );


        /* =================================================
           ATUALIZAR INTERFACE
        ================================================= */

        atualizarInterfaceUsuario(
            usuarioSistema
        );


        aplicarPermissoesInterface(
            usuarioSistema
        );


        /* =================================================
           AVISAR OUTROS ARQUIVOS JS
        ================================================= */

        window.dispatchEvent(
            new CustomEvent(
                "usuarioSistemaCarregado",
                {
                    detail:
                        usuarioSistema
                }
            )
        );


        console.log(
            "======================================"
        );

        console.log(
            "LOGIN E PERFIL CARREGADOS COM SUCESSO"
        );

        console.log(
            "Nome:",
            usuarioSistema.nome
        );

        console.log(
            "Perfil:",
            usuarioSistema.perfil
        );

        console.log(
            "UID:",
            usuarioSistema.uid
        );

        console.log(
            "======================================"
        );


    } catch (erro) {

        console.error(
            "======================================"
        );

        console.error(
            "ERRO AO CARREGAR PERFIL"
        );

        console.error(
            "Código:",
            erro.code
        );

        console.error(
            "Mensagem:",
            erro.message
        );

        console.error(
            "Erro completo:",
            erro
        );

        console.error(
            "======================================"
        );


        /*
            NÃO confundimos documento inexistente
            com erro de permissão/conexão.
        */

        if (
            erro.code ===
            "permission-denied"
        ) {

            await bloquearAcesso(
                "O Firestore bloqueou a leitura do seu perfil. Verifique as regras de segurança."
            );


            return;

        }


        if (
            erro.code ===
            "unavailable"
        ) {

            await bloquearAcesso(
                "Não foi possível conectar ao banco de dados."
            );


            return;

        }


        await bloquearAcesso(
            "Não foi possível carregar seu perfil de acesso."
        );

    }

}


/* =========================================================
   MONITORAR ESTADO DA AUTENTICAÇÃO
========================================================= */

onAuthStateChanged(
    auth,
    async function (
        usuarioFirebase
    ) {

        console.log(
            "======================================"
        );

        console.log(
            "ESTADO DA AUTENTICAÇÃO"
        );


        if (
            usuarioFirebase
        ) {

            console.log(
                "Usuário autenticado no Firebase Auth."
            );


            console.log(
                "E-mail:",
                usuarioFirebase.email
            );


            console.log(
                "UID:",
                usuarioFirebase.uid
            );


            console.log(
                "======================================"
            );


            await carregarPerfilUsuario(
                usuarioFirebase
            );


            return;

        }


        console.log(
            "Nenhum usuário autenticado."
        );


        console.log(
            "======================================"
        );


        window.location.href =
            "../index.html";

    }
);


/* =========================================================
   RETORNAR USUÁRIO PARA OUTROS ARQUIVOS
========================================================= */

export function getUsuarioSistema() {

    return usuarioSistema;

}