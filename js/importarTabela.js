/* =========================================================
   IMPORTADOR DA TABELA CÁSSIO
========================================================= */


import {
    auth,
    db
} from "./firebase.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


import {
    doc,
    getDoc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   ELEMENTOS
========================================================= */

const btnImportar =
    document.getElementById(
        "btnImportar"
    );


const statusImportacao =
    document.getElementById(
        "statusImportacao"
    );


let usuarioAtual =
    null;


/* =========================================================
   VERIFICAR ADMINISTRADOR
========================================================= */

onAuthStateChanged(
    auth,
    async function (
        usuario
    ) {

        if (!usuario) {

            window.location.href =
                "../index.html";

            return;

        }


        const referencia =
            doc(
                db,
                "usuarios",
                usuario.uid
            );


        const documento =
            await getDoc(
                referencia
            );


        if (
            !documento.exists()
        ) {

            alert(
                "Perfil não encontrado."
            );

            window.location.href =
                "dashboard.html";

            return;

        }


        const dados =
            documento.data();


        if (
            dados.perfil !==
            "administrador"
        ) {

            alert(
                "Somente administradores podem importar tabelas."
            );

            window.location.href =
                "dashboard.html";

            return;

        }


        usuarioAtual =
            usuario;


        statusImportacao.textContent =
            "Administrador identificado. A importação está liberada.";

    }
);


/* =========================================================
   IMPORTAÇÃO
========================================================= */

btnImportar.addEventListener(
    "click",
    async function () {

        if (!usuarioAtual) {

            alert(
                "Aguarde a validação do usuário."
            );

            return;

        }


        const confirmar =
            confirm(
                "Deseja importar a tabela completa para o Firestore?"
            );


        if (!confirmar) {

            return;

        }


        btnImportar.disabled =
            true;


        statusImportacao.textContent =
            "Carregando tabela-cassio.json...";


        try {

            /* =============================================
               CARREGAR JSON
            ============================================= */

            const resposta =
                await fetch(
                    "../dados/tabela-cassio.json"
                );


            if (!resposta.ok) {

                throw new Error(
                    "Não foi possível carregar tabela-cassio.json."
                );

            }


            const itens =
                await resposta.json();


            if (!Array.isArray(itens)) {

                throw new Error(
                    "O JSON da tabela não possui formato válido."
                );

            }


            statusImportacao.innerHTML = `

                Tabela carregada:
                <strong>
                    ${itens.length} itens
                </strong>.

                <br>

                Iniciando importação...

            `;


            /* =============================================
               FIRESTORE POSSUI LIMITE DE 500 OPERAÇÕES
               POR BATCH.

               COMO TEMOS 360 ITENS, 1 BATCH É SUFICIENTE.
            ============================================= */

            const batch =
                writeBatch(db);


            itens.forEach(
                function (
                    item,
                    indice
                ) {

                    /*
                        Usamos o código Energisa como ID.

                        Se por algum motivo estiver vazio,
                        usamos o número da linha.
                    */

                    const id =
                        String(
                            item.codigoEnergisa ||
                            indice + 1
                        );


                    const referenciaItem =
                        doc(
                            db,
                            "tabelasPrecos",
                            "2025001101-v1",
                            "itens",
                            id
                        );


                    batch.set(
                        referenciaItem,
                        {

                            codigoEnergisa:
                                item.codigoEnergisa || "",

                            codigoPini:
                                item.codigoPini || "",

                            especificacao:
                                item.especificacao || "",

                            unidade:
                                item.unidade || "",

                            valorUnitario:
                                Number(
                                    item.valorUnitario
                                ) || 0,

                            quantidadeEstimada:
                                item.quantidadeEstimada ?? null,

                            mat:
                                item.mat ?? null,

                            mo:
                                item.mo ?? null,

                            totalEstimado:
                                item.totalEstimado ?? null,

                            ativo:
                                true

                        }
                    );

                }
            );


            /* =============================================
               ENVIAR PARA FIRESTORE
            ============================================= */

            await batch.commit();


            statusImportacao.innerHTML = `

                <strong>
                    Importação concluída.
                </strong>

                <br>

                ${itens.length}
                serviços enviados para o Firestore.

                <br><br>

                Caminho:

                <br>

                <code>
                    tabelasPrecos/2025001101-v1/itens
                </code>

            `;


            btnImportar.textContent =
                "Tabela importada";


        } catch (erro) {

            console.error(
                "Erro na importação:",
                erro
            );


            statusImportacao.innerHTML = `

                <strong>
                    Erro durante a importação.
                </strong>

                <br>

                ${erro.message}

            `;


            btnImportar.disabled =
                false;

        }

    }
);