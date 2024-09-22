document.getElementById('downloadPDF').addEventListener('click', async function () {

    if (!validateFormFields()) {
        alert('Por favor, preencha todos os campos obrigatórios antes de gerar o PDF.');
        return; // Interrompe a execução se a validação falhar
    }

    const formData = JSON.parse(sessionStorage.getItem('formData')) || { atividades: [] };
    const participantes = JSON.parse(sessionStorage.getItem('participantes')) || [];
    
    const tipos = participantes.map(participante => participante.tipo);
    const nomeParticipantes = participantes.map(participante => participante.nome);
    
    const atividades = formData.atividades.map(atividade => atividade.descricao);
    const salaLink = formData.atividades.map(atividade => atividade.salaLink);
    
    // Mapeia IDs dos palestrantes para os nomes correspondentes
    const listaPalestrantes = formData.atividades.map(atividade => 
        atividade.palestrantes.map(idPalestrante => {
            const palestrante = participantes.find(p => p.id === idPalestrante);
            return palestrante ? palestrante.nome : 'Palestrante não encontrado';
        }).join(', ')  // Junta os nomes dos palestrantes em uma string separada por vírgula
    );

    const listaOutrosParticipantes = formData.atividades.map(atividade =>
        atividade.outrosParticipantes.map(idParticipante => {
            const participante = participantes.find(p => p.id === idParticipante);
            return participante ? participante.nome : 'Participante não encontrado';
        })
    );
    
    const dataAtividade = formData.atividades.map(atividade => atividade.data);
    console.log('Data da atividade:', dataAtividade);

    const horasRefeicoes = [];
    const horasPagaveis = [];
    const horasParticipacaoAtiva = [];
    const horasTotais = []; // New array for total hours
    
    console.log('Número de participantes:', participantes.length);
    console.log('Número de atividades:', formData.atividades.length);
    
    function calculateDuration(timeInit, timeEnd) {
        // Verificar se timeInit ou timeEnd são vazios
        if (!timeInit || !timeEnd) {
            console.error('Os horários de início e fim devem ser fornecidos.');
            return 0; // Retorna 0 ou outro valor padrão para indicar duração inválida
        }
    
        const start = new Date(`1970-01-01T${timeInit}:00`);
        const end = new Date(`1970-01-01T${timeEnd}:00`);
    
        // Calcular duração e garantir que o valor seja positivo
        const duration = (end - start) / 3600000; // Convertendo de milissegundos para horas
    
        // Verificar se a duração é negativa
        if (duration < 0) {
            console.error('O horário de início deve ser anterior ao horário de fim.');
            return 0; // Retorna 0 para indicar uma duração inválida
        }
    
        return duration;
    }
    
    participantes.forEach(participante => {
        let totalHorasRefeicoes = 0;
        let totalHorasPagaveis = 0;
        let totalHorasParticipacaoAtiva = 0;
    
        console.log('Processando participante:', participante.id);
    
        formData.atividades.forEach(atividade => {
            const duracao = calculateDuration(atividade.timeInit, atividade.timeEnd);
            console.log('Atividade:', atividade.descricao, 'Duração:', duracao);
    
            if (atividade.teveRefeicao) {
                totalHorasRefeicoes += duracao;
                console.log('Refeição');
            } else if (atividade.palestrantes.includes(participante.id)) {
                totalHorasPagaveis += duracao;
                console.log('Palestrante');
            } else if (atividade.outrosParticipantes.includes(participante.id)) {
                totalHorasParticipacaoAtiva += duracao;
                console.log('Participação Ativa');
            } else {
                console.log('Participante não envolvido nesta atividade');
            }
        });
    
        const totalHoras = totalHorasRefeicoes + totalHorasPagaveis + totalHorasParticipacaoAtiva;
    
        console.log('Totais para participante', participante.id, ':', 
                    'Refeições:', totalHorasRefeicoes, 
                    'Pagáveis:', totalHorasPagaveis, 
                    'Participação Ativa:', totalHorasParticipacaoAtiva,
                    'Total:', totalHoras);
    
        horasRefeicoes.push(totalHorasRefeicoes.toFixed(2));
        horasPagaveis.push(totalHorasPagaveis.toFixed(2));
        horasParticipacaoAtiva.push(totalHorasParticipacaoAtiva.toFixed(2));
        horasTotais.push(totalHoras.toFixed(2)); // Add total hours to the new array
    });

    const timeInit = formData.atividades.map(atividade => atividade.timeInit);
    const timeEnd = formData.atividades.map(atividade => atividade.timeEnd);

    // Geração do PDF Horizontal
    const pdfBytesHoriz = await createPDFHoriz(
        formData, participantes, tipos, nomeParticipantes, atividades, salaLink, listaPalestrantes, 
        listaOutrosParticipantes, horasRefeicoes, horasPagaveis, horasParticipacaoAtiva, horasTotais, dataAtividade, timeInit, timeEnd
    );

    // Geração do PDF Vertical
    const pdfBytesVert = await createPDFVertic(
        formData, participantes, tipos, nomeParticipantes, atividades, salaLink, listaPalestrantes, 
        listaOutrosParticipantes, horasRefeicoes, horasPagaveis, horasParticipacaoAtiva, horasTotais, dataAtividade, timeInit, timeEnd
    );

    // Criação dos Blobs para os dois PDFs
    const blobHoriz = new Blob([pdfBytesHoriz], { type: 'application/pdf' });
    const blobVert = new Blob([pdfBytesVert], { type: 'application/pdf' });

    // Criação dos Links para Download
    const linkHoriz = document.createElement('a');
    linkHoriz.href = URL.createObjectURL(blobHoriz);
    linkHoriz.download = `Dados Agenda - ${formData.nomeEvento} - Horizontal.pdf`;

    const linkVert = document.createElement('a');
    linkVert.href = URL.createObjectURL(blobVert);
    linkVert.download = `Dados Agenda - ${formData.nomeEvento} - Vertical.pdf`;

    // Disparo dos Downloads
    linkHoriz.click();
    linkVert.click();
});


async function createPDFHoriz(formData, participantes, tipos, nomeParticipantes, atividades, salaLink, listaPalestrantes, 
    listaOutrosParticipantes, horasRefeicoes, horasPagaveis, horasParticipacaoAtiva, horasTotais, dataAtividade, timeInit, timeEnd) {
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const pageSize = [841.89, 595.28]; // A4 landscape
    let page = pdfDoc.addPage(pageSize); // Adiciona a primeira página
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Colors
    const purple = rgb(0.8, 0.7, 0.9);
    const darkPurple = rgb(0.5, 0.4, 0.7);
    const black = rgb(0, 0, 0);

    // Text sizes
    const titleSize = 16;
    const subtitleSize = 12;
    const normalSize = 10;

    // Margins and spacing
    const marginLeft = 40;
    const marginTop = 550;
    const lineHeight = 20;
    const pageLimitY = 40; // Limite antes de começar uma nova página

    // Helper function to create a new page and reset the currentY
    function addNewPage() {
        page = pdfDoc.addPage(pageSize);
        currentY = marginTop;
    }

    // Header
    let currentY = marginTop;
    page.drawText(formData.nomeEvento, { x: marginLeft, y: currentY, size: titleSize, font: boldFont, color: darkPurple });
    page.drawText(`${formData.tipoEvento} / ${formData.localEvento}`, { x: marginLeft, y: currentY - lineHeight, size: subtitleSize, font: regularFont });

    // Summary table
    currentY -= 3 * lineHeight;
    drawTable(page, marginLeft, currentY, 760, 6 * lineHeight, purple);
    page.drawText("Sumário de horas por participante", { x: marginLeft + 5, y: currentY - 15, size: subtitleSize, font: boldFont });

    currentY -= lineHeight;
    const headers = ["Perfil", "Participante", "Horas em refeições", "Horas pagáveis", "Horas com participação", "Total de horas"];
    const columnWidths = [120, 200, 100, 100, 150, 100];

    headers.forEach((header, index) => {
        let xPos = marginLeft + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
        let columnWidth = columnWidths[index];
        let textWidth = header.length * (normalSize / 2); // Estimativa aproximada da largura do texto
        let centeredX = xPos + (columnWidth - textWidth) / 2;
        page.drawText(header, { x: centeredX, y: currentY - 15, size: normalSize, font: boldFont });
    });

    currentY -= lineHeight;
    for (let i = 0; i < participantes.length; i++) {
        // Checar se precisa de uma nova página
        if (currentY - lineHeight < pageLimitY) {
            addNewPage();
        }

        const rowData = [
            tipos[i],
            nomeParticipantes[i],
            horasRefeicoes[i],
            horasPagaveis[i],
            horasParticipacaoAtiva[i],
            horasTotais[i]
        ];

        rowData.forEach((data, index) => {
            let xPos = marginLeft + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
            let columnWidth = columnWidths[index];
            let textWidth = data.toString().length * (normalSize / 2); // Estimativa aproximada da largura do texto
            let centeredX = xPos + (columnWidth - textWidth) / 2;
            page.drawText(data.toString(), { x: centeredX, y: currentY - 15, size: normalSize, font: regularFont });
        });

        currentY -= lineHeight;
    }

    // Activities
    currentY -= 3 * lineHeight;
    page.drawText("Atividades agendadas", { x: marginLeft, y: currentY, size: titleSize, font: boldFont, color: darkPurple });
    currentY -= 3 * lineHeight;
    for (let i = 0; i < atividades.length; i++) {
        // Checar se precisa de uma nova página
        if (currentY - 5 * lineHeight < pageLimitY) {
            addNewPage();
        }

        currentY -= 2 * lineHeight;
        let activityHeight = 5 * lineHeight;
        drawTable(page, marginLeft, currentY, 760, activityHeight, purple);

        page.drawText(atividades[i], { x: marginLeft + 5, y: currentY - 15, size: subtitleSize, font: boldFont });
        page.drawText(salaLink[i], { x: marginLeft + 5, y: currentY - 35, size: normalSize, font: regularFont });
        page.drawText(`Palestrantes: ${listaPalestrantes[i]}`, { x: marginLeft + 5, y: currentY - 55, size: normalSize, font: regularFont });
        page.drawText(`Data: ${dataAtividade[i]}`, { x: marginLeft + 400, y: currentY - 15, size: normalSize, font: boldFont });
        page.drawText(timeInit[i], { x: marginLeft + 650, y: currentY - 15, size: normalSize, font: boldFont });
        page.drawText(' a ', { x: marginLeft + 675, y: currentY - 15, size: normalSize, font: boldFont });
        page.drawText(timeEnd[i], { x: marginLeft + 685, y: currentY - 15, size: normalSize, font: boldFont });


        const participantesText = `Participantes: ${listaOutrosParticipantes[i].join(', ')}`;
        const maxWidth = 750;
        const words = participantesText.split(' ');
        let line = '';
        let yOffset = 75;

        for (let word of words) {
            if ((line + word).length * (normalSize / 2) < maxWidth) {
                line += (line ? ' ' : '') + word;
            } else {
                page.drawText(line, { x: marginLeft + 5, y: currentY - yOffset, size: normalSize, font: regularFont });
                yOffset += 20;
                line = word;
            }
        }
        if (line) {
            page.drawText(line, { x: marginLeft + 5, y: currentY - yOffset, size: normalSize, font: regularFont });
        }

        currentY -= activityHeight + lineHeight;
    }

    function drawTable(page, x, y, width, height, color) {
        page.drawRectangle({
            x: x,
            y: y - height,
            width: width,
            height: height,
            borderColor: color,
            borderWidth: 1,
            color: rgb(0.95, 0.95, 0.95),
        });
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

async function createPDFVertic(formData, participantes, tipos, nomeParticipantes, atividades, salaLink, listaPalestrantes, 
    outrosParticipantes, horasRefeicoes, horasPagaveis, horasParticipacaoAtiva, horasTotais, dataAtividade, timeInit, timeEnd) {
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 900]);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Cores
    const azul = rgb(0.3216, 0.3627, 0.6392);
    const preto = rgb(0, 0, 0);
    const roxo_escuro = rgb(0.8196, 0.7686, 0.8667);
    const roxo_escuro_texto = rgb(0.4235, 0.3059, 0.5216);
    const roxo_claro = rgb(0.9137, 0.8824, 0.9333);

    // Texto
    const titulo = 16;
    const subtitulo = 10;
    const texto = 8;

    // Formatação
    var inicioX = 50; // O fim é no 550
    var inicioY = 860;
    const gapTexto = 20;
    const gapColunaHorizontal = 200;
    const gapColunaVertical = 15;

    // Nome do Evento
    page.drawText(formData.nomeEvento, {
        x: inicioX,
        y: inicioY,
        size: titulo,
        color: azul,
        font: boldFont,
    });

    // Subtítulo evento
    page.drawText(formData.tipoEvento+' / '+formData.localEvento, {
        x: inicioX,
        y: inicioY - gapTexto,
        size: subtitulo,
        color: preto,
        font: regularFont,
    });

    // Retângulo sumário de horas por participante
    page.drawRectangle({
        x: inicioX,
        y: inicioY - 2 * gapTexto - gapColunaVertical,
        width: 500,
        height: 15,
        color: roxo_escuro,
    });

    // Sumário de horas por participante
    page.drawText('Sumário de horas por participante', {
        x: inicioX + 3,
        y: (inicioY - 2 * gapTexto - gapColunaVertical) + 3.5,
        size: subtitulo,
        color: preto,
        font: boldFont,
    });

    // Retângulo perfil e participante
    page.drawRectangle({
        x: inicioX,
        y: (inicioY - 2 * gapTexto - gapColunaVertical) - 30,
        width: 500,
        height: 30,
        color: roxo_claro,
    });

    // Coluna de perfil e de Participante
    page.drawText('Perfil', {
        x: inicioX + 3,
        y: ((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 7.5,
        size: subtitulo,
        color: roxo_escuro_texto,
        font: boldFont,
    });
    page.drawText('Participante', {
        x: (inicioX + 3) + gapColunaHorizontal,
        y: ((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 7.5,
        size: subtitulo,
        color: roxo_escuro_texto,
        font: boldFont,
    });

    // Loop que pega array de participantes e insere o quanto precisar
    var Perfil = tipos;
    var Participante = nomeParticipantes;

    var i = 1;
    var ultimoY = 0;
    for (perfil of Perfil) {
        page.drawText(perfil, {
            x: inicioX + 3,
            y: (((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 15) - gapColunaVertical * i,
            size: texto,
            color: preto,
            font: regularFont,
        });
        i++;

        if (i == Perfil.length) {
            var ultimoY = (((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 15) - gapColunaVertical * i;
        }
    }

    var i = 1;
    for (participante of Participante) {
        page.drawText(participante, {
            x: (inicioX + 3) + gapColunaHorizontal,
            y: (((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 15) - gapColunaVertical * i,
            size: texto,
            color: preto,
            font: regularFont,
        });
        i++;
    }

    // A partir daqui, usar o ultimoY como referência de altura 

    // Atividades agendadas
    page.drawText('Atividades agendadas', {
        x: inicioX,
        y: ultimoY - 2 * gapColunaVertical,
        size: titulo,
        color: azul,
        font: boldFont,
    });

    // Loop que pega a quantidade de atividades agendadas e monta no pdf

    // Obs: siga a ordem do primeiro ao último, se algum campo for vazio, coloque uma string vazia na lista ''
    var tituloAtividade = atividades;
    var nomeOuLinkPalestra = salaLink;
    var palestrantes = listaPalestrantes;

    // Variável de referência para a altura
    let alturaAtual = ultimoY - 4 * gapColunaVertical;

    for (let j = 0; j < tituloAtividade.length; j++) {
        var atividade = tituloAtividade[j];
        var nomeOuLink = nomeOuLinkPalestra[j];
        var palestrante = palestrantes[j];

        // Retângulo Atividade
        page.drawRectangle({
            x: inicioX,
            y: alturaAtual,
            width: 500,
            height: 15,
            color: roxo_escuro,
        });

        // Atualiza altura para o próximo item
        alturaAtual -= 15; // Subtrai 15 para o próximo retângulo

        // Retângulo Nome/Link
        page.drawRectangle({
            x: inicioX,
            y: alturaAtual,
            width: 500,
            height: 15,
            color: roxo_claro,
        });

        // Atualiza altura para o próximo item
        alturaAtual -= 15; // Subtrai 15 para o próximo retângulo

        // Texto palestra
        page.drawText(atividade, {
            x: inicioX + 3,
            y: alturaAtual + 34, // Ajuste em relação ao retângulo da atividade
            size: subtitulo,
            color: preto,
            font: boldFont,
        });

        // Atualiza altura para o próximo item
        alturaAtual -= 15; // Subtrai 15 para o próximo texto

        // Texto nome ou link
        page.drawText(nomeOuLink, {
            x: inicioX + 3,
            y: alturaAtual + 34, // Ajuste em relação ao retângulo Nome/Link
            size: subtitulo,
            color: roxo_escuro_texto,
            font: boldFont,
        });

        // Atualiza altura para o próximo item
        alturaAtual -= 15; // Subtrai 15 para o próximo texto

        // Texto palestrantes
        var PalestranteCondicional = palestrante == '' ? '' : 'Palestrantes';
        page.drawText(PalestranteCondicional, {
            x: inicioX + 3,
            y: (alturaAtual - gapTexto) + 50, // Ajuste em relação ao nome ou link
            size: subtitulo,
            color: preto,
            font: boldFont,
        });

        // Atualiza altura para o próximo item
        alturaAtual -= (gapTexto + 1.8 * gapTexto); // Ajuste em relação ao texto 'Palestrantes'

        // Texto nome do palestrante
        page.drawText(palestrante, {
            x: inicioX + 5,
            y: (alturaAtual) + 70, // Ajuste em relação ao texto 'Palestrantes'
            size: texto,
            color: preto,
            font: regularFont,
        });

        // Atualiza altura para o próximo item
        alturaAtual -= (gapTexto - 60); // Ajuste em relação ao texto do palestrante
    }


    // Segunda página
    const page2 = pdfDoc.addPage([600, 900]);
    var inicioX = 50;
    var inicioY = 890;

    // Retângulo sem texto
    page2.drawRectangle({
        x: inicioX,
        y: inicioY - 2 * gapTexto - gapColunaVertical,
        width: 500,
        height: 15,
        color: roxo_escuro,
    });

    // Retângulo Horas
    page2.drawRectangle({
        x: inicioX,
        y: (inicioY - 2 * gapTexto - gapColunaVertical) - 30,
        width: 500,
        height: 30,
        color: roxo_claro,
    });


    // 
    page2.drawText('', {
        x: inicioX + 3,
        y: (inicioY - 2 * gapTexto - gapColunaVertical) + 3.5,
        size: subtitulo,
        color: preto,
        font: boldFont,
    });


    // Colunas de Horas
    // Horas em
    page2.drawText('Horas em', {
        x: (inicioX + 3) + 210,
        y: ((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 3.5,
        size: subtitulo - 2,
        color: roxo_escuro_texto,
        font: boldFont,
    });
    // refeições
    page2.drawText('refeições', {
        x: (inicioX + 3) + 210,
        y: (((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 3.5) - 11.5,
        size: subtitulo - 2,
        color: roxo_escuro_texto,
        font: boldFont,
    });

    page2.drawText('Horas pagáveis', {
        x: ((inicioX + 3) + gapColunaHorizontal) + 100,
        y: ((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 3.5,
        size: subtitulo - 2,
        color: roxo_escuro_texto,
        font: boldFont,
    });
    page2.drawText('(Palestrante)', {
        x: ((inicioX + 3) + gapColunaHorizontal) + 100,
        y: (((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 3.5) - 11.5,
        size: subtitulo - 2,
        color: roxo_escuro_texto,
        font: boldFont,
    });

    page2.drawText('Horas com participação', {
        x: (inicioX + 3) + 2 * gapColunaHorizontal,
        y: ((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 3.5,
        size: subtitulo - 2,
        color: roxo_escuro_texto,
        font: boldFont,
    });
    page2.drawText('ativa requerida', {
        x: (inicioX + 3) + 2 * gapColunaHorizontal,
        y: (((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 3.5) - 11.5,
        size: subtitulo - 2,
        color: roxo_escuro_texto,
        font: boldFont,
    });

    var alturaAtual2 = 0;
    var i = 1;
    var ultimoY = 0;
    for (horasRef of horasRefeicoes) {
        page2.drawText(horasRef, {
            x: (inicioX + 3) + 220,
            y: ((((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 3.5) - 11.5) - gapColunaVertical * i,
            size: texto,
            color: preto,
            font: regularFont,
        });
        i++;

        if (i == Perfil.length) {
            var ultimoY = ((((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 3.5) - 11.5) - gapColunaVertical * i;
        }
    }

    var i = 1;
    for (horasPag of horasPagaveis) {
        page2.drawText(horasPag, {
            x: ((inicioX + 3) + 220) + 0.5 * gapColunaHorizontal,
            y: ((((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 3.5) - 11.5) - gapColunaVertical * i,
            size: texto,
            color: preto,
            font: regularFont,
        });
        i++;
    }

    var i = 1;
    for (horasPart of horasParticipacaoAtiva) {
        page2.drawText(horasPart, {
            x: ((inicioX + 3) + 220) + gapColunaHorizontal,
            y: ((((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 3.5) - 11.5) - gapColunaVertical * i,
            size: texto,
            color: preto,
            font: regularFont,
        });
        i++;
        if (i == horasParticipacaoAtiva.length) {
            var alturaAtual2 = (((((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 3.5) - 11.5) - gapColunaVertical * i) - 30;
        }

    }

    // Loop das datas e horários
    const data = dataAtividade; // Lista de datas das atividades
    const horarios = formData.atividades.map(atividade => `${atividade.timeInit} - ${atividade.timeEnd}`); // Pega o horário de início e fim
    const participantesAtividade = formData.atividades.map(atividade => atividade.outrosParticipantes); // Mapeia os participantes

    for (let k = 0; k < tituloAtividade.length; k++) {
        const dataAtual = data[k] || '';
        const horarioAtual = horarios[k] || '';
        const participantesAtuais = participantesAtividade[k].map(idParticipante => {
            const participante = participantes.find(p => p.id === idParticipante);
            return participante ? participante.nome : 'Participante não encontrado';
        }).join(', '); // Junta os participantes em uma string

        try {
            // Retângulo Atividade
            page2.drawRectangle({
                x: inicioX,
                y: alturaAtual2,
                width: 500,
                height: 15,
                color: roxo_escuro,
            });

            alturaAtual2 -= 15; // Atualiza altura para o próximo item

            // Retângulo Nome/Link
            page2.drawRectangle({
                x: inicioX,
                y: alturaAtual2,
                width: 500,
                height: 15,
                color: roxo_claro,
            });

            alturaAtual2 -= 15; // Atualiza altura para o próximo item

            // Texto palestra
            page2.drawText(dataAtual, {
                x: ((inicioX + 3) + 220) + gapColunaHorizontal + 3,
                y: alturaAtual2 + 34,
                size: subtitulo,
                color: preto,
                font: boldFont,
            });

            alturaAtual2 -= 15; // Atualiza altura para o próximo item

            // Texto nome ou link
            page2.drawText(horarioAtual, {
                x: ((inicioX + 3) + 220) + gapColunaHorizontal + 3,
                y: alturaAtual2 + 34,
                size: subtitulo,
                color: roxo_escuro_texto,
                font: boldFont,
            });

            alturaAtual2 -= 15; // Atualiza altura para o próximo item

            // Texto palestrantes
            page2.drawText(`Participantes:`, {
                x: inicioX + 3,
                y: (alturaAtual2 - gapTexto) + 50,
                size: subtitulo,
                color: preto,
                font: boldFont,
            });

            alturaAtual2 -= (gapTexto + 1.8 * gapTexto); // Atualiza altura
            // Texto nome do palestrante com quebras de linha
                page2.drawText(participantesAtuais, {
                    x: inicioX + 3,
                    y: (alturaAtual2) + 70 - k * 20, // Ajusta a posição vertical para cada participante
                    size: texto,
                    color: preto,
                    font: regularFont,
                });


            alturaAtual2 -= (gapTexto - 60 + participantesAtuais.length * 15); // Atualiza altura com base no número de participantes
        } catch (error) {
            console.error(error);
            // Caso ocorra um erro, utiliza string vazia
            page2.drawText('', {
                x: inicioX + 3,
                y: (alturaAtual2) + 70,
                size: texto,
                color: preto,
                font: regularFont,
            });
        }
    }


    // Terceira página
    // Segunda página
    const page3 = pdfDoc.addPage([600, 900]);
    var inicioX = 50;
    var inicioY = 890;

    // Retângulo sem texto
    page3.drawRectangle({
        x: inicioX,
        y: inicioY - 2 * gapTexto - gapColunaVertical,
        width: 500,
        height: 15,
        color: roxo_escuro,
    });

    // Retângulo Horas
    page3.drawRectangle({
        x: inicioX,
        y: (inicioY - 2 * gapTexto - gapColunaVertical) - 30,
        width: 500,
        height: 30,
        color: roxo_claro,
    });

    page3.drawText('Total de horas', {
        x: inicioX + 3,
        y: ((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 7,
        size: subtitulo - 2,
        color: roxo_escuro_texto,
        font: boldFont,
    });

    var i = 0;
    for (totalHoras of horasTotais) {
            page3.drawText(totalHoras, {
                x: inicioX + 5,
                y: ((((inicioY - 2 * gapTexto - gapColunaVertical) - 10) - 7) - 27) - 0.75*gapTexto*i,
                size: texto,
                color: preto,
                font: regularFont,
            });
            i++;

        }

    // // Cor do título
    // page.drawRectangle({
    //     x: 50,
    //     y: 800,
    //     width: 500,
    //     height: 15,
    //     color: cinza_escuro,
    // });


    // Finaliza e retorna os bytes do PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
