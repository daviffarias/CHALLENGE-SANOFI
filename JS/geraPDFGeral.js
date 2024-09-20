document.getElementById('botaoSacrificio').addEventListener('click', async function () {
    const pdfBytes = await createPDF();

    // Cria um Blob para download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Dados_combinados.pdf`;

    // Simula o clique no link para fazer o download
    link.click();
});

async function createPDF() {
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 900]);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Cores
    const cinza_escuro = rgb(0.5, 0.5, 0.5);
    const cinza_claro = rgb(0.9, 0.9, 0.9);
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
    const inicioX = 50; // O fim é no 550
    const inicioY = 860;
    const gapTexto = 20;
    const gapColunaHorizontal = 200;
    const gapColunaVertical = 15;

    // Nome do Evento
    page.drawText('Nome do evento', {
        x: inicioX,
        y: inicioY,
        size: titulo,
        color: azul,
        font: boldFont,
    });

    // Subtítulo evento
    page.drawText('Scientific meeting / Endereço OU Virtual', {
        x: inicioX,
        y: inicioY - gapTexto,
        size: subtitulo,
        color: preto,
        font: regularFont,
    });

    // Retângulo sumário de horas por participante
    page.drawRectangle({
        x: inicioX,
        y: inicioY - 2*gapTexto - gapColunaVertical,
        width: 500,
        height: 15,
        color: roxo_escuro,
    });

    // Sumário de horas por participante
    page.drawText('Sumário de horas por participante', {
        x: inicioX + 3,
        y: (inicioY - 2*gapTexto - gapColunaVertical) + 3.5,
        size: subtitulo,
        color: preto,
        font: boldFont,
    });

    // Retângulo perfil e participante
    page.drawRectangle({
        x: inicioX,
        y: (inicioY - 2*gapTexto - gapColunaVertical) - 30,
        width: 500,
        height: 30,
        color: roxo_claro,
    });
    
    // Coluna de perfil e de Participante
    page.drawText('Perfil', {
        x: inicioX + 3,
        y: ((inicioY - 2*gapTexto - gapColunaVertical) - 10) - 7.5,
        size: subtitulo,
        color: roxo_escuro_texto,
        font: boldFont,
    });
    page.drawText('Participante', {
        x: (inicioX + 3) + gapColunaHorizontal, 
        y: ((inicioY - 2*gapTexto - gapColunaVertical) - 10) - 7.5,
        size: subtitulo,
        color: roxo_escuro_texto,
        font: boldFont,
    });

    // Loop que pega array de participantes e insere o quanto precisar
    var Perfil = ['Staff Sanofi', 'Expert externo / HCP', 'Expert externo / HCP', 'Expert externo / HCP', 'Expert externo / HCP', ];
    var Participante = ['Colaborador SANOFI', 'Colocar o nome do participante 01', 'Colocar o nome do participante 02', 'Colocar o nome do participante 03', 'XXXXXXX'];

    var i = 1;
    var ultimoY = 0;
    for (perfil of Perfil) {
        page.drawText(perfil, {
            x: inicioX + 3,
            y: (((inicioY - 2*gapTexto - gapColunaVertical) - 10) - 15) - gapColunaVertical*i,
            size: texto,
            color: preto,
            font: regularFont,
        });
        i++;

        if (i == Perfil.length) {
            var ultimoY = (((inicioY - 2*gapTexto - gapColunaVertical) - 10) - 15) - gapColunaVertical*i;
        }
    }

    var i = 1;
    for (participante of Participante) {
        page.drawText(participante, {
            x: (inicioX + 3) + gapColunaHorizontal,
            y: (((inicioY - 2*gapTexto - gapColunaVertical) - 10) - 15) - gapColunaVertical*i,
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
        y: ultimoY - 2*gapColunaVertical,
        size: titulo,
        color: azul,
        font: boldFont,
    });


    // Loop que pega a quantidade de atividades agendadas e monta no pdf

    // Obs: siga a ordem do primeiro ao último, se algum campo for vazio, coloque uma string vazia na lista ''
    var tituloAtividade = ['Palestra 01', 'Palestra 02', 'Palestra 03', 'Coffee break (ou Almoço)', 'Q&A'];
    var nomeOuLinkPalestra = ['Incluir nome/numero da sala ou link virtual', 'Incluir nome/numero da sala ou link virtual', 'Incluir nome/numero da sala ou link virtual', 'Restaurante', 'Incluir nome/numero da sala ou link virtual'];
    var palestrantes = ['Palestrante 01', 'Palestrante 02' , 'Palestrante 03' , '', 'Staff Sanofi']; 

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
