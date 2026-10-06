/* =========================================================
   ORÇAMENTO RÁPIDO - ENERGISA
   GESTÃO DE CONTRATOS
========================================================= */

console.log(
    "contratos.js carregado"
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
    updateDoc,
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

const btnNovoContrato =
    document.getElementById(
        "btnNovoContrato"
    );


const inputPesquisa =
    document.getElementById(
        "inputPesquisa"
    );


const filtroPrestador =
    document.getElementById(
        "filtroPrestador"
    );


const filtroStatus =
    document.getElementById(
        "filtroStatus"
    );


const listaContratos =
    document.getElementById(
        "listaContratos"
    );


const textoQuantidadeContratos =
    document.getElementById(
        "textoQuantidadeContratos"
    );


const indicadorTotal =
    document.getElementById(
        "indicadorTotal"
    );


const indicadorAtivos =
    document.getElementById(
        "indicadorAtivos"
    );


const indicadorInativos =
    document.getElementById(
        "indicadorInativos"
    );


const indicadorMedicoes =
    document.getElementById(
        "indicadorMedicoes"
    );


/* =========================================================
   MODAL
========================================================= */

const modalContrato =
    document.getElementById(
        "modalContrato"
    );


const tituloModal =
    document.getElementById(
        "tituloModal"
    );


const btnFecharModal =
    document.getElementById(
        "btnFecharModal"
    );


const btnCancelar =
    document.getElementById(
        "btnCancelar"
    );


const formContrato =
    document.getElementById(
        "formContrato"
    );


const contratoId =
    document.getElementById(
        "contratoId"
    );


const numeroContrato =
    document.getElementById(
        "numeroContrato"
    );


const descricaoContrato =
    document.getElementById(
        "descricaoContrato"
    );


const prestadorContrato =
    document.getElementById(
        "prestadorContrato"
    );


const tabelaContrato =
    document.getElementById(
        "tabelaContrato"
    );


const statusContrato =
    document.getElementById(
        "statusContrato"
    );


const btnSalvarContrato =
    document.getElementById(
        "btnSalvarContrato"
    );


const ajudaNumeroContrato =
    document.getElementById(
        "ajudaNumeroContrato"
    );


const resumoVinculo =
    document.getElementById(
        "resumoVinculo"
    );


const resumoVinculoTexto =
    document.getElementById(
        "resumoVinculoTexto"
    );


/* =========================================================
   ESTADO
========================================================= */

let contratos =
    [];


let prestadores =
    [];


let tabelasPrecos =
    [];


let medicoes =
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


/* =========================================================
   ID DO CONTRATO
========================================================= */

function gerarIdContrato(
    numero
) {

    return String(
        numero
    )
        .trim()
        .replace(
            /\//g,
            "-"
        )
        .replace(
            /\\/g,
            "-"
        )
        .replace(
            /\s+/g,
            "-"
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

        }

    }
);


/* =========================================================
   PRESTADOR
========================================================= */

function obterPrestador(
    id
) {

    return prestadores.find(
        function (
            prestador
        ) {

            return (
                prestador.id ===
                id
            );

        }
    );

}


/* =========================================================
   TABELA
========================================================= */

function obterTabela(
    id
) {

    return tabelasPrecos.find(
        function (
            tabela
        ) {

            return (
                tabela.id ===
                id
            );

        }
    );

}


/* =========================================================
   CONTAR MEDIÇÕES
========================================================= */

function contarMedicoesContrato(
    contrato
) {

    return medicoes.filter(
        function (
            medicao
        ) {

            if (
                medicao.contratoId
            ) {

                return (
                    String(
                        medicao.contratoId
                    )
                    ===
                    String(
                        contrato.id
                    )
                );

            }


            return (
                String(
                    medicao.contratoNumero
                )
                ===
                String(
                    contrato.numero
                )
            );

        }
    ).length;

}


/* =========================================================
   CARREGAR DADOS
========================================================= */

async function carregarDados() {

    listaContratos.innerHTML = `

        <tr>

            <td colspan="7">

                <div class="estado-tabela">

                    <i class="bx bx-loader-alt bx-spin"></i>

                    Carregando contratos...

                </div>

            </td>

        </tr>

    `;


    try {

        const [
            snapshotContratos,
            snapshotPrestadores,
            snapshotTabelas,
            snapshotMedicoes
        ] =
            await Promise.all(
                [

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
                    ),

                    getDocs(
                        collection(
                            db,
                            "tabelasPrecos"
                        )
                    ),

                    getDocs(
                        collection(
                            db,
                            "medicoes"
                        )
                    )

                ]
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


        tabelasPrecos =
            snapshotTabelas.docs.map(
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


        medicoes =
            snapshotMedicoes.docs.map(
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


        contratos.sort(
            function (
                a,
                b
            ) {

                return String(
                    b.numero ||
                    ""
                ).localeCompare(
                    String(
                        a.numero ||
                        ""
                    ),
                    "pt-BR"
                );

            }
        );


        prestadores.sort(
            function (
                a,
                b
            ) {

                return String(
                    a.nome ||
                    ""
                ).localeCompare(
                    String(
                        b.nome ||
                        ""
                    ),
                    "pt-BR"
                );

            }
        );


        preencherSelectPrestadores();

        preencherSelectTabelas();

        atualizarIndicadores();

        renderizarContratos();


    } catch (erro) {

        console.error(
            "Erro ao carregar contratos:",
            erro
        );


        listaContratos.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="estado-tabela">

                        Não foi possível carregar os contratos.

                    </div>

                </td>

            </tr>

        `;

    }

}


/* =========================================================
   SELECT PRESTADORES
========================================================= */

function preencherSelectPrestadores() {

    const prestadorSelecionado =
        prestadorContrato.value;


    prestadorContrato.innerHTML = `

        <option value="">
            Selecione...
        </option>

    `;


    filtroPrestador.innerHTML = `

        <option value="">
            Todos os prestadores
        </option>

    `;


    prestadores.forEach(
        function (
            prestador
        ) {

            const optionModal =
                document.createElement(
                    "option"
                );


            optionModal.value =
                prestador.id;


            optionModal.textContent =
                prestador.ativo === true
                    ? prestador.nome
                    : `${prestador.nome} — Inativo`;


            prestadorContrato.appendChild(
                optionModal
            );


            const optionFiltro =
                document.createElement(
                    "option"
                );


            optionFiltro.value =
                prestador.id;


            optionFiltro.textContent =
                prestador.nome;


            filtroPrestador.appendChild(
                optionFiltro
            );

        }
    );


    if (
        prestadorSelecionado
    ) {

        prestadorContrato.value =
            prestadorSelecionado;

    }

}


/* =========================================================
   SELECT TABELAS
========================================================= */

function preencherSelectTabelas(
    prestadorIdSelecionado = ""
) {

    const valorAtual =
        tabelaContrato.value;


    tabelaContrato.innerHTML = `

        <option value="">
            Sem tabela vinculada
        </option>

    `;


    let tabelas =
        [
            ...tabelasPrecos
        ];


    if (
        prestadorIdSelecionado
    ) {

        tabelas =
            tabelas.filter(
                function (
                    tabela
                ) {

                    return (
                        !tabela.prestadorId
                        ||
                        tabela.prestadorId ===
                        prestadorIdSelecionado
                    );

                }
            );

    }


    tabelas.sort(
        function (
            a,
            b
        ) {

            return String(
                a.nome ||
                a.id
            ).localeCompare(
                String(
                    b.nome ||
                    b.id
                ),
                "pt-BR"
            );

        }
    );


    tabelas.forEach(
        function (
            tabela
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                tabela.id;


            const nome =
                tabela.nome ||
                "Tabela de preços";


            const versao =
                tabela.versao
                    ? `v${tabela.versao}`
                    : tabela.id;


            option.textContent =
                `${nome} — ${versao}`;


            tabelaContrato.appendChild(
                option
            );

        }
    );


    const existeValorAtual =
        Array.from(
            tabelaContrato.options
        ).some(
            function (
                option
            ) {

                return (
                    option.value ===
                    valorAtual
                );

            }
        );


    if (
        existeValorAtual
    ) {

        tabelaContrato.value =
            valorAtual;

    }

}


/* =========================================================
   INDICADORES
========================================================= */

function atualizarIndicadores() {

    const ativos =
        contratos.filter(
            function (
                contrato
            ) {

                return (
                    contrato.ativo ===
                    true
                );

            }
        ).length;


    const inativos =
        contratos.length -
        ativos;


    if (
        indicadorTotal
    ) {

        indicadorTotal.textContent =
            contratos.length;

    }


    if (
        indicadorAtivos
    ) {

        indicadorAtivos.textContent =
            ativos;

    }


    if (
        indicadorInativos
    ) {

        indicadorInativos.textContent =
            inativos;

    }


    if (
        indicadorMedicoes
    ) {

        indicadorMedicoes.textContent =
            medicoes.length;

    }

}


/* =========================================================
   FILTROS
========================================================= */

function obterContratosFiltrados() {

    const pesquisa =
        normalizarTexto(
            inputPesquisa.value
        );


    const prestadorFiltro =
        filtroPrestador.value;


    const status =
        filtroStatus.value;


    return contratos.filter(
        function (
            contrato
        ) {

            const prestador =
                obterPrestador(
                    contrato.prestadorId
                );


            const texto =
                normalizarTexto(
                    [
                        contrato.numero,
                        contrato.descricao,
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


            const atendePrestador =
                !prestadorFiltro
                ||
                contrato.prestadorId ===
                prestadorFiltro;


            let atendeStatus =
                true;


            if (
                status ===
                "ativo"
            ) {

                atendeStatus =
                    contrato.ativo ===
                    true;

            }


            if (
                status ===
                "inativo"
            ) {

                atendeStatus =
                    contrato.ativo !==
                    true;

            }


            return (
                atendePesquisa
                &&
                atendePrestador
                &&
                atendeStatus
            );

        }
    );

}


/* =========================================================
   RENDERIZAR CONTRATOS
========================================================= */

function renderizarContratos() {

    const filtrados =
        obterContratosFiltrados();


    textoQuantidadeContratos.textContent =
        filtrados.length === 1
            ? "1 contrato encontrado"
            : `${filtrados.length} contratos encontrados`;


    if (
        filtrados.length ===
        0
    ) {

        listaContratos.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="estado-tabela">

                        <i class="bx bx-search"></i>

                        Nenhum contrato encontrado.

                    </div>

                </td>

            </tr>

        `;


        return;

    }


    listaContratos.innerHTML =
        filtrados.map(
            function (
                contrato
            ) {

                const ativo =
                    contrato.ativo ===
                    true;


                const prestador =
                    obterPrestador(
                        contrato.prestadorId
                    );


                const tabela =
                    obterTabela(
                        contrato.tabelaId
                    );


                const quantidadeMedicoes =
                    contarMedicoesContrato(
                        contrato
                    );


                return `

                    <tr>


                        <td>

                            <div class="numero-contrato">

                                <strong>

                                    ${escaparHTML(
                                        contrato.numero ||
                                        contrato.id
                                    )}

                                </strong>

                                <span>

                                    ID:
                                    ${escaparHTML(
                                        contrato.id
                                    )}

                                </span>

                            </div>

                        </td>


                        <td>

                            ${escaparHTML(
                                contrato.descricao ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escaparHTML(
                                prestador?.nome ||
                                contrato.prestadorId ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${
                                tabela
                                    ? `

                                        <div class="tabela-vinculada">

                                            <strong>

                                                ${escaparHTML(
                                                    tabela.nome ||
                                                    tabela.id
                                                )}

                                            </strong>

                                            <span>

                                                ${
                                                    tabela.versao
                                                        ? `Versão ${escaparHTML(
                                                            tabela.versao
                                                        )}`
                                                        : escaparHTML(
                                                            tabela.id
                                                        )
                                                }

                                            </span>

                                        </div>

                                    `
                                    : `

                                        <span>
                                            -
                                        </span>

                                    `
                            }

                        </td>


                        <td>

                            <span class="badge-medicoes">

                                ${quantidadeMedicoes}

                            </span>

                        </td>


                        <td>

                            <span class="
                                badge-status
                                ${
                                    ativo
                                        ? "status-ativo"
                                        : "status-inativo"
                                }
                            ">

                                ${
                                    ativo
                                        ? "Ativo"
                                        : "Inativo"
                                }

                            </span>

                        </td>


                        <td>

                            <div class="acoes-contrato">


                                <button
                                    type="button"
                                    class="
                                        btn-acao-tabela
                                        btn-editar
                                    "
                                    data-id="${escaparHTML(
                                        contrato.id
                                    )}"
                                    title="Editar contrato"
                                >

                                    <i class="bx bx-edit-alt"></i>

                                </button>


                                <button
                                    type="button"
                                    class="
                                        btn-acao-tabela
                                        btn-status
                                    "
                                    data-id="${escaparHTML(
                                        contrato.id
                                    )}"
                                    data-ativo="${
                                        ativo
                                    }"
                                    title="${
                                        ativo
                                            ? "Desativar contrato"
                                            : "Ativar contrato"
                                    }"
                                >

                                    <i class="
                                        bx
                                        ${
                                            ativo
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


    configurarBotoesTabela();

}


/* =========================================================
   BOTÕES TABELA
========================================================= */

function configurarBotoesTabela() {

    document
        .querySelectorAll(
            ".btn-editar"
        )
        .forEach(
            function (
                botao
            ) {

                botao.addEventListener(
                    "click",
                    function () {

                        abrirEdicaoContrato(
                            botao.dataset.id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".btn-status"
        )
        .forEach(
            function (
                botao
            ) {

                botao.addEventListener(
                    "click",
                    function () {

                        alterarStatusContrato(
                            botao.dataset.id,
                            botao.dataset.ativo ===
                            "true"
                        );

                    }
                );

            }
        );

}


/* =========================================================
   NOVO CONTRATO
========================================================= */

btnNovoContrato?.addEventListener(
    "click",
    function () {

        formContrato.reset();


        contratoId.value =
            "";


        numeroContrato.disabled =
            false;


        statusContrato.value =
            "true";


        tituloModal.textContent =
            "Novo contrato";


        ajudaNumeroContrato.textContent =
            "O número será utilizado para identificar o contrato.";


        preencherSelectTabelas();


        atualizarResumoVinculo();


        abrirModal();

    }
);


/* =========================================================
   EDITAR
========================================================= */

function abrirEdicaoContrato(
    id
) {

    const contrato =
        contratos.find(
            function (
                item
            ) {

                return (
                    item.id ===
                    id
                );

            }
        );


    if (!contrato) {

        return;

    }


    contratoId.value =
        contrato.id;


    numeroContrato.value =
        contrato.numero ||
        contrato.id;


    /*
        Evita alterar o ID do documento.
    */

    numeroContrato.disabled =
        true;


    descricaoContrato.value =
        contrato.descricao ||
        "";


    prestadorContrato.value =
        contrato.prestadorId ||
        "";


    preencherSelectTabelas(
        contrato.prestadorId ||
        ""
    );


    tabelaContrato.value =
        contrato.tabelaId ||
        "";


    statusContrato.value =
        contrato.ativo ===
        true
            ? "true"
            : "false";


    tituloModal.textContent =
        "Editar contrato";


    ajudaNumeroContrato.textContent =
        "O número do contrato não pode ser alterado nesta tela.";


    atualizarResumoVinculo();


    abrirModal();

}


/* =========================================================
   MODAL
========================================================= */

function abrirModal() {

    modalContrato.classList.remove(
        "oculto"
    );


    document.body.style.overflow =
        "hidden";

}


function fecharModal() {

    modalContrato.classList.add(
        "oculto"
    );


    document.body.style.overflow =
        "";

}


btnFecharModal?.addEventListener(
    "click",
    fecharModal
);


btnCancelar?.addEventListener(
    "click",
    fecharModal
);


modalContrato?.addEventListener(
    "click",
    function (
        evento
    ) {

        if (
            evento.target ===
            modalContrato
        ) {

            fecharModal();

        }

    }
);


/* =========================================================
   ALTERAR PRESTADOR
========================================================= */

prestadorContrato?.addEventListener(
    "change",
    function () {

        preencherSelectTabelas(
            prestadorContrato.value
        );


        atualizarResumoVinculo();

    }
);


tabelaContrato?.addEventListener(
    "change",
    atualizarResumoVinculo
);


descricaoContrato?.addEventListener(
    "input",
    atualizarResumoVinculo
);


/* =========================================================
   RESUMO VÍNCULO
========================================================= */

function atualizarResumoVinculo() {

    const prestador =
        obterPrestador(
            prestadorContrato.value
        );


    const tabela =
        obterTabela(
            tabelaContrato.value
        );


    if (
        !prestadorContrato.value
        &&
        !tabelaContrato.value
    ) {

        resumoVinculo.classList.add(
            "oculto"
        );


        return;

    }


    resumoVinculo.classList.remove(
        "oculto"
    );


    const nomePrestador =
        prestador?.nome ||
        "Prestador não informado";


    const nomeTabela =
        tabela
            ? (
                tabela.nome ||
                tabela.id
            )
            : "Sem tabela vinculada";


    resumoVinculoTexto.textContent =
        `${nomePrestador} • ${nomeTabela}`;

}


/* =========================================================
   SALVAR
========================================================= */

formContrato?.addEventListener(
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
                "Somente administradores podem cadastrar contratos."
            );


            return;

        }


        const numero =
            numeroContrato.value.trim();


        const descricao =
            descricaoContrato.value.trim();


        const prestadorId =
            prestadorContrato.value;


        if (
            !numero
        ) {

            alert(
                "Informe o número do contrato."
            );


            return;

        }


        if (
            !descricao
        ) {

            alert(
                "Informe a descrição do contrato."
            );


            return;

        }


        if (
            !prestadorId
        ) {

            alert(
                "Selecione o prestador."
            );


            return;

        }


        btnSalvarContrato.disabled =
            true;


        const textoOriginal =
            btnSalvarContrato.innerHTML;


        btnSalvarContrato.innerHTML = `

            <i class="bx bx-loader-alt bx-spin"></i>

            Salvando...

        `;


        try {

            const idAtual =
                contratoId.value;


            const dados = {

                numero:
                    numero,

                descricao:
                    descricao,

                prestadorId:
                    prestadorId,

                tabelaId:
                    tabelaContrato.value ||
                    "",

                ativo:
                    statusContrato.value ===
                    "true",

                atualizadoPorUid:
                    usuario.uid,

                atualizadoPorNome:
                    usuario.nome ||
                    "",

                atualizadoEm:
                    serverTimestamp()

            };


            /* =================================================
               EDIÇÃO
            ================================================= */

            if (
                idAtual
            ) {

                await updateDoc(
                    doc(
                        db,
                        "contratos",
                        idAtual
                    ),
                    dados
                );


                alert(
                    "Contrato atualizado com sucesso."
                );

            }

            /* =================================================
               NOVO
            ================================================= */

            else {

                const novoId =
                    gerarIdContrato(
                        numero
                    );


                if (
                    !novoId
                ) {

                    throw new Error(
                        "Número do contrato inválido."
                    );

                }


                const referencia =
                    doc(
                        db,
                        "contratos",
                        novoId
                    );


                const existente =
                    await getDoc(
                        referencia
                    );


                if (
                    existente.exists()
                ) {

                    alert(
                        "Já existe um contrato com este número."
                    );


                    return;

                }


                await setDoc(
                    referencia,
                    {

                        ...dados,

                        criadoPorUid:
                            usuario.uid,

                        criadoPorNome:
                            usuario.nome ||
                            "",

                        criadoEm:
                            serverTimestamp()

                    }
                );


                alert(
                    "Contrato cadastrado com sucesso."
                );

            }


            fecharModal();


            await carregarDados();


        } catch (erro) {

            console.error(
                "Erro ao salvar contrato:",
                erro
            );


            if (
                erro.code ===
                "permission-denied"
            ) {

                alert(
                    "O Firestore bloqueou esta operação. Verifique as regras."
                );

            } else {

                alert(
                    "Não foi possível salvar o contrato."
                );

            }


        } finally {

            btnSalvarContrato.disabled =
                false;


            btnSalvarContrato.innerHTML =
                textoOriginal;

        }

    }
);


/* =========================================================
   ATIVAR / DESATIVAR
========================================================= */

async function alterarStatusContrato(
    id,
    statusAtual
) {

    const contrato =
        contratos.find(
            function (
                item
            ) {

                return (
                    item.id ===
                    id
                );

            }
        );


    if (!contrato) {

        return;

    }


    const novoStatus =
        !statusAtual;


    const acao =
        novoStatus
            ? "ativar"
            : "desativar";


    const confirmar =
        confirm(
            `Deseja ${acao} o contrato "${contrato.numero}"?`
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
                "contratos",
                id
            ),
            {

                ativo:
                    novoStatus,

                atualizadoPorUid:
                    usuario?.uid ||
                    "",

                atualizadoPorNome:
                    usuario?.nome ||
                    "",

                atualizadoEm:
                    serverTimestamp()

            }
        );


        await carregarDados();


    } catch (erro) {

        console.error(
            "Erro ao alterar status do contrato:",
            erro
        );


        alert(
            "Não foi possível alterar o status do contrato."
        );

    }

}


/* =========================================================
   FILTROS
========================================================= */

inputPesquisa?.addEventListener(
    "input",
    renderizarContratos
);


filtroPrestador?.addEventListener(
    "change",
    renderizarContratos
);


filtroStatus?.addEventListener(
    "change",
    renderizarContratos
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function inicializarContratos() {

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

    inicializarContratos();

} else {

    window.addEventListener(
        "usuarioSistemaCarregado",
        inicializarContratos,
        {
            once:
                true
        }
    );

}