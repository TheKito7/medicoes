/* =========================================================
   ORÇAMENTO RÁPIDO - ENERGISA
   TABELAS DE PREÇOS
========================================================= */

console.log(
    "tabelasPrecos.js carregado"
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
    getDocs,
    updateDoc,
    setDoc,
    writeBatch,
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
   PÁGINA
========================================================= */

const indicadorTabelas =
    document.getElementById(
        "indicadorTabelas"
    );


const indicadorAtivas =
    document.getElementById(
        "indicadorAtivas"
    );


const indicadorItens =
    document.getElementById(
        "indicadorItens"
    );


const indicadorContratos =
    document.getElementById(
        "indicadorContratos"
    );


const inputPesquisaTabela =
    document.getElementById(
        "inputPesquisaTabela"
    );


const filtroStatusTabela =
    document.getElementById(
        "filtroStatusTabela"
    );


const listaTabelas =
    document.getElementById(
        "listaTabelas"
    );


const textoQuantidadeTabelas =
    document.getElementById(
        "textoQuantidadeTabelas"
    );


/* =========================================================
   MODAL ITENS
========================================================= */

const modalItens =
    document.getElementById(
        "modalItens"
    );


const btnFecharItens =
    document.getElementById(
        "btnFecharItens"
    );


const tituloModalItens =
    document.getElementById(
        "tituloModalItens"
    );


const subtituloModalItens =
    document.getElementById(
        "subtituloModalItens"
    );


const inputPesquisaItem =
    document.getElementById(
        "inputPesquisaItem"
    );


const contadorItensModal =
    document.getElementById(
        "contadorItensModal"
    );


const listaItensTabela =
    document.getElementById(
        "listaItensTabela"
    );


/* =========================================================
   MODAL EDITAR ITEM
========================================================= */

const modalEditarItem =
    document.getElementById(
        "modalEditarItem"
    );


const btnFecharEditarItem =
    document.getElementById(
        "btnFecharEditarItem"
    );


const btnCancelarEditarItem =
    document.getElementById(
        "btnCancelarEditarItem"
    );


const formEditarItem =
    document.getElementById(
        "formEditarItem"
    );


const itemId =
    document.getElementById(
        "itemId"
    );


const itemCodigoEnergisa =
    document.getElementById(
        "itemCodigoEnergisa"
    );


const itemCodigoPini =
    document.getElementById(
        "itemCodigoPini"
    );


const itemEspecificacao =
    document.getElementById(
        "itemEspecificacao"
    );


const itemUnidade =
    document.getElementById(
        "itemUnidade"
    );


const itemQuantidadeEstimada =
    document.getElementById(
        "itemQuantidadeEstimada"
    );


const itemMat =
    document.getElementById(
        "itemMat"
    );


const itemMo =
    document.getElementById(
        "itemMo"
    );


const itemValorUnitario =
    document.getElementById(
        "itemValorUnitario"
    );


const itemTotalEstimado =
    document.getElementById(
        "itemTotalEstimado"
    );


const btnSalvarItem =
    document.getElementById(
        "btnSalvarItem"
    );


/* =========================================================
   ESTADO
========================================================= */

let tabelas =
    [];


let contratos =
    [];


let prestadores =
    [];


let tabelaAtual =
    null;


let itensTabelaAtual =
    [];


/* =========================================================
   UTILITÁRIOS
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


function normalizarTexto(
    valor
) {

    return String(
        valor ?? ""
    )
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();

}


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


function obterPrestador(
    id
) {

    return prestadores.find(
        function (
            prestador
        ) {

            return prestador.id ===
                id;

        }
    );

}


function obterContrato(
    id
) {

    return contratos.find(
        function (
            contrato
        ) {

            return contrato.id ===
                id
                ||
                String(
                    contrato.numero
                ) ===
                String(
                    id
                );

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


        await signOut(
            auth
        );


        window.location.href =
            "../index.html";

    }
);


/* =========================================================
   CARREGAR DADOS
========================================================= */

async function carregarDados() {

    try {

        const [
            snapshotTabelas,
            snapshotContratos,
            snapshotPrestadores
        ] =
            await Promise.all(
                [

                    getDocs(
                        collection(
                            db,
                            "tabelasPrecos"
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
                            "prestadores"
                        )
                    )

                ]
            );


        tabelas =
            snapshotTabelas.docs.map(
                function (
                    documento
                ) {

                    return {

                        id:
                            documento.id,

                        ...documento.data(),

                        quantidadeItens:
                            0

                    };

                }
            );


        contratos =
            snapshotContratos.docs.map(
                function (
                    documento
                ) {

                    return {

                        id:
                            documento.id,

                        ...documento.data()

                    };

                }
            );


        prestadores =
            snapshotPrestadores.docs.map(
                function (
                    documento
                ) {

                    return {

                        id:
                            documento.id,

                        ...documento.data()

                    };

                }
            );


        /*
            Contagem dos itens de cada tabela.
        */

        await Promise.all(
            tabelas.map(
                async function (
                    tabela
                ) {

                    const snapshotItens =
                        await getDocs(
                            collection(
                                db,
                                "tabelasPrecos",
                                tabela.id,
                                "itens"
                            )
                        );


                    tabela.quantidadeItens =
                        snapshotItens.size;

                }
            )
        );


        tabelas.sort(
            function (
                a,
                b
            ) {

                return Number(
                    b.versao || 0
                ) -
                Number(
                    a.versao || 0
                );

            }
        );


        atualizarIndicadores();

        renderizarTabelas();


    } catch (erro) {

        console.error(
            "Erro ao carregar tabelas:",
            erro
        );


        listaTabelas.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="estado-tabela">

                        Não foi possível carregar as tabelas de preços.

                    </div>

                </td>

            </tr>

        `;

    }

}


/* =========================================================
   INDICADORES
========================================================= */

function atualizarIndicadores() {

    const ativas =
        tabelas.filter(
            function (
                tabela
            ) {

                return tabela.ativa ===
                    true;

            }
        ).length;


    const totalItens =
        tabelas.reduce(
            function (
                total,
                tabela
            ) {

                return total +
                    Number(
                        tabela.quantidadeItens || 0
                    );

            },
            0
        );


    const contratosVinculados =
        new Set(
            tabelas
                .map(
                    function (
                        tabela
                    ) {

                        return tabela.contratoId;

                    }
                )
                .filter(
                    Boolean
                )
        ).size;


    indicadorTabelas.textContent =
        tabelas.length;


    indicadorAtivas.textContent =
        ativas;


    indicadorItens.textContent =
        totalItens;


    indicadorContratos.textContent =
        contratosVinculados;

}


/* =========================================================
   FILTRAR TABELAS
========================================================= */

function obterTabelasFiltradas() {

    const pesquisa =
        normalizarTexto(
            inputPesquisaTabela.value
        );


    const status =
        filtroStatusTabela.value;


    return tabelas.filter(
        function (
            tabela
        ) {

            const prestador =
                obterPrestador(
                    tabela.prestadorId
                );


            const contrato =
                obterContrato(
                    tabela.contratoId
                );


            const texto =
                normalizarTexto(
                    [
                        tabela.id,
                        tabela.nome,
                        tabela.contratoId,
                        contrato?.numero,
                        contrato?.descricao,
                        prestador?.nome
                    ].join(
                        " "
                    )
                );


            const atendePesquisa =
                !pesquisa
                ||
                texto.includes(
                    pesquisa
                );


            let atendeStatus =
                true;


            if (
                status ===
                "ativa"
            ) {

                atendeStatus =
                    tabela.ativa ===
                    true;

            }


            if (
                status ===
                "inativa"
            ) {

                atendeStatus =
                    tabela.ativa !==
                    true;

            }


            return atendePesquisa &&
                atendeStatus;

        }
    );

}


/* =========================================================
   RENDERIZAR TABELAS
========================================================= */

function renderizarTabelas() {

    const filtradas =
        obterTabelasFiltradas();


    textoQuantidadeTabelas.textContent =
        filtradas.length === 1
            ? "1 tabela encontrada"
            : `${filtradas.length} tabelas encontradas`;


    if (
        filtradas.length ===
        0
    ) {

        listaTabelas.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="estado-tabela">

                        Nenhuma tabela encontrada.

                    </div>

                </td>

            </tr>

        `;


        return;

    }


    listaTabelas.innerHTML =
        filtradas.map(
            function (
                tabela
            ) {

                const contrato =
                    obterContrato(
                        tabela.contratoId
                    );


                const prestador =
                    obterPrestador(
                        tabela.prestadorId
                    );


                const ativa =
                    tabela.ativa ===
                    true;


                return `

                    <tr>


                        <td>

                            <div class="nome-tabela">

                                <strong>

                                    ${escaparHTML(
                                        tabela.nome ||
                                        "Tabela de preços"
                                    )}

                                </strong>

                                <span>

                                    ${escaparHTML(
                                        tabela.id
                                    )}

                                </span>

                            </div>

                        </td>


                        <td>

                            ${escaparHTML(
                                contrato?.numero ||
                                tabela.contratoId ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escaparHTML(
                                prestador?.nome ||
                                tabela.prestadorId ||
                                "-"
                            )}

                        </td>


                        <td>

                            v${escaparHTML(
                                tabela.versao || 1
                            )}

                        </td>


                        <td>

                            <span class="badge-itens">

                                ${tabela.quantidadeItens}

                            </span>

                        </td>


                        <td>

                            <span class="
                                badge-status
                                ${
                                    ativa
                                        ? "status-ativo"
                                        : "status-inativo"
                                }
                            ">

                                ${
                                    ativa
                                        ? "Ativa"
                                        : "Inativa"
                                }

                            </span>

                        </td>


                        <td>

                            <div class="acoes-tabela">


                                <button
                                    type="button"
                                    class="
                                        btn-acao-tabela
                                        btn-ver-itens
                                    "
                                    data-id="${escaparHTML(
                                        tabela.id
                                    )}"
                                    title="Visualizar itens"
                                >

                                    <i class="bx bx-show"></i>

                                </button>


                                <button
                                    type="button"
                                    class="
                                        btn-acao-tabela
                                        btn-nova-versao
                                    "
                                    data-id="${escaparHTML(
                                        tabela.id
                                    )}"
                                    title="Criar nova versão"
                                >

                                    <i class="bx bx-copy"></i>

                                </button>


                                <button
                                    type="button"
                                    class="
                                        btn-acao-tabela
                                        btn-status-tabela
                                    "
                                    data-id="${escaparHTML(
                                        tabela.id
                                    )}"
                                    data-ativa="${
                                        ativa
                                    }"
                                    title="${
                                        ativa
                                            ? "Desativar tabela"
                                            : "Ativar tabela"
                                    }"
                                >

                                    <i class="
                                        bx
                                        ${
                                            ativa
                                                ? "bx-pause-circle"
                                                : "bx-check-circle"
                                        }
                                    "></i>

                                </button>


                            </div>

                        </td>


                    </tr>

                `;

            }
        )
        .join(
            ""
        );


    configurarAcoesTabelas();

}


/* =========================================================
   AÇÕES DA LISTA
========================================================= */

function configurarAcoesTabelas() {

    document
        .querySelectorAll(
            ".btn-ver-itens"
        )
        .forEach(
            function (
                botao
            ) {

                botao.addEventListener(
                    "click",
                    function () {

                        abrirItensTabela(
                            botao.dataset.id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".btn-nova-versao"
        )
        .forEach(
            function (
                botao
            ) {

                botao.addEventListener(
                    "click",
                    function () {

                        criarNovaVersao(
                            botao.dataset.id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".btn-status-tabela"
        )
        .forEach(
            function (
                botao
            ) {

                botao.addEventListener(
                    "click",
                    function () {

                        alterarStatusTabela(
                            botao.dataset.id,
                            botao.dataset.ativa ===
                            "true"
                        );

                    }
                );

            }
        );

}


/* =========================================================
   ABRIR ITENS
========================================================= */

async function abrirItensTabela(
    id
) {

    tabelaAtual =
        tabelas.find(
            function (
                tabela
            ) {

                return tabela.id ===
                    id;

            }
        );


    if (!tabelaAtual) {

        return;

    }


    tituloModalItens.textContent =
        tabelaAtual.nome ||
        tabelaAtual.id;


    subtituloModalItens.textContent =
        `${tabelaAtual.id} • versão ${
            tabelaAtual.versao || 1
        }`;


    inputPesquisaItem.value =
        "";


    modalItens.classList.remove(
        "oculto"
    );


    document.body.style.overflow =
        "hidden";


    listaItensTabela.innerHTML = `

        <tr>

            <td colspan="8">

                <div class="estado-tabela">

                    <i class="bx bx-loader-alt bx-spin"></i>

                    Carregando itens...

                </div>

            </td>

        </tr>

    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "tabelasPrecos",
                    tabelaAtual.id,
                    "itens"
                )
            );


        itensTabelaAtual =
            snapshot.docs.map(
                function (
                    documento
                ) {

                    return {

                        id:
                            documento.id,

                        ...documento.data()

                    };

                }
            );


        itensTabelaAtual.sort(
            function (
                a,
                b
            ) {

                return String(
                    a.codigoEnergisa ||
                    ""
                ).localeCompare(
                    String(
                        b.codigoEnergisa ||
                        ""
                    ),
                    "pt-BR",
                    {
                        numeric:
                            true
                    }
                );

            }
        );


        renderizarItens();


    } catch (erro) {

        console.error(
            "Erro ao carregar itens:",
            erro
        );


        listaItensTabela.innerHTML = `

            <tr>

                <td colspan="8">

                    <div class="estado-tabela">

                        Não foi possível carregar os itens.

                    </div>

                </td>

            </tr>

        `;

    }

}


/* =========================================================
   FILTRAR ITENS
========================================================= */

function obterItensFiltrados() {

    const pesquisa =
        normalizarTexto(
            inputPesquisaItem.value
        );


    if (!pesquisa) {

        return itensTabelaAtual;

    }


    return itensTabelaAtual.filter(
        function (
            item
        ) {

            const texto =
                normalizarTexto(
                    [
                        item.codigoEnergisa,
                        item.codigoPini,
                        item.especificacao,
                        item.unidade
                    ].join(
                        " "
                    )
                );


            return texto.includes(
                pesquisa
            );

        }
    );

}


/* =========================================================
   RENDERIZAR ITENS
========================================================= */

function renderizarItens() {

    const itens =
        obterItensFiltrados();


    contadorItensModal.textContent =
        itens.length === 1
            ? "1 item"
            : `${itens.length} itens`;


    if (
        itens.length ===
        0
    ) {

        listaItensTabela.innerHTML = `

            <tr>

                <td colspan="8">

                    <div class="estado-tabela">

                        Nenhum serviço encontrado.

                    </div>

                </td>

            </tr>

        `;


        return;

    }


    listaItensTabela.innerHTML =
        itens.map(
            function (
                item
            ) {

                return `

                    <tr>


                        <td>

                            ${escaparHTML(
                                item.codigoEnergisa ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escaparHTML(
                                item.codigoPini ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escaparHTML(
                                item.especificacao ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escaparHTML(
                                item.unidade ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${formatarMoeda(
                                item.mat
                            )}

                        </td>


                        <td>

                            ${formatarMoeda(
                                item.mo
                            )}

                        </td>


                        <td>

                            <span class="valor-preco">

                                ${formatarMoeda(
                                    item.valorUnitario
                                )}

                            </span>

                        </td>


                        <td>

                            <button
                                type="button"
                                class="
                                    btn-acao-tabela
                                    btn-editar-item
                                "
                                data-id="${escaparHTML(
                                    item.id
                                )}"
                                title="Editar item"
                            >

                                <i class="bx bx-edit-alt"></i>

                            </button>

                        </td>


                    </tr>

                `;

            }
        )
        .join(
            ""
        );


    document
        .querySelectorAll(
            ".btn-editar-item"
        )
        .forEach(
            function (
                botao
            ) {

                botao.addEventListener(
                    "click",
                    function () {

                        abrirEdicaoItem(
                            botao.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================================================
   FECHAR MODAL ITENS
========================================================= */

function fecharModalItens() {

    modalItens.classList.add(
        "oculto"
    );


    document.body.style.overflow =
        "";


    tabelaAtual =
        null;


    itensTabelaAtual =
        [];

}


btnFecharItens?.addEventListener(
    "click",
    fecharModalItens
);


/* =========================================================
   EDITAR ITEM
========================================================= */

function abrirEdicaoItem(
    id
) {

    const item =
        itensTabelaAtual.find(
            function (
                registro
            ) {

                return registro.id ===
                    id;

            }
        );


    if (!item) {

        return;

    }


    itemId.value =
        item.id;


    itemCodigoEnergisa.value =
        item.codigoEnergisa ||
        "";


    itemCodigoPini.value =
        item.codigoPini ||
        "";


    itemEspecificacao.value =
        item.especificacao ||
        "";


    itemUnidade.value =
        item.unidade ||
        "";


    itemQuantidadeEstimada.value =
        Number(
            item.quantidadeEstimada || 0
        );


    itemMat.value =
        Number(
            item.mat || 0
        );


    itemMo.value =
        Number(
            item.mo || 0
        );


    itemValorUnitario.value =
        Number(
            item.valorUnitario || 0
        );


    itemTotalEstimado.value =
        Number(
            item.totalEstimado || 0
        );


    modalEditarItem.classList.remove(
        "oculto"
    );

}


/* =========================================================
   FECHAR EDITAR ITEM
========================================================= */

function fecharEditarItem() {

    modalEditarItem.classList.add(
        "oculto"
    );

}


btnFecharEditarItem?.addEventListener(
    "click",
    fecharEditarItem
);


btnCancelarEditarItem?.addEventListener(
    "click",
    fecharEditarItem
);


/* =========================================================
   SALVAR ITEM
========================================================= */

formEditarItem?.addEventListener(
    "submit",
    async function (
        evento
    ) {

        evento.preventDefault();


        if (
            !tabelaAtual
        ) {

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


        const id =
            itemId.value;


        const especificacao =
            itemEspecificacao.value.trim();


        if (!especificacao) {

            alert(
                "Informe a especificação do serviço."
            );


            return;

        }


        btnSalvarItem.disabled =
            true;


        const htmlOriginal =
            btnSalvarItem.innerHTML;


        btnSalvarItem.innerHTML = `

            <i class="bx bx-loader-alt bx-spin"></i>

            Salvando...

        `;


        try {

            const dados = {

                codigoEnergisa:
                    itemCodigoEnergisa.value.trim(),

                codigoPini:
                    itemCodigoPini.value.trim(),

                especificacao:
                    especificacao,

                unidade:
                    itemUnidade.value.trim(),

                quantidadeEstimada:
                    Number(
                        itemQuantidadeEstimada.value
                    ) || 0,

                mat:
                    Number(
                        itemMat.value
                    ) || 0,

                mo:
                    Number(
                        itemMo.value
                    ) || 0,

                valorUnitario:
                    Number(
                        itemValorUnitario.value
                    ) || 0,

                totalEstimado:
                    Number(
                        itemTotalEstimado.value
                    ) || 0,

                atualizadoPorUid:
                    usuario.uid,

                atualizadoPorNome:
                    usuario.nome || "",

                atualizadoEm:
                    serverTimestamp()

            };


            await updateDoc(
                doc(
                    db,
                    "tabelasPrecos",
                    tabelaAtual.id,
                    "itens",
                    id
                ),
                dados
            );


            const indice =
                itensTabelaAtual.findIndex(
                    function (
                        registro
                    ) {

                        return registro.id ===
                            id;

                    }
                );


            if (
                indice >= 0
            ) {

                itensTabelaAtual[indice] = {

                    ...itensTabelaAtual[indice],

                    ...dados

                };

            }


            fecharEditarItem();


            renderizarItens();


            alert(
                "Item atualizado com sucesso."
            );


        } catch (erro) {

            console.error(
                "Erro ao atualizar item:",
                erro
            );


            alert(
                "Não foi possível atualizar o item."
            );


        } finally {

            btnSalvarItem.disabled =
                false;


            btnSalvarItem.innerHTML =
                htmlOriginal;

        }

    }
);


/* =========================================================
   STATUS DA TABELA
========================================================= */

async function alterarStatusTabela(
    id,
    statusAtual
) {

    const tabela =
        tabelas.find(
            function (
                registro
            ) {

                return registro.id ===
                    id;

            }
        );


    if (!tabela) {

        return;

    }


    const novaAtiva =
        !statusAtual;


    const confirmar =
        confirm(
            `Deseja ${
                novaAtiva
                    ? "ativar"
                    : "desativar"
            } a tabela "${tabela.nome}"?`
        );


    if (!confirmar) {

        return;

    }


    try {

        const usuario =
            getUsuarioSistema();


        await updateDoc(
            doc(
                db,
                "tabelasPrecos",
                id
            ),
            {

                ativa:
                    novaAtiva,

                atualizadoPorUid:
                    usuario?.uid || "",

                atualizadoPorNome:
                    usuario?.nome || "",

                atualizadoEm:
                    serverTimestamp()

            }
        );


        tabela.ativa =
            novaAtiva;


        atualizarIndicadores();

        renderizarTabelas();


    } catch (erro) {

        console.error(
            "Erro ao alterar status:",
            erro
        );


        alert(
            "Não foi possível alterar o status da tabela."
        );

    }

}


/* =========================================================
   NOVA VERSÃO
========================================================= */

async function criarNovaVersao(
    tabelaId
) {

    const origem =
        tabelas.find(
            function (
                tabela
            ) {

                return tabela.id ===
                    tabelaId;

            }
        );


    if (!origem) {

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


    const versoesMesmoContrato =
        tabelas
            .filter(
                function (
                    tabela
                ) {

                    return tabela.contratoId ===
                        origem.contratoId;

                }
            )
            .map(
                function (
                    tabela
                ) {

                    return Number(
                        tabela.versao || 1
                    );

                }
            );


    const novaVersao =
        Math.max(
            0,
            ...versoesMesmoContrato
        ) + 1;


    const novoId =
        `${origem.contratoId}-v${novaVersao}`;


    const confirmar =
        confirm(
            `Criar a versão ${novaVersao} copiando os ${origem.quantidadeItens} itens da tabela atual?`
        );


    if (!confirmar) {

        return;

    }


    try {

        /*
            Primeiro carregamos os itens da versão atual.
        */

        const snapshotItens =
            await getDocs(
                collection(
                    db,
                    "tabelasPrecos",
                    origem.id,
                    "itens"
                )
            );


        /*
            Criar documento principal.
        */

        await setDoc(
            doc(
                db,
                "tabelasPrecos",
                novoId
            ),
            {

                nome:
                    origem.nome ||
                    "Tabela de preços",

                contratoId:
                    origem.contratoId ||
                    "",

                prestadorId:
                    origem.prestadorId ||
                    "",

                versao:
                    novaVersao,

                ativa:
                    false,

                criadaAPartirDe:
                    origem.id,

                criadoPorUid:
                    usuario.uid,

                criadoPorNome:
                    usuario.nome || "",

                criadoEm:
                    serverTimestamp(),

                atualizadoEm:
                    serverTimestamp()

            }
        );


        /*
            Firestore permite até 500 operações por batch.
            Como nossa tabela atual tem 360 itens, cabe em um lote.
            Ainda assim, o código abaixo divide em grupos menores.
        */

        const documentos =
            snapshotItens.docs;


        const tamanhoLote =
            400;


        for (
            let inicio = 0;
            inicio < documentos.length;
            inicio += tamanhoLote
        ) {

            const lote =
                writeBatch(
                    db
                );


            const grupo =
                documentos.slice(
                    inicio,
                    inicio + tamanhoLote
                );


            grupo.forEach(
                function (
                    documento
                ) {

                    const destino =
                        doc(
                            db,
                            "tabelasPrecos",
                            novoId,
                            "itens",
                            documento.id
                        );


                    lote.set(
                        destino,
                        documento.data()
                    );

                }
            );


            await lote.commit();

        }


        alert(
            `Versão ${novaVersao} criada com sucesso. Ela foi criada como inativa para revisão.`
        );


        await carregarDados();


    } catch (erro) {

        console.error(
            "Erro ao criar nova versão:",
            erro
        );


        alert(
            "Não foi possível criar a nova versão da tabela."
        );

    }

}


/* =========================================================
   PESQUISAS
========================================================= */

inputPesquisaTabela?.addEventListener(
    "input",
    renderizarTabelas
);


filtroStatusTabela?.addEventListener(
    "change",
    renderizarTabelas
);


inputPesquisaItem?.addEventListener(
    "input",
    renderizarItens
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

        alert(
            "Esta página é exclusiva para administradores."
        );


        window.location.href =
            "dashboard.html";


        return;

    }


    await carregarDados();

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
