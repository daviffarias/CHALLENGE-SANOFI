document.getElementById('botaotestepdf').addEventListener('click', async function () {
    const pdfBytes = await createPDF();

    // Cria um Blob para download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'teste.pdf';

    // Simula o clique no link para fazer o download
    link.click();
});

async function createPDF() {
    const { PDFDocument, rgb, StandardFonts, fontBold } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 850]);
    const cinza_escuro = rgb(0.5, 0.5, 0.5);
    const cinza_claro = rgb(0.9, 0.9, 0.9);
    const textSize = 10; // Tamanho do texto do header

    // Cor de fundo cinza claro
    page.drawRectangle({
        x: 0,
        y: 0,
        width: 600,
        height: 850,
        color: cinza_claro,
    });

    // Cor do título
    page.drawRectangle({
        x: 50,
        y: 800,
        width: 500,
        height: 15,
        color: cinza_escuro,
    });

    page.drawText('Calculation - For internal use only', {
        x: 230,
        y: 805,
        size: textSize,
        color: rgb(1, 1, 1),
    });

    // Função para centralizar o texto
    async function drawCenteredText(page, text, x, y, width) {
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const textWidth = font.widthOfTextAtSize(text, textSize);
        page.drawText(text, {
            x: x + (width - textWidth) / 2,
            y: y,
            size: textSize,
            color: rgb(1, 1, 1),
            font,
        });
    }

    // --------------------------------------------------------------------------------------
    // FASE 1: Service Information
    let startX = 50;
    let startY = 779; // Ajustado para estar abaixo do retângulo do título
    const cellWidth = 275;
    const cellHeight = 15;
    const rectWidth = 500;
    const headerGapTop = 3; // Espaçamento de 3 pontos acima do retângulo
    const headerGapBottom = 5; // Espaçamento de 5 pontos abaixo do retângulo

    // Título e células da tabela
    const header = ['Service Information'];
    const content = [
        ['Name of the requestor', 'Teste FIAP'],
        ['Sanofi entity (DCV, Sanofi Genzyme, etc.)', 'Teste FIAP'],
        ['Requestor Country', 'Teste FIAP'],
        ['Project Title', 'Teste FIAP'],
        ['Service Localization (Country)', 'Teste FIAP'],
        ['Service Date', 'Teste FIAP'],
    ];

    page.drawRectangle({
        x: startX,
        y: startY + headerGapTop, // Ajustado para estar com o gap de 3 pontos acima
        width: rectWidth,
        height: 15,
        color: cinza_escuro,
    });

    await drawCenteredText(page, header[0], startX, startY + headerGapTop + 5, rectWidth); // Ajustado para o gap de 5 pontos abaixo

    for (let i = 0; i < content.length; i++) {
        const rowY = startY - (i * cellHeight);

        // Desenhar bordas horizontais (linhas) apenas para a segunda coluna
        page.drawLine({
            start: { x: startX + cellWidth, y: rowY },
            end: { x: startX + rectWidth, y: rowY },
            thickness: 1,
            color: rgb(0, 0, 0),
        });

        // Primeira coluna (sem bordas)
        page.drawText(content[i][0], {
            x: startX + 5,
            y: rowY - 10,
            size: 9,
            color: rgb(0, 0, 0),
        });

        // Segunda coluna (com bordas)
        page.drawText(content[i][1], {
            x: startX + cellWidth + 5,
            y: rowY - 10,
            size: 9,
            color: rgb(0, 0, 0),
        });
    }

    // Desenhar bordas verticais e a borda final para a segunda coluna
    for (let i = 0; i <= content.length; i++) {
        const rowY = startY - (i * cellHeight);

        // Linha vertical separando a primeira e segunda coluna
        page.drawLine({
            start: { x: startX + cellWidth, y: startY },
            end: { x: startX + cellWidth, y: rowY },
            thickness: 1,
            color: rgb(0, 0, 0),
        });

        // Linha vertical no fim da segunda coluna
        page.drawLine({
            start: { x: startX + rectWidth, y: startY },
            end: { x: startX + rectWidth, y: rowY },
            thickness: 1,
            color: rgb(0, 0, 0),
        });
    }

    // Borda inferior da tabela
    page.drawLine({
        start: { x: startX, y: startY - (content.length * cellHeight) },
        end: { x: startX + rectWidth, y: startY - (content.length * cellHeight) },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    // --------------------------------------------------------------------------------------
    // FASE 2: Contract Description
    const startX2 = 50;
    let startY2 = startY - (content.length * cellHeight) - headerGapBottom - 16; // Ajustado para o gap de 5 pontos e distância para o retângulo
    const cellWidth2 = 275;
    const cellHeight2 = 15;
    const rectWidth2 = 500;

    // Título e células da tabela
    const header2 = ['Contract description'];
    const content2 = [
        ['Expert Last Name', 'Teste FIAP'],
        ['Expert First Name', 'Teste FIAP'],
        ['Expert country of practice', 'Brazil'],
        ['Service type', 'Symposium within the framework of a congress'],
        ['Role', 'Speaker'],
        ['Expert Level', 'Tier 1 Specialist'],
        ['Hourly rate (BRL)', '1925'],
        ['Hourly rate (USD)', '431'],
        ['Duration of the service in hours', '5,00'],
        ['Preparation time in hours', '5,00'],
        ['Presentation type (new or not)', 'Teste FIAP'],
        ['Number of preparatory conf-calls', 'Teste FIAP'],
        ['Individual prep. time', 'Teste FIAP'],
        ['Pre-reading required by Sanofi', 'Teste FIAP'],
        ['On-site slide review', 'Teste FIAP'],
        ['Speaker notes required by Sanofi', 'Teste FIAP'],
        ['Travel time', '0 - 80 km / 0 - 50 miles'],
    ];

    page.drawRectangle({
        x: startX2,
        y: startY2 + headerGapTop, // Ajustado para estar com o gap de 3 pontos acima
        width: rectWidth2,
        height: 15,
        color: cinza_escuro,
    });

    await drawCenteredText(page, header2[0], startX2, startY2 + headerGapTop + 5, rectWidth2); // Ajustado para o gap de 5 pontos abaixo

    for (let i = 0; i < content2.length; i++) {
        const rowY = startY2 - (i * cellHeight2);

        // Desenhar bordas horizontais (linhas) apenas para a segunda coluna
        page.drawLine({
            start: { x: startX2 + cellWidth2, y: rowY },
            end: { x: startX2 + rectWidth2, y: rowY },
            thickness: 1,
            color: rgb(0, 0, 0),
        });

        // Primeira coluna (sem bordas)
        page.drawText(content2[i][0], {
            x: startX2 + 5,
            y: rowY - 10,
            size: 9,
            color: rgb(0, 0, 0),
        });

        // Segunda coluna (com bordas)
        page.drawText(content2[i][1], {
            x: startX2 + cellWidth2 + 5,
            y: rowY - 10,
            size: 9,
            color: rgb(0, 0, 0),
        });
    }

    // Desenhar bordas verticais e a borda final para a segunda coluna
    for (let i = 0; i <= content2.length; i++) {
        const rowY = startY2 - (i * cellHeight2);

        // Linha vertical separando a primeira e segunda coluna
        page.drawLine({
            start: { x: startX2 + cellWidth2, y: startY2 },
            end: { x: startX2 + cellWidth2, y: rowY },
            thickness: 1,
            color: rgb(0, 0, 0),
        });

        // Linha vertical no fim da segunda coluna
        page.drawLine({
            start: { x: startX2 + rectWidth2, y: startY2 },
            end: { x: startX2 + rectWidth2, y: rowY },
            thickness: 1,
            color: rgb(0, 0, 0),
        });
    }

    // Borda inferior da tabela
    page.drawLine({
        start: { x: startX2, y: startY2 - (content2.length * cellHeight2) },
        end: { x: startX2 + rectWidth2, y: startY2 - (content2.length * cellHeight2) },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

 // --------------------------------------------------------------------------------------
// FASE 3: New Table with 3 Vertical Columns
const startX3 = 50;
let startY3 = startY2 - (content2.length * cellHeight2) - headerGapBottom - 40; // Ajuste de -16 para -40, garantindo mais espaço antes da nova tabela
const cellWidth3 = 175; // Largura de cada coluna na nova tabela
const cellHeight3 = 15; // Altura de cada célula
const numRows = 4; // Número de linhas

// Cabeçalhos da nova tabela
const headers3 = [
    'Total paid hours',
    'Time for service in hours',
    'Preparation time in hours',
    'Travel time compensation in hours'
];

// Cor de fundo dos cabeçalhos
const headerColors3 = [
    cinza_escuro,
    rgb(0.7, 0.7, 0.7), // Cinza entre o mais escuro e o mais claro da página
    rgb(0.7, 0.7, 0.7), // Cinza entre o mais escuro e o mais claro da página
    rgb(0.7, 0.7, 0.7)  // Cinza entre o mais escuro e o mais claro da página
];

// Desenhar cabeçalhos da tabela
for (let i = 0; i < headers3.length; i++) {
    const rectY = startY3 - i * (cellHeight3 + 1);

    // Desenhar o retângulo do cabeçalho
    page.drawRectangle({
        x: startX3,
        y: rectY + 26.9,
        width: cellWidth3,
        height: cellHeight3 + 2.30,
        color: headerColors3[i],
    });

    // Centralizar o texto no retângulo
    await drawCenteredText(page, headers3[i], startX3, rectY + 32.4, cellWidth3);
}


// Linhas horizontais do total paid hours
page.drawLine({
    start: { x: 50 , y: 396 },
    end: { x: 550 , y: 396 }, 
    thickness: 1,
    color: rgb(0, 0, 0),
});

page.drawLine({
    start: { x: 50 , y: 377 },
    end: { x: 550 , y: 377 }, 
    thickness: 1,
    color: rgb(0, 0, 0),
});

page.drawLine({
    start: { x: 50 , y: 362 },
    end: { x: 550 , y: 362 }, 
    thickness: 1,
    color: rgb(0, 0, 0),
});

page.drawLine({
    start: { x: 50 , y: 348 },
    end: { x: 550 , y: 348 }, 
    thickness: 1,
    color: rgb(0, 0, 0),
});



// Linhas verticais do total paid hours
page.drawLine({
    start: { x: 50 , y: 413},
    end: { x: 50, y: 348},
    thickness: 1,
    color: rgb(0, 0, 0),
});

page.drawLine({
    start: { x: 225 , y: 413},
    end: { x: 225, y: 348},
    thickness: 1,
    color: rgb(0, 0, 0),
});

page.drawLine({
    start: { x: 390 , y: 413},
    end: { x: 390, y: 348},
    thickness: 1,
    color: rgb(0, 0, 0),
});

page.drawLine({
    start: { x: 550 , y: 413},
    end: { x: 550, y: 348},
    thickness: 1,
    color: rgb(0, 0, 0),
});


// Textos do total paid hours
page.drawText('Valor01', {
    x: 228,
    y: 401,
    size: 9,
    color: rgb(0, 0, 0),
});

page.drawText('Valor02', {
    x: 393,
    y: 401,
    size: 9,
    color: rgb(0, 0, 0),
});

page.drawText('Valor03', {
    x: 228,
    y: 383,
    size: 9,
    color: rgb(0, 0, 0),
});

page.drawText('Valor04', {
    x: 393,
    y: 383,
    size: 9,
    color: rgb(0, 0, 0),
});

page.drawText('Valor05', {
    x: 228,
    y: 367,
    size: 9,
    color: rgb(0, 0, 0),
});

page.drawText('Valor06', {
    x: 393,
    y: 367,
    size: 9,
    color: rgb(0, 0, 0),
});

page.drawText('Valor07', {
    x: 228,
    y: 351,
    size: 9,
    color: rgb(0, 0, 0),
});

page.drawText('Valor08', {
    x: 393,
    y: 351,
    size: 9,
    color: rgb(0, 0, 0),
});


// --------------------------------------------------------------------------------------
// FASE 4: fee calculation
const startX4 = 50;
let startY4 = startY2 - (content2.length * cellHeight2) - headerGapBottom - 115; 
const cellWidth4 = 175; // Largura de cada coluna na nova tabela
const cellHeight4 = 15; // Altura de cada célula
const numRows4 = 2; // Número de linhas

// Cabeçalhos da nova tabela
const headers4 = [
    'Fee calculation BRL',
    'Fee calculation USD',
];

// Cor de fundo dos cabeçalhos
const headerColors4 = [
    cinza_escuro,
    rgb(0.7, 0.7, 0.7), // Cinza entre o mais escuro e o mais claro da página
    rgb(0.7, 0.7, 0.7), // Cinza entre o mais escuro e o mais claro da página
    rgb(0.7, 0.7, 0.7)  // Cinza entre o mais escuro e o mais claro da página
];

// Desenhar cabeçalhos da tabela
for (let i = 0; i < headers4.length; i++) {
    const rectY = startY4 - i * (cellHeight4 + 1);

    // Desenhar o retângulo do cabeçalho
    page.drawRectangle({
        x: startX4,
        y: rectY + 26.9,
        width: cellWidth4,
        height: cellHeight4 + 2.30,
        color: headerColors4[i],
    });

    // Centralizar o texto no retângulo
    await drawCenteredText(page, headers4[i], startX4, rectY + 32.4, cellWidth4);
}

// Linhas horizontais do total fee calculation
page.drawLine({
    start: { x: 50 , y: 305 },
    end: { x: 390 , y: 305 }, 
    thickness: 1,
    color: rgb(0, 0, 0),
});

page.drawLine({
    start: { x: 50 , y: 321 },
    end: { x: 390 , y: 321 }, 
    thickness: 1,
    color: rgb(0, 0, 0),
});

page.drawLine({
    start: { x: 50 , y: 337},
    end: { x: 390 , y: 337 }, 
    thickness: 1,
    color: rgb(0, 0, 0),
});


// Linhas verticais do fee calculation
page.drawLine({
    start: { x: 50 , y: 305},
    end: { x: 50, y: 337},
    thickness: 1,
    color: rgb(0, 0, 0),
});

page.drawLine({
    start: { x: 225 , y: 305},
    end: { x: 225, y: 337},
    thickness: 1,
    color: rgb(0, 0, 0),
});

page.drawLine({
    start: { x: 390 , y: 305},
    end: { x: 390, y: 337},
    thickness: 1,
    color: rgb(0, 0, 0),
});

// Valores para o fee calculation
page.drawText('Valor01fee', {
    x: 228,
    y: 326,
    size: 9,
    color: rgb(0, 0, 0),
});

page.drawText('Valor02fee', {
    x: 228,
    y: 309,
    size: 9,
    color: rgb(0, 0, 0),
});



// Caixa adicional Linhas horizontais
page.drawLine({
    start: { x: 50 , y: 210},
    end: { x: 550 , y: 210 }, 
    thickness: 1,
    color: rgb(0, 0, 0),
});

page.drawLine({
    start: { x: 50 , y: 290},
    end: { x: 550 , y: 290 }, 
    thickness: 1,
    color: rgb(0, 0, 0),
});


// Caixa adicional Linhas verticais
page.drawLine({
    start: { x: 50 , y: 210},
    end: { x: 50, y: 290},
    thickness: 1,
    color: rgb(0, 0, 0),
});

page.drawLine({
    start: { x: 550 , y: 210},
    end: { x: 550, y: 290},
    thickness: 1,
    color: rgb(0, 0, 0),
});

// Caixa adicional texto

page.drawText('Additional Information and / or justifications', {
    x: 52,
    y: 281.5,
    size: 8,
    color: rgb(0, 0, 0),
});

// Footer

page.drawText('PDF gerado por FormEase - FusionTech', {
    x: 254,
    y: 25,
    size: 7,
    color: rgb(0, 0, 0),
});

page.drawText('DD/MM/AAAA', {
    x: 291,
    y: 16,
    size: 7,
    color: rgb(0, 0, 0),
});



    // Salvar o PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
