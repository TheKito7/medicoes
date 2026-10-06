/* =========================================================
   ORÇAMENTO RÁPIDO - ENERGISA
   CONFIGURAÇÕES
========================================================= */

console.log(
    "configuracoes.js carregado"
);


/* =========================================================
   FIREBASE
========================================================= */

import {
    auth,
    db
} from "./firebase.js";


import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


import {
    getUsuarioSistema
} from "./authGuard.js";


/* =========================================================
   ELEMENTOS GERAIS
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
   INDICADORES
========================================================= */

const indicadorMedicoes =
    document.getElementById(
        "indicadorMedicoes"
    );


const indicadorPrestadores =
    document.getElementById(
        "indicadorPrestadores"
    );


const indicadorContratos =
    document.getElementById(
        "indicadorContratos"
    );


const indicadorUsuarios =
    document.getElementById(
        "indicadorUsuarios"
    );


/* =========================================================
   FORM
========================================================= */

const formConfiguracoes =
    document.getElementById(
        "formConfiguracoes"
    );


const nomeSistema =
    document.getElementById(
        "nomeSistema"
    );


const empresaSistema =
    document.getElementById(
        "empresaSistema"
    );


const subtituloSistema =
    document.getElementById(
        "subtituloSistema"
    );


const prefixoMedicao =
    document.getElementById(
        "prefixoMedicao"
    );


const anoReferencia =
    document.getElementById(
        "anoReferencia"
    );


const btnSalvarConfiguracoes =
    document.getElementById(
        "btnSalvarConfiguracoes"
    );


/* =========================================================
   CONTADOR
========================================================= */

const contadorAno =
    document.getElementById(
        "contadorAno"
    );


const contadorUltimoNumero =
    document.getElementById(
        "contadorUltimoNumero"
    );


const contadorProximaMedicao =
    document.getElementById(
        "contadorProximaMedicao"
    );


/* =========================================================
   AUDITORIA
========================================================= */

const configAtualizadoPor =
    document.getElementById(
        "configAtualizadoPor"
    );


const configAtualizadoEm =
    document.getElementById(
        "configAtualizadoEm"
    );


/* =========================================================
   ESTADO
========================================================= */

let configuracaoAtual =
    null;


let contadorAtual =
    null;


/* =========================================================
   MENU MOBILE
========================================================= */

btnMenuMobile?.addEventListener(
    "click",
    function () {

        sidebar?.classList.add(
            "aberta"
        );


        sidebarOverlay?.classList.add(
            "ativo"
        );

    }
);


sidebarOverlay?.addEventListener(
    "click",
    function () {

        sidebar?.classList.remove(
            "aberta"
        );


        sidebarOverlay?.classList.remove(
            "ativo"
        );

    }
);


/* =========================================================
   LOGOUT
========================================================= */

btnSair?.addEventListener(
    "click",
    async function () {

        const confirmar =
            confirm(
                "Deseja sair do sistema?"
            );


        if (!confirmar) {

            return;

        }


        await signOut(
            auth
        );


        window.location.href =
            "../index.html";

    }
);


/* =========================================================
   FORMATAR TIMESTAMP
========================================================= */

function formatarTimestamp(
    timestamp
) {

    if (
        !timestamp
        ||
        typeof timestamp.toDate !==
        "function"
    ) {

        return "-";

    }


    return timestamp
        .toDate()
        .toLocaleString(
            "pt-BR"
        );

}


/* =========================================================
   INDICADORES
========================================================= */

async function carregarIndicadores() {

    try {

        const [
            snapshotMedicoes,
            snapshotPrestadores,
            snapshotContratos,
            snapshotUsuarios
        ] =
            await Promise.all(
                [

                    getDocs(
                        collection(
                            db,
                            "medicoes"
                        )
                    ),

                    getDocs(
                        collection(
                            db,
                            "prestadores"
                        )
                    ),

                    getDocs(
                        collection(
                            db,
                            "contratos"
                        )
                    ),

                    getDocs(
                        collection(
                            db,
                            "usuarios"
                        )
                    )

                ]
            );


        indicadorMedicoes.textContent =
            snapshotMedicoes.size;


        indicadorPrestadores.textContent =
            snapshotPrestadores.size;


        indicadorContratos.textContent =
            snapshotContratos.size;


        indicadorUsuarios.textContent =
            snapshotUsuarios.size;


    } catch (erro) {

        console.error(
            "Erro ao carregar indicadores:",
            erro
        );

    }

}


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

async function carregarConfiguracoes() {

    try {

        const referencia =
            doc(
                db,
                "configuracoes",
                "sistema"
            );


        const snapshot =
            await getDoc(
                referencia
            );


        if (
            snapshot.exists()
        ) {

            configuracaoAtual =
                snapshot.data();

        } else {

            configuracaoAtual = {

                nomeSistema:
                    "Orçamento Rápido",

                empresa:
                    "Grupo Energisa",

                subtitulo:
                    "Gestão de Serviços",

                prefixoMedicao:
                    "MED"

            };

        }


        nomeSistema.value =
            configuracaoAtual.nomeSistema ||
            "Orçamento Rápido";


        empresaSistema.value =
            configuracaoAtual.empresa ||
            "Grupo Energisa";


        subtituloSistema.value =
            configuracaoAtual.subtitulo ||
            "Gestão de Serviços";


        prefixoMedicao.value =
            configuracaoAtual.prefixoMedicao ||
            "MED";


        configAtualizadoPor.textContent =
            configuracaoAtual.atualizadoPorNome ||
            "-";


        configAtualizadoEm.textContent =
            formatarTimestamp(
                configuracaoAtual.atualizadoEm
            );


    } catch (erro) {

        console.error(
            "Erro ao carregar configurações:",
            erro
        );

    }

}


/* =========================================================
   CONTADOR
========================================================= */

async function carregarContador() {

    const anoAtual =
        new Date().getFullYear();


    const idContador =
        `medicoes_${anoAtual}`;


    try {

        const referencia =
            doc(
                db,
                "contadores",
                idContador
            );


        const snapshot =
            await getDoc(
                referencia
            );


        if (
            snapshot.exists()
        ) {

            contadorAtual =
                snapshot.data();

        } else {

            contadorAtual = {

                ano:
                    anoAtual,

                ultimoNumero:
                    0

            };

        }


        const ano =
            contadorAtual.ano ||
            anoAtual;


        const ultimoNumero =
            Number(
                contadorAtual.ultimoNumero
            ) || 0;


        const proximoNumero =
            ultimoNumero +
            1;


        const prefixo =
            configuracaoAtual?.prefixoMedicao ||
            "MED";


        contadorAno.textContent =
            ano;


        contadorUltimoNumero.textContent =
            String(
                ultimoNumero
            ).padStart(
                4,
                "0"
            );


        contadorProximaMedicao.textContent =
            `${prefixo}-${ano}-${String(
                proximoNumero
            ).padStart(
                4,
                "0"
            )}`;


        anoReferencia.value =
            ano;


    } catch (erro) {

        console.error(
            "Erro ao carregar contador:",
            erro
        );


        contadorAno.textContent =
            "-";


        contadorUltimoNumero.textContent =
            "-";


        contadorProximaMedicao.textContent =
            "-";

    }

}


/* =========================================================
   SALVAR CONFIGURAÇÕES
========================================================= */

formConfiguracoes?.addEventListener(
    "submit",
    async function (
        evento
    ) {

        evento.preventDefault();


        const usuario =
            getUsuarioSistema();


        if (
            usuario?.perfil !==
            "administrador"
        ) {

            alert(
                "Somente administradores podem alterar as configurações."
            );


            return;

        }


        const prefixo =
            prefixoMedicao.value
                .trim()
                .toUpperCase()
                .replace(
                    /[^A-Z0-9_-]/g,
                    ""
                );


        if (
            !prefixo
        ) {

            alert(
                "Informe um prefixo válido para as medições."
            );


            prefixoMedicao.focus();


            return;

        }


        btnSalvarConfiguracoes.disabled =
            true;


        const textoOriginal =
            btnSalvarConfiguracoes.innerHTML;


        btnSalvarConfiguracoes.innerHTML = `

            <i class="bx bx-loader-alt bx-spin"></i>

            Salvando...

        `;


        try {

            const dados = {

                nomeSistema:
                    nomeSistema.value.trim() ||
                    "Orçamento Rápido",

                empresa:
                    empresaSistema.value.trim() ||
                    "Grupo Energisa",

                subtitulo:
                    subtituloSistema.value.trim() ||
                    "Gestão de Serviços",

                prefixoMedicao:
                    prefixo,

                atualizadoPorUid:
                    usuario.uid,

                atualizadoPorNome:
                    usuario.nome ||
                    "",

                atualizadoEm:
                    serverTimestamp()

            };


            await setDoc(
                doc(
                    db,
                    "configuracoes",
                    "sistema"
                ),
                dados,
                {
                    merge:
                        true
                }
            );


            prefixoMedicao.value =
                prefixo;


            alert(
                "Configurações salvas com sucesso."
            );


            await carregarConfiguracoes();

            await carregarContador();


        } catch (erro) {

            console.error(
                "Erro ao salvar configurações:",
                erro
            );


            if (
                erro.code ===
                "permission-denied"
            ) {

                alert(
                    "O Firestore bloqueou a gravação das configurações. Será necessário liberar a coleção configuracoes nas regras."
                );

            } else {

                alert(
                    "Não foi possível salvar as configurações."
                );

            }


        } finally {

            btnSalvarConfiguracoes.disabled =
                false;


            btnSalvarConfiguracoes.innerHTML =
                textoOriginal;

        }

    }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function inicializar() {

    const usuario =
        getUsuarioSistema();


    if (
        usuario?.perfil !==
        "administrador"
    ) {

        window.location.href =
            "dashboard.html";


        return;

    }


    await Promise.all(
        [

            carregarIndicadores(),

            carregarConfiguracoes()

        ]
    );


    /*
        Carregamos o contador depois,
        pois ele utiliza o prefixo da configuração.
    */

    await carregarContador();

}


const usuarioInicial =
    getUsuarioSistema();


if (
    usuarioInicial
) {

    inicializar();

} else {

    window.addEventListener(
        "usuarioSistemaCarregado",
        inicializar,
        {
            once:
                true
        }
    );

}