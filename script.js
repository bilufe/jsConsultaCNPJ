

async function buscarCNPJ() {
    const inputCNPJ = document.getElementById('cnpj').value.replace(/[^\d]/g, '');
    const url = `https://brasilapi.com.br/api/cnpj/v1/${inputCNPJ}`;

    try {

        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const dados = await resposta.json();

        mostrarResultado(dados);

    } catch (erro) {
        console.log('Erro: ', erro);

        document.getElementById('resultado').innerHTML = `
            <p style="color: red;"><strong>Erro: </strong><span style="color: black;">Verifique o número do CNPJ fornecido e tente novamente.</span></p>`;

    }
}

function mostrarResultado(dados) {

    const resultadoHTML = document.getElementById('resultado');

    const cnaesSecundarios = dados.cnaes_secundarios.map(cnae =>
        `<li>${cnae.codigo} - ${cnae.descricao}</li>`
    ).join('');

    resultadoHTML.innerHTML = `
        <h2>Informações da empresa</h2>
        
        <p><strong>CNPJ: </strong> ${dados.cnpj} - ${dados.descricao_identificador_matriz_filial}<br>
        <strong>Razão Social: </strong>${dados.razao_social}<br>
        <strong>Nome Fantasia: </strong>${dados.nome_fantasia || 'Não disponível'}<br>
        <strong>Natureza Jurídica: </strong>${dados.natureza_juridica} - <strong>Porte:</strong> ${dados.porte}<br>
        <strong>Situação Cadastral: </strong>${dados.descricao_situacao_cadastral} - <strong>Data da Situação Cadastral: </strong>${dataAmericanaTOdataBrasil(dados.data_situacao_cadastral)}<br>
        <strong>Data de início da atividade: </strong>${dataAmericanaTOdataBrasil(dados.data_inicio_atividade)}
        <strong>Capital Social: </strong>R$ ${dados.capital_social}</p>

        <p>${verificaOptanteSimples(dados.opcao_pelo_simples, dados.data_opcao_pelo_simples)}<br>
        Optante pelo MEI: ${verificaMei(dados.opcao_pelo_mei, dados.data_opcao_pelo_mei)}</p>
    

        <p><strong>Endereço:</strong><br>
        ${dados.descricao_tipo_de_logradouro} ${dados.logradouro} ${dados.numero} ${dados.complemento} - Bairro: ${dados.bairro} <br> Município: ${dados.municipio} / Estado: ${dados.uf} - CEP: ${dados.cep}<br>
        E-mail: ${dados.email && dados.email !== 'null' ? dados.email : 'Não disponível'} - Telefone 1: ${dados.ddd_telefone_1 && dados.ddd_telefone_1 !== 'null' ? dados.ddd_telefone_1 : "Não disponível"} - Telefone 2: ${dados.ddd_telefone_2 && dados.ddd_telefone_2 !== 'null' ? dados.ddd_telefone_2 : "Não disponível"}

        <p style="color: darkgreen;"><strong>Atividade principal: </strong><br>${dados.cnae_fiscal} - ${dados.cnae_fiscal_descricao}</p>
    `;

    if (cnaesSecundarios > 0){
        resultadoHTML.innerHTML += `
        <p style="color: blue;"><strong>Atividades secundárias: </strong><br>${cnaesSecundarios}</p>
        `;
    } else {
        resultadoHTML.innerHTML += `
        <p>Empresa sem atividades secundárias.</p>
        `;
    }

    if (dados.qsa.length == 0){
        resultadoHTML.innerHTML += `
        <p style="color: red;"><strong>Quadro de Sócios e Administradores não disponível</strong></p>
        `;
    }

    for (i = 0; i < dados.qsa.length; i++) {
        resultadoHTML.innerHTML += `
        <div id="qsa">
        <p><strong>Nome do sócio: </strong>${dados.qsa[i].nome_socio}<br>
        CNPJ ou CPF do sócio: ${dados.qsa[i].cnpj_cpf_do_socio}<br>
        Data da entrada na sociedade: ${dataAmericanaTOdataBrasil(dados.qsa[i].data_entrada_sociedade)}<br>
        Qualificação do sócio: ${dados.qsa[i].qualificacao_socio}</p></div>
        `
    }

}

function dataAmericanaTOdataBrasil(dataAmericana) {
    const [ano, mes, dia] = dataAmericana.split("-");
    return `${dia}/${mes}/${ano}`;
}

function verificaOptanteSimples(opcao, dataOpcao){
    if (opcao === true){
        return `Optante pelo Simples Nacional desde ${dataAmericanaTOdataBrasil(dataOpcao)}`; 
    } else {
        return "Empresa não é optante pelo Simples Nacional.";
    }
}

function verificaMei(opcao, dataOpcao){
    if (opcao === true){
        return `Empresa MEI desde ${dataAmericanaTOdataBrasil(dataOpcao)}`;
    } else {
        return "Não";
    }

}

