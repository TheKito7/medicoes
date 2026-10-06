/* =========================================================
   ORÇAMENTO RÁPIDO - ENERGISA
   GESTÃO DE USUÁRIOS
========================================================= */

console.log("usuarios.js carregado");


/* =========================================================
   FIREBASE PRINCIPAL
========================================================= */

import {
    app,
    auth,
    db
} from "./firebase.js";


import {
    initializeApp,
    deleteApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


import {
    signOut,
    getAuth,
    createUserWithEmailAndPassword,
    deleteUser
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
   ELEMENTOS GERAIS
========================================================= */

const sidebar =
    document.getElementById("sidebar");


const sidebarOverlay =
    document.getElementById("sidebarOverlay");


const btnMenuMobile =
    document.getElementById("btnMenuMobile");


const btnSair =
    document.getElementById("btnSair");


/* =========================================================
   TABELA
========================================================= */

const listaUsuarios =
    document.getElementById("listaUsuarios");


const inputPesquisa =
    document.getElementById("inputPesquisa");


const filtroPerfil =
    document.getElementById("filtroPerfil");


const filtroStatus =
    document.getElementById("filtroStatus");


const indicadorTotal =
    document.getElementById("indicadorTotal");


const indicadorAtivos =
    document.getElementById("indicadorAtivos");


const indicadorAdministradores =
    document.getElementById("indicadorAdministradores");


const indicadorPrestadores =
    document.getElementById("indicadorPrestadores");


const textoQuantidadeUsuarios =
    document.getElementById("textoQuantidadeUsuarios");


/* =========================================================
   MODAL EDITAR
========================================================= */

const modalUsuario =
    document.getElementById("modalUsuario");


const btnFecharModal =
    document.getElementById("btnFecharModal");


const btnCancelar =
    document.getElementById("btnCancelar");


const formUsuario =
    document.getElementById("formUsuario");


const usuarioId =
    document.getElementById("usuarioId");


const nomeUsuario =
    document.getElementById("nomeUsuario");


const emailUsuario =
    document.getElementById("emailUsuario");


const perfilUsuario =
    document.getElementById("perfilUsuario");


const statusUsuario =
    document.getElementById("statusUsuario");


const campoPrestador =
    document.getElementById("campoPrestador");


const prestadorUsuario =
    document.getElementById("prestadorUsuario");


const btnSalvarUsuario =
    document.getElementById("btnSalvarUsuario");


/* =========================================================
   MODAL NOVO USUÁRIO
========================================================= */

const btnNovoUsuario =
    document.getElementById("btnNovoUsuario");


const modalNovoUsuario =
    document.getElementById("modalNovoUsuario");


const btnFecharNovoUsuario =
    document.getElementById("btnFecharNovoUsuario");


const btnCancelarNovoUsuario =
    document.getElementById("btnCancelarNovoUsuario");


const formNovoUsuario =
    document.getElementById("formNovoUsuario");


const novoNome =
    document.getElementById("novoNome");


const novoEmail =
    document.getElementById("novoEmail");


const novaSenha =
    document.getElementById("novaSenha");


const confirmarNovaSenha =
    document.getElementById("confirmarNovaSenha");


const novoPerfil =
    document.getElementById("novoPerfil");


const novoStatus =
    document.getElementById("novoStatus");


const campoNovoPrestador =
    document.getElementById("campoNovoPrestador");


const novoPrestador =
    document.getElementById("novoPrestador");


const btnCriarUsuario =
    document.getElementById("btnCriarUsuario");


const btnVerNovaSenha =
    document.getElementById("btnVerNovaSenha");


const btnVerConfirmarSenha =
    document.getElementById("btnVerConfirmarSenha");


/* =========================================================
   ESTADO
========================================================= */

let usuarios = [];

let prestadores = [];


/* =========================================================
   UTILITÁRIOS
========================================================= */

function normalizar(valor) {

    return String(valor ?? "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();

}


function escaparHTML(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");

}


function obterIniciais(nome) {

    const partes =
        String(nome || "U")
            .trim()
            .split(/\s+/)
            .filter(Boolean);


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


function obterPrestador(id) {

    return prestadores.find(
        prestador =>
            prestador.id === id
    );

}


/* =========================================================
   MENU MOBILE
========================================================= */

btnMenuMobile?.addEventListener(
    "click",
    function () {

        sidebar?.classList.add("aberta");

        sidebarOverlay?.classList.add("ativo");

        document.body.style.overflow =
            "hidden";

    }
);


sidebarOverlay?.addEventListener(
    "click",
    function () {

        sidebar?.classList.remove("aberta");

        sidebarOverlay?.classList.remove("ativo");

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


        await signOut(auth);


        window.location.href =
            "../index.html";

    }
);


/* =========================================================
   CARREGAR DADOS
========================================================= */

async function carregarDados() {

    listaUsuarios.innerHTML = `

        <tr>

            <td colspan="6">

                <div class="estado-tabela">

                    <i class="bx bx-loader-alt bx-spin"></i>

                    Carregando usuários...

                </div>

            </td>

        </tr>

    `;


    try {

        const [
            snapshotUsuarios,
            snapshotPrestadores
        ] =
            await Promise.all(
                [

                    getDocs(
                        collection(
                            db,
                            "usuarios"
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


        usuarios =
            snapshotUsuarios.docs.map(
                documento => ({
                    id: documento.id,
                    ...documento.data()
                })
            );


        prestadores =
            snapshotPrestadores.docs.map(
                documento => ({
                    id: documento.id,
                    ...documento.data()
                })
            );


        usuarios.sort(
            (a, b) =>
                String(a.nome || "")
                    .localeCompare(
                        String(b.nome || ""),
                        "pt-BR"
                    )
        );


        prestadores.sort(
            (a, b) =>
                String(a.nome || "")
                    .localeCompare(
                        String(b.nome || ""),
                        "pt-BR"
                    )
        );


        preencherPrestadores();

        atualizarIndicadores();

        renderizarUsuarios();


    } catch (erro) {

        console.error(
            "Erro ao carregar usuários:",
            erro
        );


        listaUsuarios.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="estado-tabela">

                        Não foi possível carregar os usuários.

                    </div>

                </td>

            </tr>

        `;

    }

}


/* =========================================================
   SELECTS PRESTADORES
========================================================= */

function preencherPrestadores() {

    const opcoes =
        prestadores.map(
            prestador => `

                <option value="${escaparHTML(
                    prestador.id
                )}">

                    ${escaparHTML(
                        prestador.nome || prestador.id
                    )}

                    ${
                        prestador.ativo === false
                            ? " — Inativo"
                            : ""
                    }

                </option>

            `
        ).join("");


    prestadorUsuario.innerHTML = `

        <option value="">
            Selecione...
        </option>

        ${opcoes}

    `;


    novoPrestador.innerHTML = `

        <option value="">
            Selecione o prestador...
        </option>

        ${opcoes}

    `;

}


/* =========================================================
   INDICADORES
========================================================= */

function atualizarIndicadores() {

    const ativos =
        usuarios.filter(
            usuario =>
                usuario.ativo === true
        ).length;


    const administradores =
        usuarios.filter(
            usuario =>
                usuario.perfil ===
                "administrador"
        ).length;


    const usuariosPrestadores =
        usuarios.filter(
            usuario =>
                usuario.perfil ===
                "prestador"
        ).length;


    indicadorTotal.textContent =
        usuarios.length;


    indicadorAtivos.textContent =
        ativos;


    indicadorAdministradores.textContent =
        administradores;


    indicadorPrestadores.textContent =
        usuariosPrestadores;

}


/* =========================================================
   FILTRAR
========================================================= */

function obterUsuariosFiltrados() {

    const pesquisa =
        normalizar(
            inputPesquisa.value
        );


    const perfil =
        filtroPerfil.value;


    const status =
        filtroStatus.value;


    return usuarios.filter(
        function (usuario) {

            const texto =
                normalizar(
                    `${usuario.nome || ""} ${usuario.email || ""}`
                );


            const atendePesquisa =
                !pesquisa ||
                texto.includes(pesquisa);


            const atendePerfil =
                !perfil ||
                usuario.perfil === perfil;


            let atendeStatus =
                true;


            if (status === "ativo") {

                atendeStatus =
                    usuario.ativo === true;

            }


            if (status === "inativo") {

                atendeStatus =
                    usuario.ativo !== true;

            }


            return (
                atendePesquisa &&
                atendePerfil &&
                atendeStatus
            );

        }
    );

}


/* =========================================================
   RENDERIZAR
========================================================= */

function renderizarUsuarios() {

    const filtrados =
        obterUsuariosFiltrados();


    textoQuantidadeUsuarios.textContent =
        filtrados.length === 1
            ? "1 usuário encontrado"
            : `${filtrados.length} usuários encontrados`;


    if (filtrados.length === 0) {

        listaUsuarios.innerHTML = `

            <tr>

                <td colspan="6">

                    <div class="estado-tabela">

                        Nenhum usuário encontrado.

                    </div>

                </td>

            </tr>

        `;


        return;

    }


    listaUsuarios.innerHTML =
        filtrados.map(
            function (usuario) {

                const ativo =
                    usuario.ativo === true;


                const prestador =
                    obterPrestador(
                        usuario.prestadorId
                    );


                return `

                    <tr>


                        <td>

                            <div class="usuario-tabela">

                                <div class="usuario-tabela-avatar">

                                    ${escaparHTML(
                                        obterIniciais(
                                            usuario.nome
                                        )
                                    )}

                                </div>


                                <div class="usuario-tabela-info">

                                    <strong>

                                        ${escaparHTML(
                                            usuario.nome || "-"
                                        )}

                                    </strong>

                                    <span>

                                        UID:
                                        ${escaparHTML(
                                            usuario.id
                                        )}

                                    </span>

                                </div>

                            </div>

                        </td>


                        <td>

                            ${escaparHTML(
                                usuario.email || "-"
                            )}

                        </td>


                        <td>

                            <span class="
                                badge-perfil
                                ${
                                    usuario.perfil ===
                                    "administrador"
                                        ? "perfil-administrador"
                                        : "perfil-prestador"
                                }
                            ">

                                ${
                                    usuario.perfil ===
                                    "administrador"
                                        ? "Administrador"
                                        : "Prestador"
                                }

                            </span>

                        </td>


                        <td>

                            ${escaparHTML(
                                prestador?.nome || "-"
                            )}

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

                            <button
                                type="button"
                                class="btn-editar"
                                data-id="${escaparHTML(
                                    usuario.id
                                )}"
                                title="Editar usuário"
                            >

                                <i class="bx bx-edit-alt"></i>

                            </button>

                        </td>


                    </tr>

                `;

            }
        )
        .join("");


    document
        .querySelectorAll(".btn-editar")
        .forEach(
            function (botao) {

                botao.addEventListener(
                    "click",
                    function () {

                        abrirUsuario(
                            botao.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================================================
   EDITAR USUÁRIO
========================================================= */

function abrirUsuario(id) {

    const usuario =
        usuarios.find(
            item =>
                item.id === id
        );


    if (!usuario) {

        return;

    }


    usuarioId.value =
        usuario.id;


    nomeUsuario.value =
        usuario.nome || "";


    emailUsuario.value =
        usuario.email || "";


    perfilUsuario.value =
        usuario.perfil ||
        "prestador";


    statusUsuario.value =
        usuario.ativo === true
            ? "true"
            : "false";


    prestadorUsuario.value =
        usuario.prestadorId || "";


    atualizarCampoPrestador();


    modalUsuario.classList.remove(
        "oculto"
    );


    document.body.style.overflow =
        "hidden";

}


function fecharModalEditar() {

    modalUsuario.classList.add(
        "oculto"
    );


    document.body.style.overflow =
        "";

}


btnFecharModal?.addEventListener(
    "click",
    fecharModalEditar
);


btnCancelar?.addEventListener(
    "click",
    fecharModalEditar
);


modalUsuario?.addEventListener(
    "click",
    function (evento) {

        if (
            evento.target === modalUsuario
        ) {

            fecharModalEditar();

        }

    }
);


/* =========================================================
   PERFIL EDITAR
========================================================= */

function atualizarCampoPrestador() {

    if (
        perfilUsuario.value ===
        "prestador"
    ) {

        campoPrestador.classList.remove(
            "oculto"
        );

    } else {

        campoPrestador.classList.add(
            "oculto"
        );

    }

}


perfilUsuario?.addEventListener(
    "change",
    atualizarCampoPrestador
);


/* =========================================================
   SALVAR EDIÇÃO
========================================================= */

formUsuario?.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();


        const administrador =
            getUsuarioSistema();


        if (
            administrador?.perfil !==
            "administrador"
        ) {

            return;

        }


        const id =
            usuarioId.value;


        const nome =
            nomeUsuario.value.trim();


        const perfil =
            perfilUsuario.value;


        if (!nome) {

            alert(
                "Informe o nome do usuário."
            );

            return;

        }


        if (
            perfil === "prestador" &&
            !prestadorUsuario.value
        ) {

            alert(
                "Selecione o prestador vinculado."
            );

            return;

        }


        if (
            id === administrador.uid &&
            statusUsuario.value === "false"
        ) {

            alert(
                "Você não pode desativar seu próprio usuário enquanto estiver conectado."
            );

            return;

        }


        btnSalvarUsuario.disabled =
            true;


        const htmlOriginal =
            btnSalvarUsuario.innerHTML;


        btnSalvarUsuario.innerHTML = `

            <i class="bx bx-loader-alt bx-spin"></i>

            Salvando...

        `;


        try {

            const dados = {

                nome: nome,

                perfil: perfil,

                ativo:
                    statusUsuario.value ===
                    "true",

                prestadorId:
                    perfil === "prestador"
                        ? prestadorUsuario.value
                        : "",

                atualizadoPorUid:
                    administrador.uid,

                atualizadoPorNome:
                    administrador.nome || "",

                atualizadoEm:
                    serverTimestamp()

            };


            await updateDoc(
                doc(
                    db,
                    "usuarios",
                    id
                ),
                dados
            );


            alert(
                "Usuário atualizado com sucesso."
            );


            fecharModalEditar();


            await carregarDados();


        } catch (erro) {

            console.error(
                "Erro ao atualizar usuário:",
                erro
            );


            alert(
                "Não foi possível atualizar o usuário."
            );


        } finally {

            btnSalvarUsuario.disabled =
                false;


            btnSalvarUsuario.innerHTML =
                htmlOriginal;

        }

    }
);


/* =========================================================
   ABRIR NOVO USUÁRIO
========================================================= */

btnNovoUsuario?.addEventListener(
    "click",
    function () {

        formNovoUsuario.reset();


        novoPerfil.value =
            "prestador";


        novoStatus.value =
            "true";


        atualizarCampoNovoPrestador();


        modalNovoUsuario.classList.remove(
            "oculto"
        );


        document.body.style.overflow =
            "hidden";


        setTimeout(
            function () {

                novoNome.focus();

            },
            100
        );

    }
);


/* =========================================================
   FECHAR NOVO USUÁRIO
========================================================= */

function fecharModalNovoUsuario() {

    modalNovoUsuario.classList.add(
        "oculto"
    );


    document.body.style.overflow =
        "";

}


btnFecharNovoUsuario?.addEventListener(
    "click",
    fecharModalNovoUsuario
);


btnCancelarNovoUsuario?.addEventListener(
    "click",
    fecharModalNovoUsuario
);


modalNovoUsuario?.addEventListener(
    "click",
    function (evento) {

        if (
            evento.target === modalNovoUsuario
        ) {

            fecharModalNovoUsuario();

        }

    }
);


/* =========================================================
   PERFIL NOVO USUÁRIO
========================================================= */

function atualizarCampoNovoPrestador() {

    if (
        novoPerfil.value ===
        "prestador"
    ) {

        campoNovoPrestador.classList.remove(
            "oculto"
        );

    } else {

        campoNovoPrestador.classList.add(
            "oculto"
        );


        novoPrestador.value =
            "";

    }

}


novoPerfil?.addEventListener(
    "change",
    atualizarCampoNovoPrestador
);


/* =========================================================
   MOSTRAR / OCULTAR SENHA
========================================================= */

function alternarSenha(
    input,
    botao
) {

    const mostrando =
        input.type === "text";


    input.type =
        mostrando
            ? "password"
            : "text";


    const icone =
        botao.querySelector("i");


    if (icone) {

        icone.className =
            mostrando
                ? "bx bx-show"
                : "bx bx-hide";

    }

}


btnVerNovaSenha?.addEventListener(
    "click",
    function () {

        alternarSenha(
            novaSenha,
            btnVerNovaSenha
        );

    }
);


btnVerConfirmarSenha?.addEventListener(
    "click",
    function () {

        alternarSenha(
            confirmarNovaSenha,
            btnVerConfirmarSenha
        );

    }
);


/* =========================================================
   CRIAR NOVO USUÁRIO
========================================================= */

formNovoUsuario?.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();


        const administrador =
            getUsuarioSistema();


        if (
            administrador?.perfil !==
            "administrador"
        ) {

            alert(
                "Somente administradores podem cadastrar usuários."
            );

            return;

        }


        const nome =
            novoNome.value.trim();


        const email =
            novoEmail.value
                .trim()
                .toLowerCase();


        const senha =
            novaSenha.value;


        const confirmarSenha =
            confirmarNovaSenha.value;


        const perfil =
            novoPerfil.value;


        const ativo =
            novoStatus.value ===
            "true";


        const prestadorId =
            perfil === "prestador"
                ? novoPrestador.value
                : "";


        /* =================================================
           VALIDAÇÕES
        ================================================= */

        if (!nome) {

            alert(
                "Informe o nome do usuário."
            );

            novoNome.focus();

            return;

        }


        if (!email) {

            alert(
                "Informe o e-mail do usuário."
            );

            novoEmail.focus();

            return;

        }


        if (
            senha.length < 6
        ) {

            alert(
                "A senha deve possuir pelo menos 6 caracteres."
            );

            novaSenha.focus();

            return;

        }


        if (
            senha !== confirmarSenha
        ) {

            alert(
                "As senhas informadas são diferentes."
            );

            confirmarNovaSenha.focus();

            return;

        }


        if (
            perfil === "prestador" &&
            !prestadorId
        ) {

            alert(
                "Selecione o prestador que será vinculado ao usuário."
            );

            novoPrestador.focus();

            return;

        }


        btnCriarUsuario.disabled =
            true;


        const htmlOriginal =
            btnCriarUsuario.innerHTML;


        btnCriarUsuario.innerHTML = `

            <i class="bx bx-loader-alt bx-spin"></i>

            Criando usuário...

        `;


        /*
            Usaremos uma instância secundária
            do Firebase para não alterar a sessão
            administrativa atual.
        */

        let appSecundario =
            null;


        let authSecundario =
            null;


        let usuarioCriadoAuth =
            null;


        try {

            const nomeInstancia =
                `cadastro-${Date.now()}`;


            appSecundario =
                initializeApp(
                    app.options,
                    nomeInstancia
                );


            authSecundario =
                getAuth(
                    appSecundario
                );


            /* =============================================
               1. CRIAR CONTA NO FIREBASE AUTH
            ============================================== */

            const credencial =
                await createUserWithEmailAndPassword(
                    authSecundario,
                    email,
                    senha
                );


            usuarioCriadoAuth =
                credencial.user;


            const novoUid =
                usuarioCriadoAuth.uid;


            /* =============================================
               2. CRIAR PERFIL NO FIRESTORE
            ============================================== */

            await setDoc(
                doc(
                    db,
                    "usuarios",
                    novoUid
                ),
                {

                    nome: nome,

                    email: email,

                    perfil: perfil,

                    prestadorId: prestadorId,

                    ativo: ativo,

                    criadoPorUid:
                        administrador.uid,

                    criadoPorNome:
                        administrador.nome || "",

                    criadoEm:
                        serverTimestamp(),

                    atualizadoPorUid:
                        administrador.uid,

                    atualizadoPorNome:
                        administrador.nome || "",

                    atualizadoEm:
                        serverTimestamp()

                }
            );


            /* =============================================
               3. ENCERRAR SESSÃO SECUNDÁRIA
            ============================================== */

            await signOut(
                authSecundario
            );


            fecharModalNovoUsuario();


            alert(
                "Usuário cadastrado com sucesso."
            );


            await carregarDados();


        } catch (erro) {

            console.error(
                "Erro ao cadastrar usuário:",
                erro
            );


            /*
                Se a conta no Authentication tiver sido
                criada mas o Firestore falhar, tentamos
                remover a conta para evitar um usuário
                incompleto.
            */

            if (
                usuarioCriadoAuth
            ) {

                try {

                    await deleteUser(
                        usuarioCriadoAuth
                    );

                } catch (erroExclusao) {

                    console.error(
                        "Não foi possível desfazer a conta criada:",
                        erroExclusao
                    );

                }

            }


            let mensagem =
                "Não foi possível cadastrar o usuário.";


            if (
                erro.code ===
                "auth/email-already-in-use"
            ) {

                mensagem =
                    "Já existe uma conta cadastrada com este e-mail.";

            }


            if (
                erro.code ===
                "auth/invalid-email"
            ) {

                mensagem =
                    "O e-mail informado é inválido.";

            }


            if (
                erro.code ===
                "auth/weak-password"
            ) {

                mensagem =
                    "A senha informada é muito fraca. Utilize pelo menos 6 caracteres.";

            }


            if (
                erro.code ===
                "auth/operation-not-allowed"
            ) {

                mensagem =
                    "O login por e-mail e senha não está habilitado no Firebase Authentication.";

            }


            if (
                erro.code ===
                "permission-denied"
            ) {

                mensagem =
                    "O Firestore não permitiu criar o perfil do usuário. Verifique as regras de segurança.";

            }


            alert(
                mensagem
            );


        } finally {

            /*
                Exclui somente a instância Firebase
                temporária usada para o cadastro.
            */

            if (
                appSecundario
            ) {

                try {

                    await deleteApp(
                        appSecundario
                    );

                } catch (erro) {

                    console.warn(
                        "Erro ao encerrar Firebase secundário:",
                        erro
                    );

                }

            }


            btnCriarUsuario.disabled =
                false;


            btnCriarUsuario.innerHTML =
                htmlOriginal;

        }

    }
);


/* =========================================================
   FILTROS
========================================================= */

inputPesquisa?.addEventListener(
    "input",
    renderizarUsuarios
);


filtroPerfil?.addEventListener(
    "change",
    renderizarUsuarios
);


filtroStatus?.addEventListener(
    "change",
    renderizarUsuarios
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


    await carregarDados();

}


const usuarioInicial =
    getUsuarioSistema();


if (usuarioInicial) {

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