/* =========================================================
   ORÇAMENTO RÁPIDO - ENERGISA
   GERAÇÃO DO EXCEL DA MEDIÇÃO
========================================================= */


/* =========================================================
   NORMALIZAÇÃO
========================================================= */

function normalizarTexto(valor) {

    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

}


/* =========================================================
   VALOR VISÍVEL DE UMA CÉLULA
========================================================= */

function obterTextoCelula(celula) {

    const valor =
        celula.value;


    if (
        valor === null
        ||
        valor === undefined
    ) {

        return "";

    }


    if (
        typeof valor === "object"
    ) {

        if (
            valor.text
        ) {

            return String(
                valor.text
            );

        }


        if (
            valor.result !==
            undefined
        ) {

            return String(
                valor.result
            );

        }

    }


    return String(
        valor
    );

}


/* =========================================================
   ALIASES DOS CABEÇALHOS
========================================================= */

const aliasesCabecalhos = {

    cidade: [
        "cidade"
    ],

    localidade: [
        "localidade"
    ],

    responsavel: [
        "responsavel pela solicitacao",
        "responsavel solicitacao"
    ],

    descricaoServico: [
        "descricao do servico",
        "descricao servico"
    ],

    dataServico: [
        "data do servico",
        "data servico"
    ],

    numeracaoContrato: [
        "numeracao em contrato",
        "numero contrato",
        "numeracao contrato"
    ],

    itemContrato: [
        "item contrato"
    ],

    tipoNota: [
        "tipo de nota",
        "tipo nota"
    ],

    valorUnitario: [
        "valor unitario"
    ],

    quantidadeRealizada: [
        "quantidade realizada",
        "qnt realizada"
    ],

    valorKm: [
        "valor km"
    ],

    quantidadeKm: [
        "quantidade km",
        "qnt km"
    ],

    valorServico: [
        "valor/servico",
        "valor servico"
    ],

    valorTotal: [
        "valor total"
    ],

    rateio: [
        "rateio"
    ],

    centroCusto: [
        "centro de custo",
        "centro custo"
    ],

    opex: [
        "opex"
    ],

    capex: [
        "capex"
    ]

};


/* =========================================================
   IDENTIFICAR CABEÇALHO
========================================================= */

function localizarCabecalho(
    worksheet
) {

    let melhorLinha =
        null;


    let melhorMapa =
        {};


    let melhorPontuacao =
        0;


    const limite =
        Math.min(
            worksheet.rowCount,
            80
        );


    for (
        let numeroLinha = 1;
        numeroLinha <= limite;
        numeroLinha++
    ) {

        const linha =
            worksheet.getRow(
                numeroLinha
            );


        const mapa =
            {};


        linha.eachCell(
            {
                includeEmpty:
                    false
            },
            function (
                celula,
                numeroColuna
            ) {

                const texto =
                    normalizarTexto(
                        obterTextoCelula(
                            celula
                        )
                    );


                Object.entries(
                    aliasesCabecalhos
                ).forEach(
                    function (
                        [
                            campo,
                            aliases
                        ]
                    ) {

                        if (
                            aliases.includes(
                                texto
                            )
                        ) {

                            mapa[campo] =
                                numeroColuna;

                        }

                    }
                );

            }
        );


        const pontuacao =
            Object.keys(
                mapa
            ).length;


        if (
            pontuacao >
            melhorPontuacao
        ) {

            melhorPontuacao =
                pontuacao;


            melhorLinha =
                numeroLinha;


            melhorMapa =
                mapa;

        }

    }


    /*
        Exigimos pelo menos alguns cabeçalhos
        fundamentais para evitar escrever
        na região errada da planilha.
    */

    if (
        melhorPontuacao < 6
    ) {

        throw new Error(
            "Não foi possível identificar a tabela principal do modelo Excel."
        );

    }


    console.log(
        "Linha do cabeçalho:",
        melhorLinha
    );


    console.log(
        "Colunas encontradas:",
        melhorMapa
    );


    return {

        linha:
            melhorLinha,

        colunas:
            melhorMapa

    };

}


/* =========================================================
   LOCALIZAR DADOS INTERNOS
========================================================= */

function localizarDadoInterno(
    item,
    analise
) {

    const internos =
        Array.isArray(
            analise?.itensInternos
        )
            ? analise.itensInternos
            : [];


    return internos.find(
        function (
            interno
        ) {

            if (
                item.itemTabelaId
                &&
                interno.itemTabelaId
            ) {

                return (
                    String(
                        item.itemTabelaId
                    )
                    ===
                    String(
                        interno.itemTabelaId
                    )
                );

            }


            return (
                String(
                    item.codigoEnergisa
                )
                ===
                String(
                    interno.codigoEnergisa
                )
            );

        }
    ) || {};

}


/* =========================================================
   CONVERTER DATA
========================================================= */

function converterDataExcel(
    data
) {

    if (!data) {

        return "";

    }


    const partes =
        String(data)
            .split("-");


    if (
        partes.length !== 3
    ) {

        return data;

    }


    return new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );

}


/* =========================================================
   ESCREVER UMA CÉLULA
========================================================= */

function escrever(
    worksheet,
    linha,
    coluna,
    valor
) {

    if (!coluna) {

        return;

    }


    worksheet
        .getCell(
            linha,
            coluna
        )
        .value =
            valor;

}


/* =========================================================
   DETECTAR QUANTIDADE DE LINHAS ANTIGAS
========================================================= */

function detectarLinhasDados(
    worksheet,
    linhaInicial,
    colunaDescricao
) {

    if (!colunaDescricao) {

        return 1;

    }


    let quantidade =
        0;


    let vaziasSeguidas =
        0;


    for (
        let linha = linhaInicial;
        linha <= worksheet.rowCount;
        linha++
    ) {

        const texto =
            normalizarTexto(
                obterTextoCelula(
                    worksheet.getCell(
                        linha,
                        colunaDescricao
                    )
                )
            );


        if (texto) {

            quantidade++;


            vaziasSeguidas =
                0;

        } else {

            vaziasSeguidas++;


            if (
                quantidade > 0
                &&
                vaziasSeguidas >= 2
            ) {

                break;

            }

        }

    }


    return Math.max(
        quantidade,
        1
    );

}


/* =========================================================
   PREPARAR LINHAS
========================================================= */

function prepararLinhas(
    worksheet,
    linhaInicial,
    quantidadeExistente,
    quantidadeNova
) {

    /*
        Se a nova medição possuir mais itens
        que o modelo, criamos novas linhas
        preservando o estilo da região.
    */

    if (
        quantidadeNova >
        quantidadeExistente
    ) {

        const adicionais =
            quantidadeNova -
            quantidadeExistente;


        const linhas =
            Array.from(
                {
                    length:
                        adicionais
                },
                function () {

                    return [];

                }
            );


        worksheet.insertRows(
            linhaInicial +
                quantidadeExistente,
            linhas,
            "i"
        );

    }

}


/* =========================================================
   LIMPAR SOBRAS DA MEDIÇÃO ANTIGA
========================================================= */

function limparLinhasSobrando(
    worksheet,
    linhaInicial,
    quantidadeExistente,
    quantidadeNova,
    colunas
) {

    if (
        quantidadeNova >=
        quantidadeExistente
    ) {

        return;

    }


    const colunasTabela =
        Object.values(
            colunas
        );


    for (
        let indice =
            quantidadeNova;
        indice <
            quantidadeExistente;
        indice++
    ) {

        const numeroLinha =
            linhaInicial +
            indice;


        colunasTabela.forEach(
            function (
                numeroColuna
            ) {

                worksheet
                    .getCell(
                        numeroLinha,
                        numeroColuna
                    )
                    .value =
                        null;

            }
        );

    }

}


/* =========================================================
   ESCREVER ITENS DA MEDIÇÃO
========================================================= */

function escreverItens(
    worksheet,
    linhaInicial,
    colunas,
    medicao,
    analise
) {

    const itens =
        Array.isArray(
            medicao.itens
        )
            ? medicao.itens
            : [];


    itens.forEach(
        function (
            item,
            indice
        ) {

            const linha =
                linhaInicial +
                indice;


            const interno =
                localizarDadoInterno(
                    item,
                    analise
                );


            escrever(
                worksheet,
                linha,
                colunas.cidade,
                medicao.cidade || ""
            );


            escrever(
                worksheet,
                linha,
                colunas.localidade,
                medicao.localidade || ""
            );


            escrever(
                worksheet,
                linha,
                colunas.responsavel,
                medicao.responsavel || ""
            );


            escrever(
                worksheet,
                linha,
                colunas.descricaoServico,
                item.especificacao || ""
            );


            escrever(
                worksheet,
                linha,
                colunas.dataServico,
                converterDataExcel(
                    medicao.dataServico
                )
            );


            escrever(
                worksheet,
                linha,
                colunas.numeracaoContrato,
                medicao.contratoNumero || ""
            );


            escrever(
                worksheet,
                linha,
                colunas.itemContrato,
                item.codigoEnergisa || ""
            );


            /*
                Ainda não cadastramos Tipo de Nota.
            */

            escrever(
                worksheet,
                linha,
                colunas.tipoNota,
                ""
            );


            escrever(
                worksheet,
                linha,
                colunas.valorUnitario,
                Number(
                    item.valorUnitario
                ) || 0
            );


            escrever(
                worksheet,
                linha,
                colunas.quantidadeRealizada,
                Number(
                    item.quantidade
                ) || 0
            );


            /*
                Ainda não temos KM na medição.
            */

            escrever(
                worksheet,
                linha,
                colunas.valorKm,
                ""
            );


            escrever(
                worksheet,
                linha,
                colunas.quantidadeKm,
                ""
            );


            /*
                Valor do serviço.
            */

            escrever(
                worksheet,
                linha,
                colunas.valorServico,
                Number(
                    item.total
                ) || 0
            );


            /*
                Como ainda não existe KM,
                Valor Total = Valor Serviço.
            */

            escrever(
                worksheet,
                linha,
                colunas.valorTotal,
                Number(
                    item.total
                ) || 0
            );


            escrever(
                worksheet,
                linha,
                colunas.rateio,
                interno.rateio || ""
            );


            escrever(
                worksheet,
                linha,
                colunas.centroCusto,
                interno.centroCusto || ""
            );


            escrever(
                worksheet,
                linha,
                colunas.opex,
                interno.opex || ""
            );


            escrever(
                worksheet,
                linha,
                colunas.capex,
                interno.capex || ""
            );


            /*
                Formatação de data
            */

            if (
                colunas.dataServico
            ) {

                worksheet
                    .getCell(
                        linha,
                        colunas.dataServico
                    )
                    .numFmt =
                        "dd/mm/yyyy";

            }


            /*
                Formatação monetária.
            */

            [
                colunas.valorUnitario,
                colunas.valorKm,
                colunas.valorServico,
                colunas.valorTotal
            ]
                .filter(Boolean)
                .forEach(
                    function (
                        coluna
                    ) {

                        worksheet
                            .getCell(
                                linha,
                                coluna
                            )
                            .numFmt =
                                'R$ #,##0.00';

                    }
                );

        }
    );

}


/* =========================================================
   NOME DO ARQUIVO
========================================================= */

function criarNomeArquivo(
    medicao
) {

    const numero =
        medicao.numeroMedicao
        ||
        "MEDICAO";


    const prestador =
        medicao.prestadorNome
        ||
        "PRESTADOR";


    const nome =
        `${numero} - ${prestador}`
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /[\\/:*?"<>|]/g,
                "-"
            );


    return (
        `${nome}.xlsx`
    );

}


/* =========================================================
   DOWNLOAD
========================================================= */

function baixarArquivo(
    buffer,
    nome
) {

    const blob =
        new Blob(
            [
                buffer
            ],
            {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        nome;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    setTimeout(
        function () {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );

}


/* =========================================================
   FUNÇÃO PRINCIPAL
========================================================= */

export async function gerarExcelMedicao(
    medicao,
    analise
) {

    console.log(
        "===================================="
    );

    console.log(
        "GERANDO EXCEL"
    );

    console.log(
        "Medição:",
        medicao?.numeroMedicao
    );

    console.log(
        "===================================="
    );


    if (
        !medicao
    ) {

        throw new Error(
            "Dados da medição não disponíveis."
        );

    }


    if (
        medicao.status !==
        "aprovado"
    ) {

        throw new Error(
            "Somente medições aprovadas podem gerar o Excel final."
        );

    }


    if (
        typeof ExcelJS ===
        "undefined"
    ) {

        throw new Error(
            "Biblioteca ExcelJS não foi carregada."
        );

    }


    const itens =
        Array.isArray(
            medicao.itens
        )
            ? medicao.itens
            : [];


    if (
        itens.length === 0
    ) {

        throw new Error(
            "A medição não possui serviços."
        );

    }


    /*
        CARREGAR MODELO
    */

    const resposta =
        await fetch(
            "../modelos/modelo-medicao.xlsx"
        );


    if (
        !resposta.ok
    ) {

        throw new Error(
            "Não foi possível carregar modelos/modelo-medicao.xlsx."
        );

    }


    const arquivo =
        await resposta.arrayBuffer();


    const workbook =
        new ExcelJS.Workbook();


    await workbook.xlsx.load(
        arquivo
    );


    /*
        PLANILHA PRINCIPAL
    */

    const worksheet =
        workbook.getWorksheet(
            "Medição"
        )
        ||
        workbook.worksheets[0];


    if (!worksheet) {

        throw new Error(
            "Nenhuma planilha foi encontrada no modelo."
        );

    }


    console.log(
        "Planilha utilizada:",
        worksheet.name
    );


    /*
        LOCALIZAR TABELA
    */

    const cabecalho =
        localizarCabecalho(
            worksheet
        );


    const linhaInicial =
        cabecalho.linha + 1;


    const quantidadeExistente =
        detectarLinhasDados(
            worksheet,
            linhaInicial,
            cabecalho.colunas.descricaoServico
        );


    console.log(
        "Primeira linha de dados:",
        linhaInicial
    );


    console.log(
        "Linhas existentes no modelo:",
        quantidadeExistente
    );


    console.log(
        "Itens da medição:",
        itens.length
    );


    /*
        PREPARAR QUANTIDADE DE LINHAS
    */

    prepararLinhas(
        worksheet,
        linhaInicial,
        quantidadeExistente,
        itens.length
    );


    /*
        REMOVER DADOS ANTIGOS QUE SOBRARIAM
    */

    limparLinhasSobrando(
        worksheet,
        linhaInicial,
        quantidadeExistente,
        itens.length,
        cabecalho.colunas
    );


    /*
        ESCREVER DADOS
    */

    escreverItens(
        worksheet,
        linhaInicial,
        cabecalho.colunas,
        medicao,
        analise
    );


    /*
        PROPRIEDADES DO ARQUIVO
    */

    workbook.creator =
        "Orçamento Rápido - Energisa";


    workbook.lastModifiedBy =
        "Orçamento Rápido - Energisa";


    workbook.modified =
        new Date();


    /*
        GERAR ARQUIVO
    */

    const buffer =
        await workbook.xlsx.writeBuffer();


    const nome =
        criarNomeArquivo(
            medicao
        );


    baixarArquivo(
        buffer,
        nome
    );


    console.log(
        "Excel gerado:",
        nome
    );


    return nome;

}