/* =========================================================
   ORÇAMENTO RÁPIDO - ENERGISA
   DETALHES / ANÁLISE DA MEDIÇÃO
========================================================= */

console.log(
    "detalhes-medicao.js carregado"
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
    doc,
    getDoc,
    updateDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


import {
    getUsuarioSistema
} from "./authGuard.js";


import {
    gerarExcelMedicao
} from "./gerarExcelMedicao.js";


/* =========================================================
   ELEMENTOS GERAIS
========================================================= */

const carregando =
    document.getElementById(
        "carregandoDetalhes"
    );


const conteudo =
    document.getElementById(
        "conteudoDetalhes"
    );


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
   DADOS DA MEDIÇÃO
========================================================= */

const tituloNumeroMedicao =
    document.getElementById(
        "tituloNumeroMedicao"
    );


const detalheContrato =
    document.getElementById(
        "detalheContrato"
    );


const detalheStatus =
    document.getElementById(
        "detalheStatus"
    );


const detalheNumero =
    document.getElementById(
        "detalheNumero"
    );


const detalhePrestador =
    document.getElementById(
        "detalhePrestador"
    );


const detalheData =
    document.getElementById(
        "detalheData"
    );


const detalheCidade =
    document.getElementById(
        "detalheCidade"
    );


const detalheLocalidade =
    document.getElementById(
        "detalheLocalidade"
    );


const detalheResponsavel =
    document.getElementById(
        "detalheResponsavel"
    );


const detalheCriadoPor =
    document.getElementById(
        "detalheCriadoPor"
    );


const detalheQuantidadeResumo =
    document.getElementById(
        "detalheQuantidadeResumo"
    );


const detalheValorResumo =
    document.getElementById(
        "detalheValorResumo"
    );


const detalheDescricao =
    document.getElementById(
        "detalheDescricao"
    );


const detalheQuantidadeItens =
    document.getElementById(
        "detalheQuantidadeItens"
    );


const detalheItens =
    document.getElementById(
        "detalheItens"
    );


const detalheValorTotal =
    document.getElementById(
        "detalheValorTotal"
    );


/* =========================================================
   RETORNO
========================================================= */

const secaoRetorno =
    document.getElementById(
        "secaoRetorno"
    );


const mensagemRetorno =
    document.getElementById(
        "mensagemRetorno"
    );


/* =========================================================
   ANÁLISE ADMINISTRATIVA
========================================================= */

const secaoAnalise =
    document.getElementById(
        "secaoAnaliseAdministrativa"
    );


const mensagemFluxoAnalise =
    document.getElementById(
        "mensagemFluxoAnalise"
    );


const areaIniciarAnalise =
    document.getElementById(
        "areaIniciarAnalise"
    );


const btnIniciarAnalise =
    document.getElementById(
        "btnIniciarAnalise"
    );


const areaDadosInternos =
    document.getElementById(
        "areaDadosInternos"
    );


const listaDadosInternos =
    document.getElementById(
        "listaDadosInternos"
    );


const btnSalvarDadosInternos =
    document.getElementById(
        "btnSalvarDadosInternos"
    );


const observacaoAnalise =
    document.getElementById(
        "observacaoAnalise"
    );


const acoesAnalise =
    document.getElementById(
        "acoesAnalise"
    );


const btnSolicitarCorrecao =
    document.getElementById(
        "btnSolicitarCorrecao"
    );


const btnReprovar =
    document.getElementById(
        "btnReprovar"
    );


const btnAprovar =
    document.getElementById(
        "btnAprovar"
    );


/* =========================================================
   AUDITORIA
========================================================= */

const dadosAuditoria =
    document.getElementById(
        "dadosAuditoria"
    );


const auditoriaNome =
    document.getElementById(
        "auditoriaNome"
    );


const auditoriaData =
    document.getElementById(
        "auditoriaData"
    );


/* =========================================================
   EXCEL
========================================================= */

const areaGerarExcel =
    document.getElementById(
        "areaGerarExcel"
    );


const btnGerarExcel =
    document.getElementById(
        "btnGerarExcel"
    );


/* =========================================================
   ESTADO
========================================================= */

let medicaoId =
    null;


let medicaoAtual =
    null;


let analiseAtual =
    null;


/* =========================================================
   FORMATADORES
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


function formatarQuantidade(
    valor
) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2
        }
    ).format(
        Number(valor) || 0
    );

}


function formatarData(
    data
) {

    if (!data) {

        return "-";

    }


    const partes =
        String(data)
            .split("-");


    if (
        partes.length !==
        3
    ) {

        return String(data);

    }


    return (
        `${partes[2]}/${partes[1]}/${partes[0]}`
    );

}


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
   SEGURANÇA HTML
========================================================= */

function escaparHTML(
    valor
) {

    return String(
        valor ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            "\"",
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   STATUS
========================================================= */

function obterStatus(
    status
) {

    const mapa = {

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
        mapa[status]
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


        document.body.style.overflow =
            "hidden";

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


        document.body.style.overflow =
            "";

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


/* =========================================================
   ERRO DE CARREGAMENTO
========================================================= */

function mostrarErro(
    mensagem
) {

    console.error(
        mensagem
    );


    if (carregando) {

        carregando.textContent =
            mensagem;

    }


    if (tituloNumeroMedicao) {

        tituloNumeroMedicao.textContent =
            "Não foi possível carregar";

    }

}


/* =========================================================
   CARREGAR ANÁLISE
========================================================= */

async function carregarAnalise() {

    if (!medicaoId) {

        return;

    }


    try {

        const referencia =
            doc(
                db,
                "analisesMedicoes",
                medicaoId
            );


        const snapshot =
            await getDoc(
                referencia
            );


        if (
            snapshot.exists()
        ) {

            analiseAtual = {

                id:
                    snapshot.id,

                ...snapshot.data()

            };

        } else {

            analiseAtual =
                null;

        }


    } catch (erro) {

        console.error(
            "Erro ao carregar análise:",
            erro
        );


        throw erro;

    }

}


/* =========================================================
   CARREGAR MEDIÇÃO
========================================================= */

async function carregarMedicao() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );


    medicaoId =
        parametros.get(
            "id"
        );


    console.log(
        "ID da medição:",
        medicaoId
    );


    if (!medicaoId) {

        mostrarErro(
            "Medição não informada."
        );


        return;

    }


    try {

        const referencia =
            doc(
                db,
                "medicoes",
                medicaoId
            );


        const snapshot =
            await getDoc(
                referencia
            );


        if (
            !snapshot.exists()
        ) {

            mostrarErro(
                "Medição não encontrada."
            );


            return;

        }


        medicaoAtual = {

            id:
                snapshot.id,

            ...snapshot.data()

        };


        const usuario =
            getUsuarioSistema();


        if (!usuario) {

            mostrarErro(
                "Não foi possível identificar o usuário."
            );


            return;

        }


        if (
            usuario.perfil ===
            "prestador"
            &&
            medicaoAtual.prestadorId !==
            usuario.prestadorId
        ) {

            mostrarErro(
                "Você não possui acesso a esta medição."
            );


            return;

        }


        if (
            usuario.perfil ===
            "administrador"
        ) {

            await carregarAnalise();

        }


        preencherMedicao();

        configurarFluxo();


        carregando?.classList.add(
            "oculto"
        );


        conteudo?.classList.remove(
            "oculto"
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar medição:",
            erro
        );


        if (
            erro.code ===
            "permission-denied"
        ) {

            mostrarErro(
                "O Firestore bloqueou o acesso a esta medição."
            );


            return;

        }


        mostrarErro(
            "Não foi possível carregar a medição."
        );

    }

}


/* =========================================================
   PREENCHER MEDIÇÃO
========================================================= */

function preencherMedicao() {

    if (!medicaoAtual) {

        return;

    }


    const numero =
        medicaoAtual.numeroMedicao
        ||
        "Sem numeração";


    if (tituloNumeroMedicao) {

        tituloNumeroMedicao.textContent =
            numero;

    }


    if (detalheNumero) {

        detalheNumero.textContent =
            numero;

    }


    if (detalheContrato) {

        detalheContrato.textContent =
            `${
                medicaoAtual.contratoDescricao
                ||
                "Contrato"
            } — ${
                medicaoAtual.contratoNumero
                ||
                "-"
            }`;

    }


    if (detalhePrestador) {

        detalhePrestador.textContent =
            medicaoAtual.prestadorNome
            ||
            "-";

    }


    if (detalheData) {

        detalheData.textContent =
            formatarData(
                medicaoAtual.dataServico
            );

    }


    if (detalheCidade) {

        detalheCidade.textContent =
            medicaoAtual.cidade
            ||
            "-";

    }


    if (detalheLocalidade) {

        detalheLocalidade.textContent =
            medicaoAtual.localidade
            ||
            "-";

    }


    if (detalheResponsavel) {

        detalheResponsavel.textContent =
            medicaoAtual.responsavel
            ||
            "-";

    }


    if (detalheCriadoPor) {

        detalheCriadoPor.textContent =
            medicaoAtual.criadoPorNome
            ||
            "-";

    }


    if (detalheDescricao) {

        detalheDescricao.textContent =
            medicaoAtual.descricao
            ||
            "Sem descrição.";

    }


    const itens =
        Array.isArray(
            medicaoAtual.itens
        )
            ? medicaoAtual.itens
            : [];


    const textoQuantidade =
        itens.length === 1
            ? "1 item"
            : `${itens.length} itens`;


    if (detalheQuantidadeResumo) {

        detalheQuantidadeResumo.textContent =
            textoQuantidade;

    }


    if (detalheQuantidadeItens) {

        detalheQuantidadeItens.textContent =
            textoQuantidade;

    }


    if (detalheValorResumo) {

        detalheValorResumo.textContent =
            formatarMoeda(
                medicaoAtual.valorTotal
            );

    }


    if (detalheValorTotal) {

        detalheValorTotal.textContent =
            formatarMoeda(
                medicaoAtual.valorTotal
            );

    }


    const status =
        obterStatus(
            medicaoAtual.status
        );


    if (detalheStatus) {

        detalheStatus.textContent =
            status.texto;


        detalheStatus.className =
            `status-medicao ${status.classe}`;

    }


    if (
        medicaoAtual.mensagemRetorno
    ) {

        secaoRetorno?.classList.remove(
            "oculto"
        );


        if (mensagemRetorno) {

            mensagemRetorno.textContent =
                medicaoAtual.mensagemRetorno;

        }

    } else {

        secaoRetorno?.classList.add(
            "oculto"
        );

    }


    renderizarItens();

}


/* =========================================================
   RENDERIZAR SERVIÇOS
========================================================= */

function renderizarItens() {

    if (!detalheItens) {

        return;

    }


    detalheItens.innerHTML =
        "";


    const itens =
        Array.isArray(
            medicaoAtual?.itens
        )
            ? medicaoAtual.itens
            : [];


    if (
        itens.length ===
        0
    ) {

        detalheItens.innerHTML = `

            <tr>

                <td colspan="6">
                    Nenhum serviço registrado.
                </td>

            </tr>

        `;


        return;

    }


    itens.forEach(
        function (item) {

            const linha =
                document.createElement(
                    "tr"
                );


            linha.innerHTML = `

                <td>
                    ${escaparHTML(
                        item.codigoEnergisa
                        ||
                        "-"
                    )}
                </td>


                <td>
                    ${escaparHTML(
                        item.especificacao
                        ||
                        "-"
                    )}
                </td>


                <td>
                    ${escaparHTML(
                        item.unidade
                        ||
                        "-"
                    )}
                </td>


                <td>
                    ${formatarQuantidade(
                        item.quantidade
                    )}
                </td>


                <td>
                    ${formatarMoeda(
                        item.valorUnitario
                    )}
                </td>


                <td>

                    <strong>
                        ${formatarMoeda(
                            item.total
                        )}
                    </strong>

                </td>

            `;


            detalheItens.appendChild(
                linha
            );

        }
    );

}


/* =========================================================
   LOCALIZAR DADO INTERNO
========================================================= */

function encontrarDadoInterno(
    item
) {

    const internos =
        Array.isArray(
            analiseAtual?.itensInternos
        )
            ? analiseAtual.itensInternos
            : [];


    return internos.find(
        function (interno) {

            if (
                item.itemTabelaId
                &&
                interno.itemTabelaId
            ) {

                return (
                    String(
                        interno.itemTabelaId
                    )
                    ===
                    String(
                        item.itemTabelaId
                    )
                );

            }


            return (
                String(
                    interno.codigoEnergisa
                )
                ===
                String(
                    item.codigoEnergisa
                )
            );

        }
    ) || {};

}


/* =========================================================
   DADOS INTERNOS
========================================================= */

function renderizarDadosInternos(
    somenteLeitura = false
) {

    if (!listaDadosInternos) {

        return;

    }


    listaDadosInternos.innerHTML =
        "";


    const itens =
        Array.isArray(
            medicaoAtual?.itens
        )
            ? medicaoAtual.itens
            : [];


    itens.forEach(
        function (
            item,
            indice
        ) {

            const interno =
                encontrarDadoInterno(
                    item
                );


            const bloco =
                document.createElement(
                    "div"
                );


            bloco.className =
                "item-dados-internos";


            bloco.innerHTML = `

                <div class="item-interno-cabecalho">


                    <div>

                        <span>

                            ITEM ${escaparHTML(
                                item.codigoEnergisa
                                ||
                                indice + 1
                            )}

                        </span>


                        <strong>

                            ${escaparHTML(
                                item.especificacao
                                ||
                                "-"
                            )}

                        </strong>

                    </div>


                    <span class="item-interno-total">

                        ${formatarMoeda(
                            item.total
                        )}

                    </span>


                </div>



                <div class="grid-dados-internos">


                    <div class="campo-interno">

                        <label>
                            Centro de Custo
                        </label>

                        <input
                            type="text"
                            class="input-centro-custo"
                            data-index="${indice}"
                            value="${escaparHTML(
                                interno.centroCusto
                                ||
                                ""
                            )}"
                            placeholder="Ex.: 123456"
                            ${
                                somenteLeitura
                                    ? "disabled"
                                    : ""
                            }
                        >

                    </div>


                    <div class="campo-interno">

                        <label>
                            OPEX
                        </label>

                        <input
                            type="text"
                            class="input-opex"
                            data-index="${indice}"
                            value="${escaparHTML(
                                interno.opex
                                ||
                                ""
                            )}"
                            placeholder="Classificação OPEX"
                            ${
                                somenteLeitura
                                    ? "disabled"
                                    : ""
                            }
                        >

                    </div>


                    <div class="campo-interno">

                        <label>
                            CAPEX
                        </label>

                        <input
                            type="text"
                            class="input-capex"
                            data-index="${indice}"
                            value="${escaparHTML(
                                interno.capex
                                ||
                                ""
                            )}"
                            placeholder="Classificação CAPEX"
                            ${
                                somenteLeitura
                                    ? "disabled"
                                    : ""
                            }
                        >

                    </div>


                    <div class="campo-interno">

                        <label>
                            Rateio
                        </label>

                        <input
                            type="text"
                            class="input-rateio"
                            data-index="${indice}"
                            value="${escaparHTML(
                                interno.rateio
                                ||
                                ""
                            )}"
                            placeholder="Ex.: 100%"
                            ${
                                somenteLeitura
                                    ? "disabled"
                                    : ""
                            }
                        >

                    </div>


                </div>

            `;


            listaDadosInternos.appendChild(
                bloco
            );

        }
    );


    if (observacaoAnalise) {

        observacaoAnalise.value =
            analiseAtual?.observacaoAnalise
            ||
            "";


        observacaoAnalise.disabled =
            somenteLeitura;

    }

}


/* =========================================================
   COLETAR DADOS INTERNOS
========================================================= */

function coletarDadosInternos() {

    const itens =
        Array.isArray(
            medicaoAtual?.itens
        )
            ? medicaoAtual.itens
            : [];


    return itens.map(
        function (
            item,
            indice
        ) {

            const centroCusto =
                document.querySelector(
                    `.input-centro-custo[data-index="${indice}"]`
                );


            const opex =
                document.querySelector(
                    `.input-opex[data-index="${indice}"]`
                );


            const capex =
                document.querySelector(
                    `.input-capex[data-index="${indice}"]`
                );


            const rateio =
                document.querySelector(
                    `.input-rateio[data-index="${indice}"]`
                );


            return {

                itemTabelaId:
                    item.itemTabelaId
                    ||
                    "",

                codigoEnergisa:
                    item.codigoEnergisa
                    ||
                    "",

                especificacao:
                    item.especificacao
                    ||
                    "",

                centroCusto:
                    centroCusto
                        ?.value
                        .trim()
                    ||
                    "",

                opex:
                    opex
                        ?.value
                        .trim()
                    ||
                    "",

                capex:
                    capex
                        ?.value
                        .trim()
                    ||
                    "",

                rateio:
                    rateio
                        ?.value
                        .trim()
                    ||
                    ""

            };

        }
    );

}


/* =========================================================
   AUDITORIA
========================================================= */

function preencherAuditoria() {

    if (!analiseAtual) {

        dadosAuditoria?.classList.add(
            "oculto"
        );


        return;

    }


    const nome =
        analiseAtual.analisadoPorNome
        ||
        analiseAtual.atualizadoPorNome
        ||
        analiseAtual.analiseIniciadaPorNome
        ||
        "-";


    const data =
        analiseAtual.analisadoEm
        ||
        analiseAtual.atualizadoEm
        ||
        analiseAtual.analiseIniciadaEm;


    dadosAuditoria?.classList.remove(
        "oculto"
    );


    if (auditoriaNome) {

        auditoriaNome.textContent =
            nome;

    }


    if (auditoriaData) {

        auditoriaData.textContent =
            formatarTimestamp(
                data
            );

    }

}


/* =========================================================
   CONFIGURAR FLUXO
========================================================= */

function configurarFluxo() {

    const usuario =
        getUsuarioSistema();


    if (!usuario) {

        return;

    }


    areaGerarExcel?.classList.add(
        "oculto"
    );


    if (
        usuario.perfil !==
        "administrador"
    ) {

        secaoAnalise?.classList.add(
            "oculto"
        );


        return;

    }


    secaoAnalise?.classList.remove(
        "oculto"
    );


    areaIniciarAnalise?.classList.add(
        "oculto"
    );


    areaDadosInternos?.classList.add(
        "oculto"
    );


    dadosAuditoria?.classList.add(
        "oculto"
    );


    acoesAnalise?.classList.remove(
        "oculto"
    );


    btnSalvarDadosInternos?.classList.remove(
        "oculto"
    );


    if (observacaoAnalise) {

        observacaoAnalise.disabled =
            false;

    }


    const status =
        medicaoAtual?.status;


    if (
        status ===
        "rascunho"
    ) {

        if (mensagemFluxoAnalise) {

            mensagemFluxoAnalise.textContent =
                "Esta medição ainda está em rascunho e não foi enviada para análise.";

        }


        return;

    }


    if (
        status ===
        "enviado"
    ) {

        if (mensagemFluxoAnalise) {

            mensagemFluxoAnalise.textContent =
                "A medição foi enviada e está aguardando o início da análise administrativa.";

        }


        areaIniciarAnalise?.classList.remove(
            "oculto"
        );


        return;

    }


    if (
        status ===
        "em_analise"
    ) {

        if (mensagemFluxoAnalise) {

            mensagemFluxoAnalise.textContent =
                "Medição em análise. Preencha os dados internos dos serviços antes da conclusão.";

        }


        areaDadosInternos?.classList.remove(
            "oculto"
        );


        renderizarDadosInternos(
            false
        );


        preencherAuditoria();


        return;

    }


    if (
        [
            "aprovado",
            "reprovado",
            "correcao"
        ].includes(
            status
        )
    ) {

        if (mensagemFluxoAnalise) {

            if (
                status ===
                "aprovado"
            ) {

                mensagemFluxoAnalise.textContent =
                    "Esta medição foi aprovada.";

            }


            if (
                status ===
                "reprovado"
            ) {

                mensagemFluxoAnalise.textContent =
                    "Esta medição foi reprovada.";

            }


            if (
                status ===
                "correcao"
            ) {

                mensagemFluxoAnalise.textContent =
                    "Foi solicitada correção desta medição.";

            }

        }


        areaDadosInternos?.classList.remove(
            "oculto"
        );


        renderizarDadosInternos(
            true
        );


        acoesAnalise?.classList.add(
            "oculto"
        );


        btnSalvarDadosInternos?.classList.add(
            "oculto"
        );


        preencherAuditoria();


        if (
            status ===
            "aprovado"
        ) {

            areaGerarExcel?.classList.remove(
                "oculto"
            );

        }

    }

}


/* =========================================================
   SALVAR DADOS INTERNOS
========================================================= */

async function salvarDadosInternos(
    exibirMensagem = true
) {

    const usuario =
        getUsuarioSistema();


    if (
        usuario?.perfil !==
        "administrador"
    ) {

        return false;

    }


    if (!medicaoId) {

        return false;

    }


    try {

        const referencia =
            doc(
                db,
                "analisesMedicoes",
                medicaoId
            );


        const dados = {

            medicaoId:
                medicaoId,

            numeroMedicao:
                medicaoAtual?.numeroMedicao
                ||
                "",

            itensInternos:
                coletarDadosInternos(),

            observacaoAnalise:
                observacaoAnalise
                    ?.value
                    .trim()
                ||
                "",

            atualizadoPorUid:
                usuario.uid,

            atualizadoPorNome:
                usuario.nome
                ||
                "",

            atualizadoEm:
                serverTimestamp()

        };


        await setDoc(
            referencia,
            dados,
            {
                merge:
                    true
            }
        );


        await carregarAnalise();


        preencherAuditoria();


        if (
            exibirMensagem
        ) {

            alert(
                "Dados internos salvos com sucesso."
            );

        }


        return true;


    } catch (erro) {

        console.error(
            "Erro ao salvar dados internos:",
            erro
        );


        alert(
            "Não foi possível salvar os dados internos."
        );


        return false;

    }

}


/* =========================================================
   INICIAR ANÁLISE
========================================================= */

btnIniciarAnalise?.addEventListener(
    "click",
    async function () {

        if (
            medicaoAtual?.status !==
            "enviado"
        ) {

            return;

        }


        const confirmar =
            confirm(
                "Deseja iniciar a análise desta medição?"
            );


        if (!confirmar) {

            return;

        }


        const usuario =
            getUsuarioSistema();


        if (
            usuario?.perfil !==
            "administrador"
        ) {

            return;

        }


        btnIniciarAnalise.disabled =
            true;


        try {

            await updateDoc(
                doc(
                    db,
                    "medicoes",
                    medicaoId
                ),
                {

                    status:
                        "em_analise",

                    statusAtualizadoEm:
                        serverTimestamp(),

                    atualizadoEm:
                        serverTimestamp()

                }
            );


            await setDoc(
                doc(
                    db,
                    "analisesMedicoes",
                    medicaoId
                ),
                {

                    medicaoId:
                        medicaoId,

                    numeroMedicao:
                        medicaoAtual.numeroMedicao
                        ||
                        "",

                    analiseIniciadaPorUid:
                        usuario.uid,

                    analiseIniciadaPorNome:
                        usuario.nome
                        ||
                        "",

                    analiseIniciadaEm:
                        serverTimestamp(),

                    atualizadoPorUid:
                        usuario.uid,

                    atualizadoPorNome:
                        usuario.nome
                        ||
                        "",

                    atualizadoEm:
                        serverTimestamp()

                },
                {
                    merge:
                        true
                }
            );


            medicaoAtual.status =
                "em_analise";


            await carregarAnalise();


            preencherMedicao();

            configurarFluxo();


            alert(
                "Análise iniciada com sucesso."
            );


        } catch (erro) {

            console.error(
                "Erro ao iniciar análise:",
                erro
            );


            alert(
                "Não foi possível iniciar a análise."
            );


        } finally {

            btnIniciarAnalise.disabled =
                false;

        }

    }
);


/* =========================================================
   SALVAR DADOS INTERNOS - BOTÃO
========================================================= */

btnSalvarDadosInternos?.addEventListener(
    "click",
    async function () {

        btnSalvarDadosInternos.disabled =
            true;


        await salvarDadosInternos(
            true
        );


        btnSalvarDadosInternos.disabled =
            false;

    }
);


/* =========================================================
   FINALIZAR ANÁLISE
========================================================= */

async function finalizarAnalise(
    novoStatus
) {

    const usuario =
        getUsuarioSistema();


    if (
        usuario?.perfil !==
        "administrador"
    ) {

        return;

    }


    if (
        medicaoAtual?.status !==
        "em_analise"
    ) {

        alert(
            "A medição precisa estar em análise."
        );


        return;

    }


    const observacao =
        observacaoAnalise
            ?.value
            .trim()
        ||
        "";


    if (
        [
            "correcao",
            "reprovado"
        ].includes(
            novoStatus
        )
        &&
        !observacao
    ) {

        alert(
            "Informe a observação da análise antes de continuar."
        );


        observacaoAnalise?.focus();


        return;

    }


    let textoConfirmacao =
        "Deseja concluir a análise?";


    if (
        novoStatus ===
        "aprovado"
    ) {

        textoConfirmacao =
            "Deseja aprovar esta medição?";

    }


    if (
        novoStatus ===
        "correcao"
    ) {

        textoConfirmacao =
            "Deseja solicitar correção desta medição?";

    }


    if (
        novoStatus ===
        "reprovado"
    ) {

        textoConfirmacao =
            "Deseja reprovar esta medição?";

    }


    const confirmar =
        confirm(
            textoConfirmacao
        );


    if (!confirmar) {

        return;

    }


    try {

        const salvo =
            await salvarDadosInternos(
                false
            );


        if (!salvo) {

            return;

        }


        const atualizacao = {

            status:
                novoStatus,

            statusAtualizadoEm:
                serverTimestamp(),

            atualizadoEm:
                serverTimestamp()

        };


        if (
            novoStatus ===
            "correcao"
            ||
            novoStatus ===
            "reprovado"
        ) {

            atualizacao.mensagemRetorno =
                observacao;

        } else {

            atualizacao.mensagemRetorno =
                "";

        }


        if (
            novoStatus ===
            "aprovado"
        ) {

            atualizacao.aprovadoEm =
                serverTimestamp();


            atualizacao.aprovadoPorUid =
                usuario.uid;


            atualizacao.aprovadoPorNome =
                usuario.nome
                ||
                "";

        }


        await updateDoc(
            doc(
                db,
                "medicoes",
                medicaoId
            ),
            atualizacao
        );


        await setDoc(
            doc(
                db,
                "analisesMedicoes",
                medicaoId
            ),
            {

                statusFinal:
                    novoStatus,

                observacaoAnalise:
                    observacao,

                analisadoPorUid:
                    usuario.uid,

                analisadoPorNome:
                    usuario.nome
                    ||
                    "",

                analisadoEm:
                    serverTimestamp(),

                atualizadoPorUid:
                    usuario.uid,

                atualizadoPorNome:
                    usuario.nome
                    ||
                    "",

                atualizadoEm:
                    serverTimestamp()

            },
            {
                merge:
                    true
            }
        );


        medicaoAtual.status =
            novoStatus;


        medicaoAtual.mensagemRetorno =
            atualizacao.mensagemRetorno;


        await carregarAnalise();


        preencherMedicao();

        configurarFluxo();


        if (
            novoStatus ===
            "aprovado"
        ) {

            alert(
                "Medição aprovada com sucesso."
            );

        }


        if (
            novoStatus ===
            "correcao"
        ) {

            alert(
                "Correção solicitada com sucesso."
            );

        }


        if (
            novoStatus ===
            "reprovado"
        ) {

            alert(
                "Medição reprovada."
            );

        }


    } catch (erro) {

        console.error(
            "Erro ao concluir análise:",
            erro
        );


        alert(
            "Não foi possível concluir a análise."
        );

    }

}


/* =========================================================
   BOTÕES
========================================================= */

btnAprovar?.addEventListener(
    "click",
    function () {

        finalizarAnalise(
            "aprovado"
        );

    }
);


btnSolicitarCorrecao?.addEventListener(
    "click",
    function () {

        finalizarAnalise(
            "correcao"
        );

    }
);


btnReprovar?.addEventListener(
    "click",
    function () {

        finalizarAnalise(
            "reprovado"
        );

    }
);


/* =========================================================
   GERAR EXCEL
========================================================= */

btnGerarExcel?.addEventListener(
    "click",
    async function () {

        if (
            medicaoAtual?.status !==
            "aprovado"
        ) {

            alert(
                "Somente medições aprovadas podem gerar o Excel."
            );


            return;

        }


        btnGerarExcel.disabled =
            true;


        const textoOriginal =
            btnGerarExcel.innerHTML;


        btnGerarExcel.innerHTML = `

            <i class="bx bx-loader-alt bx-spin"></i>

            Gerando Excel...

        `;


        try {

            const nomeArquivo =
                await gerarExcelMedicao(
                    medicaoAtual,
                    analiseAtual
                );


            alert(
                `${nomeArquivo} gerado com sucesso.`
            );


        } catch (erro) {

            console.error(
                "Erro ao gerar Excel:",
                erro
            );


            alert(
                erro.message
                ||
                "Não foi possível gerar o Excel."
            );


        } finally {

            btnGerarExcel.disabled =
                false;


            btnGerarExcel.innerHTML =
                textoOriginal;

        }

    }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function inicializarDetalhes() {

    console.log(
        "Iniciando detalhes da medição..."
    );


    await carregarMedicao();

}


const usuarioInicial =
    getUsuarioSistema();


if (usuarioInicial) {

    inicializarDetalhes();

} else {

    window.addEventListener(
        "usuarioSistemaCarregado",
        inicializarDetalhes,
        {
            once:
                true
        }
    );

}