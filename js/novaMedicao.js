/* =========================================================
   ORÇAMENTO RÁPIDO - ENERGISA
   NOVA MEDIÇÃO
========================================================= */


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
    getDocs,
    query,
    where,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


import {
    getUsuarioSistema
} from "./authGuard.js";


/* =========================================================
   ELEMENTOS
========================================================= */

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const btnMenuMobile =
    document.getElementById("btnMenuMobile");

const btnSair =
    document.getElementById("btnSair");


const selectPrestador =
    document.getElementById("prestador");

const selectContrato =
    document.getElementById("contrato");


const pesquisaServico =
    document.getElementById("pesquisaServico");

const resultadosPesquisa =
    document.getElementById("resultadosPesquisa");

const btnLimparPesquisa =
    document.getElementById("btnLimparPesquisa");

const mensagemTabela =
    document.getElementById("mensagemTabela");


const servicoSelecionadoArea =
    document.getElementById("servicoSelecionado");

const nomeServicoSelecionado =
    document.getElementById("nomeServicoSelecionado");

const codigoEnergisaSelecionado =
    document.getElementById("codigoEnergisaSelecionado");

const codigoPiniSelecionado =
    document.getElementById("codigoPiniSelecionado");

const unidadeSelecionada =
    document.getElementById("unidadeSelecionada");

const valorUnitarioSelecionado =
    document.getElementById("valorUnitarioSelecionado");

const quantidadeServico =
    document.getElementById("quantidadeServico");

const unidadeQuantidade =
    document.getElementById("unidadeQuantidade");

const subtotalServico =
    document.getElementById("subtotalServico");

const btnAdicionarItem =
    document.getElementById("btnAdicionarItem");

const btnRemoverSelecao =
    document.getElementById("btnRemoverSelecao");


const listaItens =
    document.getElementById("listaItens");

const estadoVazioItens =
    document.getElementById("estadoVazioItens");

const contadorItens =
    document.getElementById("contadorItens");

const valorTotalMedicao =
    document.getElementById("valorTotalMedicao");

const resumoQuantidadeItens =
    document.getElementById("resumoQuantidadeItens");


const btnSalvarRascunho =
    document.getElementById("btnSalvarRascunho");

const btnEnviarMedicao =
    document.getElementById("btnEnviarMedicao");


/* =========================================================
   ESTADO
========================================================= */

let prestadoresSistema = [];

let contratosSistema = [];

let tabelaServicos = [];

let contratoAtual = null;

let tabelaAtualId = null;

let servicoAtual = null;

let itensMedicao = [];

let itemEmEdicaoId = null;


/*
    ID do documento Firestore após o primeiro salvamento.
*/
let medicaoIdAtual = null;


/*
    Número profissional da medição.
    Exemplo: MED-2026-0001
*/
let numeroMedicaoAtual = null;


/* =========================================================
   UTILIDADES
========================================================= */

function escaparHTML(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");

}


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


function formatarQuantidade(valor) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(
        Number(valor) || 0
    );

}


function normalizarTexto(texto) {

    return String(texto || "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();

}


/* =========================================================
   DATA ATUAL
========================================================= */

function definirDataAtual() {

    const input =
        document.getElementById(
            "dataServico"
        );


    if (!input) {
        return;
    }


    const hoje =
        new Date();


    const ano =
        hoje.getFullYear();


    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            hoje.getDate()
        ).padStart(
            2,
            "0"
        );


    input.value =
        `${ano}-${mes}-${dia}`;

}


/* =========================================================
   MENU MOBILE
========================================================= */

function abrirMenu() {

    sidebar?.classList.add(
        "aberta"
    );


    sidebarOverlay?.classList.add(
        "ativo"
    );


    document.body.style.overflow =
        "hidden";

}


function fecharMenu() {

    sidebar?.classList.remove(
        "aberta"
    );


    sidebarOverlay?.classList.remove(
        "ativo"
    );


    document.body.style.overflow =
        "";

}


btnMenuMobile?.addEventListener(
    "click",
    abrirMenu
);


sidebarOverlay?.addEventListener(
    "click",
    fecharMenu
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

            await signOut(auth);


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
   LIMPAR TABELA ATUAL
========================================================= */

function limparTabelaAtual() {

    tabelaServicos = [];

    tabelaAtualId = null;

    contratoAtual = null;

    servicoAtual = null;

    itemEmEdicaoId = null;


    pesquisaServico.value =
        "";


    pesquisaServico.disabled =
        true;


    pesquisaServico.placeholder =
        "Selecione um contrato primeiro...";


    resultadosPesquisa.innerHTML =
        "";


    resultadosPesquisa.classList.remove(
        "visivel"
    );


    servicoSelecionadoArea.classList.add(
        "oculto"
    );


    mensagemTabela.classList.remove(
        "erro"
    );

}


/* =========================================================
   PRESTADORES
========================================================= */

async function carregarPrestadores() {

    selectPrestador.disabled =
        true;


    selectPrestador.innerHTML = `

        <option value="">
            Carregando prestadores...
        </option>

    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "prestadores"
                )
            );


        prestadoresSistema = [];


        snapshot.forEach(
            function (documento) {

                const dados =
                    documento.data();


                if (
                    dados.ativo === true
                ) {

                    prestadoresSistema.push({

                        id:
                            documento.id,

                        ...dados

                    });

                }

            }
        );


        prestadoresSistema.sort(
            function (a, b) {

                return String(
                    a.nome ||
                    a.razaoSocial ||
                    ""
                ).localeCompare(
                    String(
                        b.nome ||
                        b.razaoSocial ||
                        ""
                    ),
                    "pt-BR"
                );

            }
        );


        preencherPrestadores();


    } catch (erro) {

        console.error(
            "Erro ao carregar prestadores:",
            erro
        );


        selectPrestador.innerHTML = `

            <option value="">
                Erro ao carregar prestadores
            </option>

        `;


        mensagemTabela.textContent =
            "Não foi possível carregar os prestadores.";


        mensagemTabela.classList.add(
            "erro"
        );

    }

}


/* =========================================================
   PREENCHER PRESTADORES
========================================================= */

function preencherPrestadores() {

    selectPrestador.innerHTML = `

        <option value="">
            Selecione o prestador
        </option>

    `;


    prestadoresSistema.forEach(
        function (prestador) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                prestador.id;


            option.textContent =
                prestador.nome ||
                prestador.razaoSocial ||
                prestador.id;


            selectPrestador.appendChild(
                option
            );

        }
    );


    const usuario =
        getUsuarioSistema();


    /*
        ADMINISTRADOR
    */

    if (
        !usuario ||
        usuario.perfil ===
        "administrador"
    ) {

        selectPrestador.disabled =
            false;


        mensagemTabela.textContent =
            prestadoresSistema.length
                ? "Selecione o prestador e o contrato."
                : "Nenhum prestador ativo cadastrado.";


        return;

    }


    /*
        PRESTADOR
    */

    if (
        usuario.perfil ===
        "prestador"
    ) {

        if (
            !usuario.prestadorId
        ) {

            selectPrestador.disabled =
                true;


            mensagemTabela.textContent =
                "Seu usuário não possui prestador vinculado.";


            mensagemTabela.classList.add(
                "erro"
            );


            return;

        }


        selectPrestador.value =
            usuario.prestadorId;


        selectPrestador.disabled =
            true;


        carregarContratos(
            usuario.prestadorId
        );


        return;

    }


    selectPrestador.disabled =
        false;

}


/* =========================================================
   CONTRATOS
========================================================= */

async function carregarContratos(
    prestadorId
) {

    limparTabelaAtual();


    contratosSistema = [];


    selectContrato.disabled =
        true;


    selectContrato.innerHTML = `

        <option value="">
            Carregando contratos...
        </option>

    `;


    if (!prestadorId) {

        selectContrato.innerHTML = `

            <option value="">
                Selecione um prestador
            </option>

        `;


        mensagemTabela.textContent =
            "Selecione o prestador e o contrato.";


        return;

    }


    mensagemTabela.textContent =
        "Carregando contratos...";


    try {

        const consulta =
            query(
                collection(
                    db,
                    "contratos"
                ),
                where(
                    "prestadorId",
                    "==",
                    prestadorId
                )
            );


        const snapshot =
            await getDocs(
                consulta
            );


        snapshot.forEach(
            function (documento) {

                const dados =
                    documento.data();


                if (
                    dados.ativo === true
                ) {

                    contratosSistema.push({

                        id:
                            documento.id,

                        ...dados

                    });

                }

            }
        );


        contratosSistema.sort(
            function (a, b) {

                return String(
                    a.numero ||
                    a.id
                ).localeCompare(
                    String(
                        b.numero ||
                        b.id
                    )
                );

            }
        );


        selectContrato.innerHTML = `

            <option value="">
                Selecione o contrato
            </option>

        `;


        contratosSistema.forEach(
            function (contrato) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    contrato.id;


                option.textContent =
                    `${contrato.descricao || "Contrato"} — ${contrato.numero || contrato.id}`;


                selectContrato.appendChild(
                    option
                );

            }
        );


        if (
            contratosSistema.length === 0
        ) {

            selectContrato.innerHTML = `

                <option value="">
                    Nenhum contrato ativo
                </option>

            `;


            mensagemTabela.textContent =
                "Este prestador não possui contrato ativo.";


            return;

        }


        selectContrato.disabled =
            false;


        mensagemTabela.textContent =
            "Selecione o contrato.";


        /*
            SE EXISTIR SOMENTE UM CONTRATO
        */

        if (
            contratosSistema.length === 1
        ) {

            selectContrato.value =
                contratosSistema[0].id;


            await selecionarContrato(
                contratosSistema[0].id
            );

        }


    } catch (erro) {

        console.error(
            "Erro ao carregar contratos:",
            erro
        );


        selectContrato.innerHTML = `

            <option value="">
                Erro ao carregar contratos
            </option>

        `;


        mensagemTabela.textContent =
            "Não foi possível carregar os contratos.";


        mensagemTabela.classList.add(
            "erro"
        );

    }

}


/* =========================================================
   SELECIONAR CONTRATO
========================================================= */

async function selecionarContrato(
    contratoId
) {

    tabelaServicos = [];

    tabelaAtualId = null;

    servicoAtual = null;

    itemEmEdicaoId = null;


    pesquisaServico.value =
        "";


    pesquisaServico.disabled =
        true;


    resultadosPesquisa.innerHTML =
        "";


    resultadosPesquisa.classList.remove(
        "visivel"
    );


    servicoSelecionadoArea.classList.add(
        "oculto"
    );


    mensagemTabela.classList.remove(
        "erro"
    );


    contratoAtual =
        contratosSistema.find(
            function (contrato) {

                return (
                    contrato.id ===
                    contratoId
                );

            }
        ) || null;


    if (!contratoAtual) {

        mensagemTabela.textContent =
            "Selecione um contrato.";


        return;

    }


    if (
        !contratoAtual.tabelaId
    ) {

        mensagemTabela.textContent =
            "Este contrato não possui tabela de preços vinculada.";


        mensagemTabela.classList.add(
            "erro"
        );


        return;

    }


    tabelaAtualId =
        contratoAtual.tabelaId;


    await carregarItensTabela(
        tabelaAtualId
    );

}


/* =========================================================
   TABELA DE PREÇOS
========================================================= */

async function carregarItensTabela(
    tabelaId
) {

    mensagemTabela.classList.remove(
        "erro"
    );


    mensagemTabela.textContent =
        "Carregando tabela contratual...";


    pesquisaServico.disabled =
        true;


    try {

        const referenciaTabela =
            doc(
                db,
                "tabelasPrecos",
                tabelaId
            );


        const documentoTabela =
            await getDoc(
                referenciaTabela
            );


        if (
            !documentoTabela.exists()
        ) {

            throw new Error(
                "Tabela de preços não encontrada."
            );

        }


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "tabelasPrecos",
                    tabelaId,
                    "itens"
                )
            );


        tabelaServicos = [];


        snapshot.forEach(
            function (documento) {

                const dados =
                    documento.data();


                if (
                    dados.ativo !== false
                ) {

                    tabelaServicos.push({

                        id:
                            documento.id,

                        ...dados

                    });

                }

            }
        );


        tabelaServicos.sort(
            function (a, b) {

                const aNumero =
                    Number(
                        a.codigoEnergisa
                    );


                const bNumero =
                    Number(
                        b.codigoEnergisa
                    );


                if (
                    Number.isFinite(aNumero)
                    &&
                    Number.isFinite(bNumero)
                ) {

                    return (
                        aNumero -
                        bNumero
                    );

                }


                return String(
                    a.codigoEnergisa ||
                    ""
                ).localeCompare(
                    String(
                        b.codigoEnergisa ||
                        ""
                    )
                );

            }
        );


        if (
            tabelaServicos.length === 0
        ) {

            pesquisaServico.disabled =
                true;


            pesquisaServico.placeholder =
                "Tabela sem serviços";


            mensagemTabela.textContent =
                "A tabela contratual não possui serviços cadastrados.";


            return;

        }


        pesquisaServico.disabled =
            false;


        pesquisaServico.placeholder =
            "Ex.: pintura, concreto, alvenaria...";


        mensagemTabela.textContent =
            `${tabelaServicos.length} serviços disponíveis na tabela contratual.`;


    } catch (erro) {

        console.error(
            "Erro ao carregar tabela:",
            erro
        );


        tabelaServicos = [];


        pesquisaServico.disabled =
            true;


        pesquisaServico.placeholder =
            "Tabela indisponível";


        mensagemTabela.textContent =
            erro.message ||
            "Não foi possível carregar a tabela contratual.";


        mensagemTabela.classList.add(
            "erro"
        );

    }

}


/* =========================================================
   ALTERAR PRESTADOR
========================================================= */

selectPrestador.addEventListener(
    "change",
    async function () {

        if (
            itensMedicao.length > 0
        ) {

            const confirmar =
                confirm(
                    "Ao alterar o prestador, os serviços adicionados serão removidos. Deseja continuar?"
                );


            if (!confirmar) {
                return;
            }


            itensMedicao = [];


            renderizarItens();

        }


        await carregarContratos(
            selectPrestador.value
        );

    }
);


/* =========================================================
   ALTERAR CONTRATO
========================================================= */

selectContrato.addEventListener(
    "change",
    async function () {

        if (
            itensMedicao.length > 0
        ) {

            const confirmar =
                confirm(
                    "Ao alterar o contrato, os serviços adicionados serão removidos. Deseja continuar?"
                );


            if (!confirmar) {
                return;
            }


            itensMedicao = [];


            renderizarItens();

        }


        await selecionarContrato(
            selectContrato.value
        );

    }
);


/* =========================================================
   PESQUISA DE SERVIÇOS
========================================================= */

function pesquisarServicos() {

    const termo =
        normalizarTexto(
            pesquisaServico.value
        );


    resultadosPesquisa.innerHTML =
        "";


    if (
        termo.length < 2
    ) {

        resultadosPesquisa.classList.remove(
            "visivel"
        );


        return;

    }


    const resultados =
        tabelaServicos
            .filter(
                function (item) {

                    return (

                        normalizarTexto(
                            item.especificacao
                        ).includes(
                            termo
                        )

                        ||

                        normalizarTexto(
                            item.codigoEnergisa
                        ).includes(
                            termo
                        )

                        ||

                        normalizarTexto(
                            item.codigoPini
                        ).includes(
                            termo
                        )

                    );

                }
            )
            .slice(
                0,
                30
            );


    if (
        resultados.length === 0
    ) {

        resultadosPesquisa.innerHTML = `

            <div class="resultado-sem-item">
                Nenhum serviço encontrado.
            </div>

        `;


        resultadosPesquisa.classList.add(
            "visivel"
        );


        return;

    }


    resultados.forEach(
        function (item) {

            const botao =
                document.createElement(
                    "button"
                );


            botao.type =
                "button";


            botao.className =
                "resultado-servico";


            botao.innerHTML = `

                <div class="resultado-servico-topo">

                    <span class="resultado-servico-codigo">
                        Item ${escaparHTML(
                            item.codigoEnergisa ||
                            "-"
                        )}
                    </span>

                    <span class="resultado-servico-unidade">
                        ${escaparHTML(
                            item.unidade ||
                            "-"
                        )}
                    </span>

                </div>


                <span class="resultado-servico-descricao">
                    ${escaparHTML(
                        item.especificacao ||
                        ""
                    )}
                </span>


                <span class="resultado-servico-preco">
                    ${formatarMoeda(
                        item.valorUnitario
                    )}
                </span>

            `;


            botao.addEventListener(
                "click",
                function () {

                    selecionarServico(
                        item
                    );

                }
            );


            resultadosPesquisa.appendChild(
                botao
            );

        }
    );


    resultadosPesquisa.classList.add(
        "visivel"
    );

}


pesquisaServico.addEventListener(
    "input",
    pesquisarServicos
);


/* =========================================================
   ITEM JÁ EXISTENTE
========================================================= */

function encontrarItemExistente(
    servico
) {

    return itensMedicao.find(
        function (item) {

            return (
                String(
                    item.codigoEnergisa
                )
                ===
                String(
                    servico.codigoEnergisa
                )
            );

        }
    );

}


/* =========================================================
   SELECIONAR SERVIÇO
========================================================= */

function selecionarServico(
    item
) {

    const existente =
        encontrarItemExistente(
            item
        );


    if (existente) {

        resultadosPesquisa.classList.remove(
            "visivel"
        );


        const editar =
            confirm(
                "Este serviço já foi adicionado. Deseja editar a quantidade?"
            );


        if (editar) {

            editarItem(
                existente.id
            );

        }


        return;

    }


    servicoAtual =
        item;


    itemEmEdicaoId =
        null;


    preencherServicoSelecionado(
        item
    );


    quantidadeServico.value =
        "";


    subtotalServico.textContent =
        formatarMoeda(0);


    atualizarBotaoAdicionar();


    servicoSelecionadoArea.classList.remove(
        "oculto"
    );


    resultadosPesquisa.classList.remove(
        "visivel"
    );


    pesquisaServico.value =
        item.especificacao;


    quantidadeServico.focus();

}


/* =========================================================
   PREENCHER SERVIÇO
========================================================= */

function preencherServicoSelecionado(
    item
) {

    nomeServicoSelecionado.textContent =
        item.especificacao ||
        "-";


    codigoEnergisaSelecionado.textContent =
        item.codigoEnergisa ||
        "-";


    codigoPiniSelecionado.textContent =
        item.codigoPini ||
        "-";


    unidadeSelecionada.textContent =
        item.unidade ||
        "-";


    unidadeQuantidade.textContent =
        item.unidade
            ? `(${item.unidade})`
            : "";


    valorUnitarioSelecionado.textContent =
        formatarMoeda(
            item.valorUnitario
        );

}


/* =========================================================
   SUBTOTAL
========================================================= */

function calcularSubtotalAtual() {

    if (!servicoAtual) {

        subtotalServico.textContent =
            formatarMoeda(0);


        return;

    }


    const quantidade =
        quantidadeServico.valueAsNumber;


    const quantidadeValida =
        Number.isFinite(
            quantidade
        )
            ? quantidade
            : 0;


    subtotalServico.textContent =
        formatarMoeda(
            quantidadeValida *
            (
                Number(
                    servicoAtual.valorUnitario
                ) || 0
            )
        );

}


quantidadeServico.addEventListener(
    "input",
    calcularSubtotalAtual
);


/* =========================================================
   BOTÃO ADICIONAR
========================================================= */

function atualizarBotaoAdicionar() {

    if (
        itemEmEdicaoId !== null
    ) {

        btnAdicionarItem.innerHTML = `

            <i class="bx bx-check"></i>
            Salvar alteração

        `;


        btnAdicionarItem.classList.add(
            "modo-edicao"
        );


        return;

    }


    btnAdicionarItem.innerHTML = `

        <i class="bx bx-plus"></i>
        Adicionar serviço

    `;


    btnAdicionarItem.classList.remove(
        "modo-edicao"
    );

}


/* =========================================================
   LIMPAR SELEÇÃO
========================================================= */

function limparSelecao() {

    servicoAtual = null;

    itemEmEdicaoId = null;


    pesquisaServico.value =
        "";


    quantidadeServico.value =
        "";


    subtotalServico.textContent =
        formatarMoeda(0);


    servicoSelecionadoArea.classList.add(
        "oculto"
    );


    resultadosPesquisa.classList.remove(
        "visivel"
    );


    atualizarBotaoAdicionar();

}


btnRemoverSelecao.addEventListener(
    "click",
    limparSelecao
);


btnLimparPesquisa.addEventListener(
    "click",
    function () {

        limparSelecao();


        if (
            !pesquisaServico.disabled
        ) {

            pesquisaServico.focus();

        }

    }
);


/* =========================================================
   ADICIONAR ITEM
========================================================= */

btnAdicionarItem.addEventListener(
    "click",
    function () {

        if (!servicoAtual) {

            alert(
                "Selecione um serviço."
            );


            return;

        }


        const quantidade =
            quantidadeServico.valueAsNumber;


        if (
            !Number.isFinite(
                quantidade
            )
            ||
            quantidade <= 0
        ) {

            alert(
                "Informe uma quantidade válida."
            );


            quantidadeServico.focus();


            return;

        }


        const valorUnitario =
            Number(
                servicoAtual.valorUnitario
            ) || 0;


        const total =
            quantidade *
            valorUnitario;


        /*
            EDITAR ITEM
        */

        if (
            itemEmEdicaoId !== null
        ) {

            const indice =
                itensMedicao.findIndex(
                    function (item) {

                        return (
                            item.id ===
                            itemEmEdicaoId
                        );

                    }
                );


            if (
                indice !== -1
            ) {

                itensMedicao[indice] = {

                    ...itensMedicao[indice],

                    quantidade,

                    total

                };

            }


            renderizarItens();

            limparSelecao();


            return;

        }


        if (
            encontrarItemExistente(
                servicoAtual
            )
        ) {

            alert(
                "Este serviço já está incluído na medição."
            );


            return;

        }


        const idItem =
            (
                typeof crypto !== "undefined"
                &&
                typeof crypto.randomUUID === "function"
            )
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`;


        itensMedicao.push(
            {

                id:
                    idItem,

                itemTabelaId:
                    servicoAtual.id ||
                    "",

                codigoEnergisa:
                    servicoAtual.codigoEnergisa ||
                    "",

                codigoPini:
                    servicoAtual.codigoPini ||
                    "",

                especificacao:
                    servicoAtual.especificacao ||
                    "",

                unidade:
                    servicoAtual.unidade ||
                    "",

                valorUnitario:
                    valorUnitario,

                quantidade:
                    quantidade,

                total:
                    total

            }
        );


        renderizarItens();

        limparSelecao();


        pesquisaServico.focus();

    }
);


/* =========================================================
   EDITAR ITEM
========================================================= */

function editarItem(id) {

    const item =
        itensMedicao.find(
            function (registro) {

                return (
                    registro.id === id
                );

            }
        );


    if (!item) {
        return;
    }


    itemEmEdicaoId =
        item.id;


    servicoAtual = {

        id:
            item.itemTabelaId,

        codigoEnergisa:
            item.codigoEnergisa,

        codigoPini:
            item.codigoPini,

        especificacao:
            item.especificacao,

        unidade:
            item.unidade,

        valorUnitario:
            item.valorUnitario

    };


    preencherServicoSelecionado(
        servicoAtual
    );


    quantidadeServico.value =
        item.quantidade;


    pesquisaServico.value =
        item.especificacao;


    calcularSubtotalAtual();

    atualizarBotaoAdicionar();


    servicoSelecionadoArea.classList.remove(
        "oculto"
    );


    servicoSelecionadoArea.scrollIntoView(
        {
            behavior:
                "smooth",

            block:
                "center"
        }
    );

}


/* =========================================================
   REMOVER ITEM
========================================================= */

function removerItem(id) {

    const confirmar =
        confirm(
            "Deseja excluir este serviço da medição?"
        );


    if (!confirmar) {
        return;
    }


    itensMedicao =
        itensMedicao.filter(
            function (item) {

                return (
                    item.id !== id
                );

            }
        );


    if (
        itemEmEdicaoId === id
    ) {

        limparSelecao();

    }


    renderizarItens();

}


/* =========================================================
   RENDERIZAR ITENS
========================================================= */

function renderizarItens() {

    listaItens.innerHTML =
        "";


    if (
        itensMedicao.length === 0
    ) {

        listaItens.appendChild(
            estadoVazioItens
        );


        atualizarResumo();


        return;

    }


    itensMedicao.forEach(
        function (item) {

            const elemento =
                document.createElement(
                    "div"
                );


            elemento.className =
                "item-medicao";


            elemento.innerHTML = `

                <div class="item-descricao">

                    <strong>
                        ${escaparHTML(
                            item.especificacao
                        )}
                    </strong>

                    <span>

                        Item ${escaparHTML(
                            item.codigoEnergisa ||
                            "-"
                        )}

                        ·

                        ${escaparHTML(
                            item.codigoPini ||
                            "Sem código PINI"
                        )}

                    </span>

                </div>


                <div class="item-info">

                    <span>
                        Quantidade
                    </span>

                    <strong>

                        ${formatarQuantidade(
                            item.quantidade
                        )}

                        ${escaparHTML(
                            item.unidade
                        )}

                    </strong>

                </div>


                <div class="item-info">

                    <span>
                        Valor unitário
                    </span>

                    <strong>
                        ${formatarMoeda(
                            item.valorUnitario
                        )}
                    </strong>

                </div>


                <div class="item-info item-total">

                    <span>
                        Subtotal
                    </span>

                    <strong>
                        ${formatarMoeda(
                            item.total
                        )}
                    </strong>

                </div>


                <div class="item-acoes">

                    <button
                        type="button"
                        class="btn-editar-item"
                        data-id="${escaparHTML(
                            item.id
                        )}"
                        title="Editar"
                    >

                        <i class="bx bx-edit-alt"></i>

                    </button>


                    <button
                        type="button"
                        class="btn-excluir-item"
                        data-id="${escaparHTML(
                            item.id
                        )}"
                        title="Excluir"
                    >

                        <i class="bx bx-trash"></i>

                    </button>

                </div>

            `;


            listaItens.appendChild(
                elemento
            );

        }
    );


    configurarBotoesItens();

    atualizarResumo();

}


/* =========================================================
   BOTÕES DOS ITENS
========================================================= */

function configurarBotoesItens() {

    document
        .querySelectorAll(
            ".btn-editar-item"
        )
        .forEach(
            function (botao) {

                botao.addEventListener(
                    "click",
                    function () {

                        editarItem(
                            botao.dataset.id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".btn-excluir-item"
        )
        .forEach(
            function (botao) {

                botao.addEventListener(
                    "click",
                    function () {

                        removerItem(
                            botao.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================================================
   RESUMO
========================================================= */

function atualizarResumo() {

    const total =
        itensMedicao.reduce(
            function (
                acumulador,
                item
            ) {

                return (
                    acumulador +
                    Number(
                        item.total
                    )
                );

            },
            0
        );


    valorTotalMedicao.textContent =
        formatarMoeda(
            total
        );


    const quantidade =
        itensMedicao.length;


    contadorItens.textContent =
        quantidade === 1
            ? "1 item"
            : `${quantidade} itens`;


    resumoQuantidadeItens.textContent =
        quantidade === 0
            ? "Nenhum item adicionado"
            : quantidade === 1
                ? "1 serviço adicionado"
                : `${quantidade} serviços adicionados`;

}


/* =========================================================
   MONTAR MEDIÇÃO
========================================================= */

function montarMedicao() {

    const prestador =
        prestadoresSistema.find(
            function (item) {

                return (
                    item.id ===
                    selectPrestador.value
                );

            }
        ) || null;


    const contrato =
        contratosSistema.find(
            function (item) {

                return (
                    item.id ===
                    selectContrato.value
                );

            }
        ) || null;


    const total =
        itensMedicao.reduce(
            function (
                acumulador,
                item
            ) {

                return (
                    acumulador +
                    Number(
                        item.total
                    )
                );

            },
            0
        );


    return {

        prestadorId:
            selectPrestador.value,

        prestadorNome:
            prestador?.nome ||
            prestador?.razaoSocial ||
            "",


        contratoId:
            selectContrato.value,

        contratoNumero:
            contrato?.numero ||
            selectContrato.value,

        contratoDescricao:
            contrato?.descricao ||
            "",


        tabelaId:
            tabelaAtualId,


        cidade:
            document
                .getElementById(
                    "cidade"
                )
                .value
                .trim(),


        localidade:
            document
                .getElementById(
                    "localidade"
                )
                .value
                .trim(),


        responsavel:
            document
                .getElementById(
                    "responsavel"
                )
                .value
                .trim(),


        dataServico:
            document
                .getElementById(
                    "dataServico"
                )
                .value,


        descricao:
            document
                .getElementById(
                    "descricaoGeral"
                )
                .value
                .trim(),


        itens:
            itensMedicao,


        valorTotal:
            total

    };

}


/* =========================================================
   VALIDAR MEDIÇÃO
========================================================= */

function validarMedicao(
    medicao
) {

    if (!medicao.prestadorId) {

        alert(
            "Selecione o prestador."
        );

        return false;

    }


    if (!medicao.contratoId) {

        alert(
            "Selecione o contrato."
        );

        return false;

    }


    if (!medicao.tabelaId) {

        alert(
            "O contrato não possui tabela de preços válida."
        );

        return false;

    }


    if (!medicao.cidade) {

        alert(
            "Informe a cidade."
        );

        return false;

    }


    if (!medicao.localidade) {

        alert(
            "Informe a localidade ou unidade."
        );

        return false;

    }


    if (!medicao.responsavel) {

        alert(
            "Informe o responsável pela solicitação."
        );

        return false;

    }


    if (!medicao.dataServico) {

        alert(
            "Informe a data do serviço."
        );

        return false;

    }


    if (
        medicao.itens.length === 0
    ) {

        alert(
            "Adicione pelo menos um serviço."
        );

        return false;

    }


    return true;

}


/* =========================================================
   SNAPSHOT DOS ITENS
========================================================= */

function prepararItensFirestore() {

    return itensMedicao.map(
        function (item) {

            return {

                itemTabelaId:
                    item.itemTabelaId ||
                    "",

                codigoEnergisa:
                    item.codigoEnergisa ||
                    "",

                codigoPini:
                    item.codigoPini ||
                    "",

                especificacao:
                    item.especificacao ||
                    "",

                unidade:
                    item.unidade ||
                    "",

                valorUnitario:
                    Number(
                        item.valorUnitario
                    ) || 0,

                quantidade:
                    Number(
                        item.quantidade
                    ) || 0,

                total:
                    Number(
                        item.total
                    ) || 0

            };

        }
    );

}


/* =========================================================
   GERAR NOVA MEDIÇÃO COM NUMERAÇÃO
========================================================= */

async function criarMedicaoComNumeracao(
    dados
) {

    /*
        A numeração reinicia a cada ano:

        MED-2026-0001
        MED-2026-0002

        Em 2027:

        MED-2027-0001
    */

    const ano =
        new Date()
            .getFullYear();


    const referenciaContador =
        doc(
            db,
            "contadores",
            `medicoes_${ano}`
        );


    /*
        Criamos a referência antes da transação,
        mas o documento ainda não existe no banco.
    */

    const referenciaMedicao =
        doc(
            collection(
                db,
                "medicoes"
            )
        );


    const resultado =
        await runTransaction(
            db,
            async function (
                transacao
            ) {

                const contadorSnapshot =
                    await transacao.get(
                        referenciaContador
                    );


                let proximoNumero =
                    1;


                if (
                    contadorSnapshot.exists()
                ) {

                    const contador =
                        contadorSnapshot.data();


                    const ultimoNumero =
                        Number(
                            contador.ultimoNumero
                        ) || 0;


                    proximoNumero =
                        ultimoNumero + 1;

                }


                const numeroMedicao =
                    `MED-${ano}-${String(
                        proximoNumero
                    ).padStart(
                        4,
                        "0"
                    )}`;


                /*
                    ATUALIZAR CONTADOR
                */

                transacao.set(
                    referenciaContador,
                    {

                        ano:
                            ano,

                        ultimoNumero:
                            proximoNumero

                    }
                );


                /*
                    CRIAR MEDIÇÃO
                */

                const novoDocumento = {

                    ...dados,

                    numeroMedicao:
                        numeroMedicao,

                    anoMedicao:
                        ano,

                    criadoEm:
                        serverTimestamp()

                };


                if (
                    dados.status ===
                    "enviado"
                ) {

                    novoDocumento.enviadoEm =
                        serverTimestamp();

                }


                transacao.set(
                    referenciaMedicao,
                    novoDocumento
                );


                return {

                    id:
                        referenciaMedicao.id,

                    numeroMedicao:
                        numeroMedicao

                };

            }
        );


    return resultado;

}


/* =========================================================
   BLOQUEAR BOTÕES
========================================================= */

function bloquearBotoes(
    bloquear
) {

    btnSalvarRascunho.disabled =
        bloquear;


    btnEnviarMedicao.disabled =
        bloquear;

}


/* =========================================================
   SALVAR MEDIÇÃO
========================================================= */

async function salvarMedicaoFirestore(
    status
) {

    const medicao =
        montarMedicao();


    /*
        RASCUNHO PRECISA PELO MENOS
        DE PRESTADOR E CONTRATO.
    */

    if (!medicao.prestadorId) {

        alert(
            "Selecione o prestador antes de salvar."
        );


        return null;

    }


    if (!medicao.contratoId) {

        alert(
            "Selecione o contrato antes de salvar."
        );


        return null;

    }


    /*
        ENVIO EXIGE TUDO PREENCHIDO.
    */

    if (
        status === "enviado"
        &&
        !validarMedicao(
            medicao
        )
    ) {

        return null;

    }


    const usuario =
        getUsuarioSistema();


    if (!usuario) {

        alert(
            "Não foi possível identificar o usuário conectado."
        );


        return null;

    }


    bloquearBotoes(
        true
    );


    try {

        const dados = {

            prestadorId:
                medicao.prestadorId,

            prestadorNome:
                medicao.prestadorNome,


            contratoId:
                medicao.contratoId,

            contratoNumero:
                medicao.contratoNumero,

            contratoDescricao:
                medicao.contratoDescricao,


            tabelaId:
                medicao.tabelaId ||
                "",


            cidade:
                medicao.cidade,

            localidade:
                medicao.localidade,

            responsavel:
                medicao.responsavel,

            dataServico:
                medicao.dataServico,

            descricao:
                medicao.descricao,


            valorTotal:
                Number(
                    medicao.valorTotal
                ) || 0,


            quantidadeItens:
                medicao.itens.length,


            status:
                status,


            criadoPorUid:
                usuario.uid,

            criadoPorNome:
                usuario.nome ||
                "",

            criadoPorPerfil:
                usuario.perfil ||
                "",


            atualizadoEm:
                serverTimestamp(),


            itens:
                prepararItensFirestore()

        };


        /* =============================================
           JÁ EXISTE: ATUALIZAR
        ============================================= */

        if (
            medicaoIdAtual
        ) {

            const referencia =
                doc(
                    db,
                    "medicoes",
                    medicaoIdAtual
                );


            if (
                status === "enviado"
            ) {

                dados.enviadoEm =
                    serverTimestamp();

            }


            await updateDoc(
                referencia,
                dados
            );


            console.log(
                "Medição atualizada:",
                numeroMedicaoAtual
            );


            return {

                id:
                    medicaoIdAtual,

                numeroMedicao:
                    numeroMedicaoAtual

            };

        }


        /* =============================================
           PRIMEIRO SALVAMENTO
           GERAR NÚMERO AUTOMATICAMENTE
        ============================================= */

        const resultado =
            await criarMedicaoComNumeracao(
                dados
            );


        medicaoIdAtual =
            resultado.id;


        numeroMedicaoAtual =
            resultado.numeroMedicao;


        console.log(
            "Medição criada:",
            numeroMedicaoAtual
        );


        console.log(
            "Documento:",
            medicaoIdAtual
        );


        return resultado;


    } catch (erro) {

        console.error(
            "Erro ao salvar medição:",
            erro
        );


        if (
            erro.code ===
            "permission-denied"
        ) {

            alert(
                "O Firestore bloqueou o salvamento. Verifique as regras da coleção contadores."
            );

        } else {

            alert(
                "Não foi possível salvar a medição."
            );

        }


        return null;


    } finally {

        bloquearBotoes(
            false
        );

    }

}


/* =========================================================
   SALVAR RASCUNHO
========================================================= */

btnSalvarRascunho.addEventListener(
    "click",
    async function () {

        const resultado =
            await salvarMedicaoFirestore(
                "rascunho"
            );


        if (!resultado) {
            return;
        }


        alert(
            `Rascunho ${resultado.numeroMedicao} salvo com sucesso.`
        );

    }
);


/* =========================================================
   ENVIAR MEDIÇÃO
========================================================= */

btnEnviarMedicao.addEventListener(
    "click",
    async function () {

        const medicao =
            montarMedicao();


        if (
            !validarMedicao(
                medicao
            )
        ) {

            return;

        }


        const confirmar =
            confirm(
                "Deseja enviar esta medição para análise?"
            );


        if (!confirmar) {
            return;
        }


        const resultado =
            await salvarMedicaoFirestore(
                "enviado"
            );


        if (!resultado) {
            return;
        }


        alert(
            `${resultado.numeroMedicao} enviada com sucesso.`
        );


        window.location.href =
            "medicoes.html";

    }
);


/* =========================================================
   FECHAR RESULTADOS
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const clicouPesquisa =
            event.target.closest(
                ".campo-pesquisa"
            );


        if (!clicouPesquisa) {

            resultadosPesquisa.classList.remove(
                "visivel"
            );

        }

    }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function inicializarNovaMedicao() {

    console.log(
        "Inicializando Nova Medição..."
    );


    definirDataAtual();


    await carregarPrestadores();

}


const usuarioInicial =
    getUsuarioSistema();


if (usuarioInicial) {

    inicializarNovaMedicao();

} else {

    window.addEventListener(
        "usuarioSistemaCarregado",
        inicializarNovaMedicao,
        {
            once: true
        }
    );

}