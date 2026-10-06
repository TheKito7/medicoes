/* =========================================================
   DETALHES DA MEDIÇÃO
========================================================= */

import {
    db
} from "./firebase.js";


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


import {
    getUsuarioSistema
} from "./authGuard.js";


const carregando =
    document.getElementById(
        "carregandoDetalhes"
    );


const conteudo =
    document.getElementById(
        "conteudoDetalhes"
    );


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


function formatarData(
    data
) {

    if (!data) {

        return "-";

    }


    const partes =
        data.split("-");


    if (
        partes.length !==
        3
    ) {

        return data;

    }


    return (
        `${partes[2]}/${partes[1]}/${partes[0]}`
    );

}


function obterStatus(
    status
) {

    const mapa = {

        rascunho:
            [
                "Rascunho",
                "status-rascunho"
            ],

        enviado:
            [
                "Aguardando análise",
                "status-enviado"
            ],

        em_analise:
            [
                "Em análise",
                "status-analise"
            ],

        aprovado:
            [
                "Aprovado",
                "status-aprovado"
            ],

        correcao:
            [
                "Correção solicitada",
                "status-correcao"
            ],

        reprovado:
            [
                "Reprovado",
                "status-reprovado"
            ]

    };


    return (
        mapa[status] ||
        [
            status || "Sem status",
            "status-rascunho"
        ]
    );

}


/* =========================================================
   CARREGAR
========================================================= */

async function carregarMedicao() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );


    const id =
        parametros.get(
            "id"
        );


    if (!id) {

        carregando.textContent =
            "Medição não informada.";


        return;

    }


    try {

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "medicoes",
                    id
                )
            );


        if (
            !snapshot.exists()
        ) {

            carregando.textContent =
                "Medição não encontrada.";


            return;

        }


        const medicao =
            snapshot.data();


        const usuario =
            getUsuarioSistema();


        /*
            Proteção visual para prestador.
        */

        if (
            usuario?.perfil ===
            "prestador"
            &&
            medicao.prestadorId !==
            usuario.prestadorId
        ) {

            carregando.textContent =
                "Você não possui acesso a esta medição.";


            return;

        }


        preencherDados(
            medicao
        );


        carregando.classList.add(
            "oculto"
        );


        conteudo.classList.remove(
            "oculto"
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar medição:",
            erro
        );


        carregando.textContent =
            "Não foi possível carregar a medição.";

    }

}


/* =========================================================
   PREENCHER
========================================================= */

function preencherDados(
    medicao
) {

    document.getElementById(
        "detalheContrato"
    ).textContent =
        `${medicao.contratoDescricao || "Contrato"} — ${medicao.contratoNumero || "-"}`;


    document.getElementById(
        "detalhePrestador"
    ).textContent =
        medicao.prestadorNome ||
        "-";


    document.getElementById(
        "detalheData"
    ).textContent =
        formatarData(
            medicao.dataServico
        );


    document.getElementById(
        "detalheCidade"
    ).textContent =
        medicao.cidade ||
        "-";


    document.getElementById(
        "detalheLocalidade"
    ).textContent =
        medicao.localidade ||
        "-";


    document.getElementById(
        "detalheResponsavel"
    ).textContent =
        medicao.responsavel ||
        "-";


    document.getElementById(
        "detalheCriadoPor"
    ).textContent =
        medicao.criadoPorNome ||
        "-";


    document.getElementById(
        "detalheDescricao"
    ).textContent =
        medicao.descricao ||
        "Sem descrição.";


    document.getElementById(
        "detalheValorTotal"
    ).textContent =
        formatarMoeda(
            medicao.valorTotal
        );


    /* STATUS */

    const status =
        obterStatus(
            medicao.status
        );


    const statusElemento =
        document.getElementById(
            "detalheStatus"
        );


    statusElemento.textContent =
        status[0];


    statusElemento.className =
        `status-medicao ${status[1]}`;


    /* ITENS */

    const itens =
        Array.isArray(
            medicao.itens
        )
            ? medicao.itens
            : [];


    document.getElementById(
        "detalheQuantidadeItens"
    ).textContent =
        itens.length === 1
            ? "1 item"
            : `${itens.length} itens`;


    const corpo =
        document.getElementById(
            "detalheItens"
        );


    corpo.innerHTML =
        "";


    itens.forEach(
        function (
            item
        ) {

            const linha =
                document.createElement(
                    "tr"
                );


            linha.innerHTML = `

                <td>
                    ${item.codigoEnergisa || "-"}
                </td>

                <td>
                    ${item.especificacao || "-"}
                </td>

                <td>
                    ${item.unidade || "-"}
                </td>

                <td>
                    ${Number(
                        item.quantidade
                    ).toLocaleString(
                        "pt-BR"
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


            corpo.appendChild(
                linha
            );

        }
    );

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

const usuario =
    getUsuarioSistema();


if (usuario) {

    carregarMedicao();

} else {

    window.addEventListener(
        "usuarioSistemaCarregado",
        carregarMedicao,
        {
            once:
                true
        }
    );

}