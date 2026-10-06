/* =========================================================
   ORÇAMENTO RÁPIDO
   LISTAGEM DE MEDIÇÕES
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
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


import {
    getUsuarioSistema
} from "./authGuard.js";


/* =========================================================
   ELEMENTOS
========================================================= */

const corpoTabela =
    document.getElementById(
        "corpoTabelaMedicoes"
    );


const estadoVazio =
    document.getElementById(
        "estadoVazio"
    );


const pesquisaMedicao =
    document.getElementById(
        "pesquisaMedicao"
    );


const filtroStatus =
    document.getElementById(
        "filtroStatus"
    );


const indicadorTotal =
    document.getElementById(
        "indicadorTotal"
    );


const indicadorRascunhos =
    document.getElementById(
        "indicadorRascunhos"
    );


const indicadorEnviadas =
    document.getElementById(
        "indicadorEnviadas"
    );


const indicadorValor =
    document.getElementById(
        "indicadorValor"
    );


const btnSair =
    document.getElementById(
        "btnSair"
    );


const btnMenuMobile =
    document.getElementById(
        "btnMenuMobile"
    );


const sidebar =
    document.getElementById(
        "sidebar"
    );


const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );


/* =========================================================
   ESTADO
========================================================= */

let medicoesSistema =
    [];


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatarMoeda(valor) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    ).format(
        Number(valor) || 0
    );

}


function formatarData(data) {

    if (!data) {
        return "-";
    }


    const partes =
        String(data)
            .split("-");


    if (
        partes.length !== 3
    ) {

        return data;

    }


    return (
        `${partes[2]}/${partes[1]}/${partes[0]}`
    );

}


/* =========================================================
   STATUS
========================================================= */

function obterStatus(status) {

    const dados = {

        rascunho: {
            texto:
                "Rascunho",

            classe:
                "status-rascunho"
        },


        enviado: {
            texto:
                "Aguardando análise",

            classe:
                "status-enviado"
        },


        em_analise: {
            texto:
                "Em análise",

            classe:
                "status-analise"
        },


        aprovado: {
            texto:
                "Aprovado",

            classe:
                "status-aprovado"
        },


        correcao: {
            texto:
                "Correção solicitada",

            classe:
                "status-correcao"
        },


        reprovado: {
            texto:
                "Reprovado",

            classe:
                "status-reprovado"
        }

    };


    return (
        dados[status]
        ||
        {
            texto:
                status ||
                "Sem status",

            classe:
                "status-rascunho"
        }
    );

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   TIMESTAMP
========================================================= */

function obterTimestamp(medicao) {

    if (
        medicao.criadoEm
        &&
        typeof medicao.criadoEm.toMillis ===
        "function"
    ) {

        return (
            medicao.criadoEm.toMillis()
        );

    }


    if (
        medicao.dataServico
    ) {

        return new Date(
            `${medicao.dataServico}T00:00:00`
        ).getTime();

    }


    return 0;

}


/* =========================================================
   CARREGAR MEDIÇÕES
========================================================= */

async function carregarMedicoes() {

    corpoTabela.innerHTML = `

        <tr>

            <td
                colspan="7"
                class="carregando"
            >
                Carregando medições...
            </td>

        </tr>

    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "medicoes"
                )
            );


        medicoesSistema = [];


        snapshot.forEach(
            function (documento) {

                medicoesSistema.push({

                    id:
                        documento.id,

                    ...documento.data()

                });

            }
        );


        const usuario =
            getUsuarioSistema();


        /*
            PRESTADOR VÊ SOMENTE
            AS PRÓPRIAS MEDIÇÕES
        */

        if (
            usuario
            &&
            usuario.perfil ===
            "prestador"
        ) {

            medicoesSistema =
                medicoesSistema.filter(
                    function (medicao) {

                        return (
                            medicao.prestadorId ===
                            usuario.prestadorId
                        );

                    }
                );

        }


        medicoesSistema.sort(
            function (a, b) {

                return (
                    obterTimestamp(b)
                    -
                    obterTimestamp(a)
                );

            }
        );


        atualizarIndicadores();

        aplicarFiltros();


    } catch (erro) {

        console.error(
            "Erro ao carregar medições:",
            erro
        );


        corpoTabela.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="erro-carregamento"
                >
                    Não foi possível carregar as medições.
                </td>

            </tr>

        `;

    }

}


/* =========================================================
   INDICADORES
========================================================= */

function atualizarIndicadores() {

    const total =
        medicoesSistema.length;


    const rascunhos =
        medicoesSistema.filter(
            function (medicao) {

                return (
                    medicao.status ===
                    "rascunho"
                );

            }
        ).length;


    const enviadas =
        medicoesSistema.filter(
            function (medicao) {

                return (
                    medicao.status ===
                    "enviado"
                );

            }
        ).length;


    const valor =
        medicoesSistema.reduce(
            function (
                acumulador,
                medicao
            ) {

                return (
                    acumulador
                    +
                    (
                        Number(
                            medicao.valorTotal
                        ) || 0
                    )
                );

            },
            0
        );


    indicadorTotal.textContent =
        total;


    indicadorRascunhos.textContent =
        rascunhos;


    indicadorEnviadas.textContent =
        enviadas;


    indicadorValor.textContent =
        formatarMoeda(
            valor
        );

}


/* =========================================================
   FILTROS
========================================================= */

function aplicarFiltros() {

    const termo =
        pesquisaMedicao
            .value
            .trim()
            .toLowerCase();


    const status =
        filtroStatus.value;


    const filtradas =
        medicoesSistema.filter(
            function (medicao) {

                const texto = [

                    medicao.numeroMedicao,

                    medicao.prestadorNome,

                    medicao.cidade,

                    medicao.localidade,

                    medicao.contratoNumero,

                    medicao.responsavel

                ]
                    .join(" ")
                    .toLowerCase();


                const correspondePesquisa =
                    !termo
                    ||
                    texto.includes(
                        termo
                    );


                const correspondeStatus =
                    !status
                    ||
                    medicao.status ===
                    status;


                return (
                    correspondePesquisa
                    &&
                    correspondeStatus
                );

            }
        );


    renderizarMedicoes(
        filtradas
    );

}


/* =========================================================
   RENDERIZAR MEDIÇÕES
========================================================= */

function renderizarMedicoes(
    medicoes
) {

    corpoTabela.innerHTML =
        "";


    if (
        medicoes.length === 0
    ) {

        estadoVazio.classList.remove(
            "oculto"
        );


        return;

    }


    estadoVazio.classList.add(
        "oculto"
    );


    medicoes.forEach(
        function (medicao) {

            const status =
                obterStatus(
                    medicao.status
                );


            const numeroMedicao =
                medicao.numeroMedicao
                ||
                "Sem numeração";


            const linha =
                document.createElement(
                    "tr"
                );


            linha.innerHTML = `

                <td>

                    <div class="medicao-id">

                        <strong>
                            ${escaparHTML(
                                numeroMedicao
                            )}
                        </strong>

                        <span>
                            Contrato ${escaparHTML(
                                medicao.contratoNumero ||
                                "-"
                            )}
                        </span>

                    </div>

                </td>


                <td>

                    ${escaparHTML(
                        medicao.prestadorNome ||
                        "-"
                    )}

                </td>


                <td>

                    <div class="localidade">

                        <strong>
                            ${escaparHTML(
                                medicao.localidade ||
                                "-"
                            )}
                        </strong>

                        <span>
                            ${escaparHTML(
                                medicao.cidade ||
                                "-"
                            )}
                        </span>

                    </div>

                </td>


                <td>

                    ${formatarData(
                        medicao.dataServico
                    )}

                </td>


                <td>

                    <span
                        class="status-medicao ${status.classe}"
                    >
                        ${escaparHTML(
                            status.texto
                        )}
                    </span>

                </td>


                <td>

                    <strong
                        class="valor-medicao"
                    >
                        ${formatarMoeda(
                            medicao.valorTotal
                        )}
                    </strong>

                </td>


                <td>

                    <a
                        href="detalhes-medicao.html?id=${encodeURIComponent(
                            medicao.id
                        )}"
                        class="btn-visualizar"
                        title="Visualizar medição"
                    >

                        <i class="bx bx-show"></i>

                    </a>

                </td>

            `;


            corpoTabela.appendChild(
                linha
            );

        }
    );

}


/* =========================================================
   FILTROS
========================================================= */

pesquisaMedicao.addEventListener(
    "input",
    aplicarFiltros
);


filtroStatus.addEventListener(
    "change",
    aplicarFiltros
);


/* =========================================================
   MENU MOBILE
========================================================= */

btnMenuMobile?.addEventListener(
    "click",
    function () {

        sidebar.classList.add(
            "aberta"
        );


        sidebarOverlay.classList.add(
            "ativo"
        );

    }
);


sidebarOverlay?.addEventListener(
    "click",
    function () {

        sidebar.classList.remove(
            "aberta"
        );


        sidebarOverlay.classList.remove(
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
   INICIALIZAÇÃO
========================================================= */

function inicializar() {

    carregarMedicoes();

}


const usuario =
    getUsuarioSistema();


if (usuario) {

    inicializar();

} else {

    window.addEventListener(
        "usuarioSistemaCarregado",
        inicializar,
        {
            once: true
        }
    );

}