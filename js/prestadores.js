/* =========================================================
   ORÇAMENTO RÁPIDO - ENERGISA
   GESTÃO DE PRESTADORES
========================================================= */

console.log(
    "prestadores.js carregado"
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
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


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


const btnNovoPrestador =
    document.getElementById(
        "btnNovoPrestador"
    );


const inputPesquisa =
    document.getElementById(
        "inputPesquisa"
    );


const filtroStatus =
    document.getElementById(
        "filtroStatus"
    );


const listaPrestadores =
    document.getElementById(
        "listaPrestadores"
    );


const textoQuantidadePrestadores =
    document.getElementById(
        "textoQuantidadePrestadores"
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


const indicadorContratos =
    document.getElementById(
        "indicadorContratos"
    );


/* =========================================================
   MODAL
========================================================= */

const modalPrestador =
    document.getElementById(
        "modalPrestador"
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


const formPrestador =
    document.getElementById(
        "formPrestador"
    );


const prestadorId =
    document.getElementById(
        "prestadorId"
    );


const nomePrestador =
    document.getElementById(
        "nomePrestador"
    );


const razaoSocial =
    document.getElementById(
        "razaoSocial"
    );


const documentoPrestador =
    document.getElementById(
        "documentoPrestador"
    );


const telefonePrestador =
    document.getElementById(
        "telefonePrestador"
    );


const emailPrestador =
    document.getElementById(
        "emailPrestador"
    );


const statusPrestador =
    document.getElementById(
        "statusPrestador"
    );


const btnSalvarPrestador =
    document.getElementById(
        "btnSalvarPrestador"
    );


/* =========================================================
   ESTADO
========================================================= */

let prestadores =
    [];


let contratos =
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
   GERAR ID DO PRESTADOR
========================================================= */

function gerarIdPrestador(
    nome
) {

    let id =
        normalizarTexto(
            nome
        )
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                ""
            );


    if (!id) {

        id =
            `prestador-${Date.now()}`;

    }


    const existe =
        prestadores.some(
            function (
                prestador
            ) {

                return (
                    prestador.id ===
                    id
                );

            }
        );


    if (
        existe
    ) {

        id =
            `${id}-${Date.now()}`;

    }


    return id;

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
    fecharSidebar
);


function fecharSidebar() {

    sidebar?.classList.remove(
        "aberta"
    );


    sidebarOverlay?.classList.remove(
        "ativo"
    );


    document.body.style.overflow =
        "";

}


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
   CARREGAR DADOS
========================================================= */

async function carregarDados() {

    try {

        listaPrestadores.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="estado-tabela">

                        <i class="bx bx-loader-alt bx-spin"></i>

                        Carregando prestadores...

                    </div>

                </td>

            </tr>

        `;


        const [
            snapshotPrestadores,
            snapshotContratos
        ] =
            await Promise.all(
                [
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
                    )
                ]
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


        atualizarIndicadores();

        renderizarPrestadores();


    } catch (erro) {

        console.error(
            "Erro ao carregar prestadores:",
            erro
        );


        listaPrestadores.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="estado-tabela">

                        Não foi possível carregar os prestadores.

                    </div>

                </td>

            </tr>

        `;

    }

}


/* =========================================================
   CONTAR CONTRATOS
========================================================= */

function contarContratosPrestador(
    idPrestador
) {

    return contratos.filter(
        function (
            contrato
        ) {

            return (
                String(
                    contrato.prestadorId
                )
                ===
                String(
                    idPrestador
                )
            );

        }
    ).length;

}


/* =========================================================
   INDICADORES
========================================================= */

function atualizarIndicadores() {

    const ativos =
        prestadores.filter(
            function (
                prestador
            ) {

                return (
                    prestador.ativo ===
                    true
                );

            }
        ).length;


    const inativos =
        prestadores.length -
        ativos;


    if (
        indicadorTotal
    ) {

        indicadorTotal.textContent =
            prestadores.length;

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
        indicadorContratos
    ) {

        indicadorContratos.textContent =
            contratos.length;

    }

}


/* =========================================================
   FILTRAR
========================================================= */

function obterPrestadoresFiltrados() {

    const pesquisa =
        normalizarTexto(
            inputPesquisa?.value
        );


    const status =
        filtroStatus?.value ||
        "";


    return prestadores.filter(
        function (
            prestador
        ) {

            const texto =
                normalizarTexto(
                    [
                        prestador.nome,
                        prestador.razaoSocial,
                        prestador.documento,
                        prestador.email
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
                "ativo"
            ) {

                atendeStatus =
                    prestador.ativo ===
                    true;

            }


            if (
                status ===
                "inativo"
            ) {

                atendeStatus =
                    prestador.ativo !==
                    true;

            }


            return (
                atendePesquisa
                &&
                atendeStatus
            );

        }
    );

}


/* =========================================================
   RENDERIZAR
========================================================= */

function renderizarPrestadores() {

    const filtrados =
        obterPrestadoresFiltrados();


    if (
        textoQuantidadePrestadores
    ) {

        textoQuantidadePrestadores.textContent =
            filtrados.length === 1
                ? "1 prestador encontrado"
                : `${filtrados.length} prestadores encontrados`;

    }


    if (
        filtrados.length ===
        0
    ) {

        listaPrestadores.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="estado-tabela">

                        <i class="bx bx-search"></i>

                        Nenhum prestador encontrado.

                    </div>

                </td>

            </tr>

        `;


        return;

    }


    listaPrestadores.innerHTML =
        filtrados.map(
            function (
                prestador
            ) {

                const ativo =
                    prestador.ativo ===
                    true;


                const quantidadeContratos =
                    contarContratosPrestador(
                        prestador.id
                    );


                return `

                    <tr>


                        <td>

                            <div class="nome-prestador">

                                <strong>

                                    ${escaparHTML(
                                        prestador.nome ||
                                        "-"
                                    )}

                                </strong>

                                <span>

                                    ID: ${escaparHTML(
                                        prestador.id
                                    )}

                                </span>

                            </div>

                        </td>


                        <td>

                            ${escaparHTML(
                                prestador.razaoSocial ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escaparHTML(
                                prestador.documento ||
                                "-"
                            )}

                        </td>


                        <td>

                            <span class="badge-contratos">

                                ${quantidadeContratos}

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

                            <div class="acoes-prestador">


                                <button
                                    type="button"
                                    class="btn-acao-tabela btn-editar"
                                    data-id="${escaparHTML(
                                        prestador.id
                                    )}"
                                    title="Editar"
                                >

                                    <i class="bx bx-edit-alt"></i>

                                </button>


                                <button
                                    type="button"
                                    class="
                                        btn-acao-tabela
                                        ${
                                            ativo
                                                ? "btn-desativar"
                                                : "btn-ativar"
                                        }
                                    "
                                    data-id="${escaparHTML(
                                        prestador.id
                                    )}"
                                    data-ativo="${
                                        ativo
                                    }"
                                    title="${
                                        ativo
                                            ? "Desativar"
                                            : "Ativar"
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
   BOTÕES DA TABELA
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

                        abrirEdicaoPrestador(
                            botao.dataset.id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".btn-desativar, .btn-ativar"
        )
        .forEach(
            function (
                botao
            ) {

                botao.addEventListener(
                    "click",
                    function () {

                        alterarStatusPrestador(
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
   ABRIR NOVO
========================================================= */

btnNovoPrestador?.addEventListener(
    "click",
    function () {

        formPrestador.reset();


        prestadorId.value =
            "";


        statusPrestador.value =
            "true";


        tituloModal.textContent =
            "Novo prestador";


        abrirModal();

    }
);


/* =========================================================
   EDITAR
========================================================= */

function abrirEdicaoPrestador(
    id
) {

    const prestador =
        prestadores.find(
            function (
                item
            ) {

                return (
                    item.id ===
                    id
                );

            }
        );


    if (!prestador) {

        return;

    }


    prestadorId.value =
        prestador.id;


    nomePrestador.value =
        prestador.nome ||
        "";


    razaoSocial.value =
        prestador.razaoSocial ||
        "";


    documentoPrestador.value =
        prestador.documento ||
        "";


    telefonePrestador.value =
        prestador.telefone ||
        "";


    emailPrestador.value =
        prestador.email ||
        "";


    statusPrestador.value =
        prestador.ativo ===
        true
            ? "true"
            : "false";


    tituloModal.textContent =
        "Editar prestador";


    abrirModal();

}


/* =========================================================
   MODAL
========================================================= */

function abrirModal() {

    modalPrestador.classList.remove(
        "oculto"
    );


    document.body.style.overflow =
        "hidden";


    setTimeout(
        function () {

            nomePrestador.focus();

        },
        100
    );

}


function fecharModal() {

    modalPrestador.classList.add(
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


modalPrestador?.addEventListener(
    "click",
    function (
        evento
    ) {

        if (
            evento.target ===
            modalPrestador
        ) {

            fecharModal();

        }

    }
);


/* =========================================================
   SALVAR
========================================================= */

formPrestador?.addEventListener(
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
                "Somente administradores podem cadastrar prestadores."
            );


            return;

        }


        const nome =
            nomePrestador.value.trim();


        if (!nome) {

            alert(
                "Informe o nome do prestador."
            );


            nomePrestador.focus();


            return;

        }


        btnSalvarPrestador.disabled =
            true;


        const textoOriginal =
            btnSalvarPrestador.innerHTML;


        btnSalvarPrestador.innerHTML = `

            <i class="bx bx-loader-alt bx-spin"></i>

            Salvando...

        `;


        try {

            const idAtual =
                prestadorId.value.trim();


            const dados = {

                nome:
                    nome,

                razaoSocial:
                    razaoSocial.value.trim(),

                documento:
                    documentoPrestador.value.trim(),

                telefone:
                    telefonePrestador.value.trim(),

                email:
                    emailPrestador.value.trim(),

                ativo:
                    statusPrestador.value ===
                    "true",

                atualizadoPorUid:
                    usuario.uid,

                atualizadoPorNome:
                    usuario.nome ||
                    "",

                atualizadoEm:
                    serverTimestamp()

            };


            if (
                idAtual
            ) {

                await updateDoc(
                    doc(
                        db,
                        "prestadores",
                        idAtual
                    ),
                    dados
                );


                alert(
                    "Prestador atualizado com sucesso."
                );

            } else {

                const novoId =
                    gerarIdPrestador(
                        nome
                    );


                await setDoc(
                    doc(
                        db,
                        "prestadores",
                        novoId
                    ),
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
                    "Prestador cadastrado com sucesso."
                );

            }


            fecharModal();


            await carregarDados();


        } catch (erro) {

            console.error(
                "Erro ao salvar prestador:",
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
                    "Não foi possível salvar o prestador."
                );

            }


        } finally {

            btnSalvarPrestador.disabled =
                false;


            btnSalvarPrestador.innerHTML =
                textoOriginal;

        }

    }
);


/* =========================================================
   ATIVAR / DESATIVAR
========================================================= */

async function alterarStatusPrestador(
    id,
    statusAtual
) {

    const prestador =
        prestadores.find(
            function (
                item
            ) {

                return (
                    item.id ===
                    id
                );

            }
        );


    if (!prestador) {

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
            `Deseja ${acao} o prestador "${prestador.nome}"?`
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
                "prestadores",
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
            "Erro ao alterar status:",
            erro
        );


        alert(
            "Não foi possível alterar o status do prestador."
        );

    }

}


/* =========================================================
   FILTROS
========================================================= */

inputPesquisa?.addEventListener(
    "input",
    renderizarPrestadores
);


filtroStatus?.addEventListener(
    "change",
    renderizarPrestadores
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function inicializarPrestadores() {

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

    inicializarPrestadores();

} else {

    window.addEventListener(
        "usuarioSistemaCarregado",
        inicializarPrestadores,
        {
            once:
                true
        }
    );

}