document.addEventListener('DOMContentLoaded', () => {
    // Salvando o valor do dolar em uma constante
    getDolar();

    // Restaurar dados do evento do localStorage
    const savedEventData = JSON.parse(localStorage.getItem('formData'));

    if (savedEventData) {
        document.getElementById('tipoEvento').value = savedEventData.tipoEvento;
        document.getElementById('nomeEvento').value = savedEventData.nomeEvento;
        document.getElementById('localEvento').value = savedEventData.localEvento;
        document.getElementById('dataEvento').value = savedEventData.dataEvento;
        document.getElementById('nomeSolicitante').value = savedEventData.nomeSolicitante;
        document.getElementById('unidade').value = savedEventData.unidade;
        document.getElementById('racionalEvento').value = savedEventData.racionalEvento;
        document.getElementById('comentariosObservacoes').value = savedEventData.comentariosObservacoes;

        // Desabilitar os campos para evitar edição
        document.getElementById('tipoEvento').disabled = true;
        document.getElementById('nomeEvento').disabled = true;
        document.getElementById('localEvento').disabled = true;
        document.getElementById('dataEvento').disabled = true;
        document.getElementById('nomeSolicitante').disabled = true;
        document.getElementById('unidade').disabled = true;
        document.getElementById('racionalEvento').disabled = true;
        document.getElementById('comentariosObservacoes').disabled = true;
    }

    // Restaurar nome e sobrenome do participante da URL ou localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const nomeParticipante = urlParams.get('expertName');
    
    if (nomeParticipante) {
        const [nome, sobrenome] = nomeParticipante.split(' ');
        document.getElementById('expertFirstName').value = nome;
        document.getElementById('expertLastName').value = sobrenome;

        // Desabilitar campos de nome e sobrenome
        document.getElementById('expertFirstName').disabled = true;
        document.getElementById('expertLastName').disabled = true;
    }

    document.getElementById('resetPaymentForm').addEventListener('click', resetForm);
});

const urlParams = new URLSearchParams(window.location.search);
const participantId = urlParams.get('participantId');

if (participantId) {
    const participantes = JSON.parse(localStorage.getItem('participantes')) || [];
    const participante = participantes.find(p => p.id === participantId);

    if (participante) {
        document.getElementById('nomeParticipante').value = participante.nome;
        document.getElementById('tipoParticipante').value = participante.tipo;
    }
}

// Função para salvar o valor do dolar em uma constante
function getDolar() {
    fetch('https://v6.exchangerate-api.com/v6/abb2928bfdc4ed44635f504f/latest/BRL')
    .then(response => response.json())
    .then(data => {
        window.valorDolar = data.conversion_rates.USD;
    })
    .catch(error => console.error('Erro ao obter a taxa de câmbio:', error));
}

// Função para converter real para dólar
function updateHourlyRateUSD() {
    const valorReal = parseFloat(document.getElementById('hourlyRateBRL').value);
    if (isNaN(valorReal)) return;

    document.getElementById('hourlyRateUSD').value = (valorReal * valorDolar).toFixed(2);
    
    /*
    fetch('https://v6.exchangerate-api.com/v6/abb2928bfdc4ed44635f504f/latest/BRL')
        .then(response => response.json())
        .then(data => {
            const usdRate = data.conversion_rates.USD;
            document.getElementById('hourlyRateUSD').value = (brlRate * usdRate).toFixed(2);
        })
        .catch(error => console.error('Erro ao obter a taxa de câmbio:', error));
    */
}

// Adiciona o listener ao botão de exportação para PDF
document.getElementById('exportPDFButton').addEventListener('click', async () => {
    try {
        const { PDFDocument, rgb } = PDFLib;
        const doc = await PDFDocument.create();
        const page = doc.addPage([600, 400]);
        const { width, height } = page.getSize();
        const fontSize = 12;

        page.drawText('Formulário de Pagamento do Expert', {
            x: 50,
            y: height - 50,
            size: fontSize,
            color: rgb(0, 0, 1)
        });

        const form = document.getElementById('paymentForm');
        const formData = new FormData(form);
        let y = height - 80;

        formData.forEach((value, key) => {
            page.drawText(`${key}: ${value}`, {
                x: 50,
                y: y,
                size: fontSize,
                color: rgb(0, 0, 0)
            });
            y -= 15;
        });

        const pdfBytes = await doc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'formulario-expert.pdf';
        link.click();
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
    }
});

// Função para salvar os dados do formulário no localStorage
function saveData() {
    const form = document.getElementById('paymentForm');
    const formData = new FormData(form);
    const data = {};

    // Salva todos os dados do formulário no objeto `data`
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Salvar também os campos calculados (Total Paid Hours, Total Fee BRL, Total Fee USD)
    data.totalPaidHours = document.getElementById('totalPaidHours').value;
    data.totalFeeBRL = document.getElementById('totalFeeBRL').value;
    data.totalFeeUSD = document.getElementById('totalFeeUSD').value;

    const nomeParticipante = urlParams.get('expertName'); // Pega o nome do participante da URL
    if (nomeParticipante) {
        // Armazena os dados do formulário para o participante específico
        localStorage.setItem(`paymentFormData-${nomeParticipante}`, JSON.stringify(data));
    }
}

// Salva os dados do formulário antes de enviar
document.getElementById('paymentForm').addEventListener('submit', saveData);



// Função para restaurar os dados do formulário a partir do localStorage
function restoreData() {
    const nomeParticipante = urlParams.get('expertName'); // Pega o nome do participante da URL
    if (nomeParticipante) {
        const savedData = localStorage.getItem(`paymentFormData-${nomeParticipante}`);

        if (savedData) {
            const data = JSON.parse(savedData);
            const form = document.getElementById('paymentForm');

            // Restaura todos os campos salvos
            Object.keys(data).forEach(key => {
                const element = form.elements[key];
                if (element) {
                    if (element.type === 'checkbox' || element.type === 'radio') {
                        element.checked = data[key] === 'on' || data[key] === 'yes';
                    } else {
                        element.value = data[key];
                    }
                }
            });

            // Restaurar campos calculados manualmente
            document.getElementById('totalPaidHours').value = data.totalPaidHours || '';
            document.getElementById('totalFeeBRL').value = data.totalFeeBRL || '';
            document.getElementById('totalFeeUSD').value = data.totalFeeUSD || '';
        }
    }
}


// Chame restoreData quando a página for carregada para restaurar os dados
document.addEventListener('DOMContentLoaded', restoreData);

function handleSubmit() {
    window.location.href = 'formulario_evento.html';
    return false;
}
// Salve os dados do formulário antes de enviar
document.getElementById('paymentForm').addEventListener('submit', saveData);


function resetForm() {
    if (confirm('Você tem certeza de que deseja resetar o formulário?')) {
        const form = document.getElementById('paymentForm');

        // Itera sobre todos os elementos do formulário
        Array.from(form.elements).forEach(element => {
            // Verifica se o campo não é readonly
            if (!element.hasAttribute('readonly')) {
                // Limpa o valor do campo
                if (element.type === 'checkbox' || element.type === 'radio') {
                    element.checked = false;
                } else {
                    element.value = '';
                }
            }
        });

        // Limpa os campos calculados
        document.getElementById('totalPaidHours').value = '';
        document.getElementById('totalFeeBRL').value = '';
        document.getElementById('totalFeeUSD').value = '';

        // Remove dados do localStorage para o participante atual
        const nomeParticipante = urlParams.get('expertName');
        if (nomeParticipante) {
            localStorage.removeItem(`paymentFormData-${nomeParticipante}`);
        }
    }
}

// Adiciona o listener para o botão de reset
document.getElementById('resetPaymentForm').addEventListener('click', resetForm);


// Tabela de taxas baseada no nível do especialista
const paymentRates = {
    'tier 1 specialist': { min: 1733, standard: 1925, max: 2118 },
    'tier 2 specialist': { min: 1395, standard: 1550, max: 1705 },
    'tier 3 specialist': { min: 1080, standard: 1200, max: 1320 },
    'tier 4 specialist': { min: 810, standard: 900, max: 990 },
    'tier 5 specialist': { min: 630, standard: 700, max: 770 },
    'tier 1 generalist': { min: 1035, standard: 1150, max: 1265 },
    'tier 2 generalist': { min: 675, standard: 750, max: 825 },
    'tier 3 generalist': { min: 540, standard: 600, max: 660 },
    'tier 4 generalist': { min: 405, standard: 450, max: 495 },
    'tier 5 generalist': { min: 315, standard: 350, max: 385 }
};

// Função para atualizar as taxas com base no nível do expert e papel
function updatePaymentRates() {
    const expertLevel = document.getElementById('expertLevel').value;
    const role = document.getElementById('role').value;
    const rates = paymentRates[expertLevel];

    if (rates) {
        let minRate = rates.min;
        let standardRate = rates.standard;
        let maxRate = rates.max;

        // Verificar se o papel é "Chairman" e multiplicar as taxas por 1,2
        if (role === 'Chairman') {
            minRate *= 1.2;
            standardRate *= 1.2;
            maxRate *= 1.2;
        }

        document.getElementById('minRate').value = minRate.toFixed(2);
        document.getElementById('standardRate').value = standardRate.toFixed(2);
        document.getElementById('maxRate').value = maxRate.toFixed(2);

        // Validar se a taxa por hora está dentro do intervalo recomendado
        validateHourlyRate(minRate, maxRate);
    }
}

// Função para validar a taxa por hora e alterar a cor do campo conforme necessário
function validateHourlyRate(minRate, maxRate) {
    const hourlyRateBRL = parseFloat(document.getElementById('hourlyRateBRL').value);
    
    // Verifica se o valor está dentro do intervalo e altera a cor do campo
    if (!isNaN(hourlyRateBRL)) {
        if (hourlyRateBRL < minRate || hourlyRateBRL > maxRate) {
            document.getElementById('hourlyRateBRL').style.backgroundColor = 'red';
        } else {
            document.getElementById('hourlyRateBRL').style.backgroundColor = 'lightgreen';
        }
    } else {
        // Se o campo estiver vazio ou não for um número, restaura o fundo original
        document.getElementById('hourlyRateBRL').style.backgroundColor = '';
    }
}

// Adicionar listener para quando o nível do expert, papel ou taxa por hora for alterado
document.getElementById('expertLevel').addEventListener('change', updatePaymentRates);
document.getElementById('role').addEventListener('change', updatePaymentRates);
document.getElementById('hourlyRateBRL').addEventListener('input', () => {
    const minRate = parseFloat(document.getElementById('minRate').value);
    const maxRate = parseFloat(document.getElementById('maxRate').value);
    
    // Validar a taxa por hora ao inserir manualmente
    validateHourlyRate(minRate, maxRate);
});

// Mapeamento da compensação do tempo de viagem em horas
const travelTimeCompensation = {
    '0 - 80 km': 0.50,
    '81 - 160 km': 1.00,
    '161 - 400 km': 2.00,
    '401 - 1200 km': 3.00,
    '1201 - 8000 km': 4.00,
    '8001 - 16000 km': 5.00,
    '16001 - 32000 km': 7.50,
    'above 32000 km': 10.00
};

// Função para calcular o Total Fee
function calculateTotalFee() {
    const serviceHours = parseFloat(document.getElementById('serviceDuration').value) || 0;
    const preparationHours = parseFloat(document.getElementById('preparationTime').value) || 0;
    const travelTime = document.getElementById('travelTime').value;
    const travelCompensation = travelTimeCompensation[travelTime] || 0;

    const hourlyRateBRL = parseFloat(document.getElementById('hourlyRateBRL').value) || 0;
    const hourlyRateUSD = parseFloat(document.getElementById('hourlyRateUSD').value) || 0;

    // Total de horas pagas (tempo de serviço + tempo de preparação + compensação de viagem)
    const totalPaidHours = serviceHours + preparationHours + travelCompensation;
    document.getElementById('totalPaidHours').value = totalPaidHours.toFixed(2);

    // Cálculo do Total Fee em BRL e USD
    const totalFeeBRL = totalPaidHours * hourlyRateBRL;
    const totalFeeUSD = totalPaidHours * hourlyRateUSD;

    // Atualiza os campos de total fee
    document.getElementById('totalFeeBRL').value = totalFeeBRL.toFixed(2);
    document.getElementById('totalFeeUSD').value = totalFeeUSD.toFixed(2);
}

// Adicionar listeners para recalcular o total quando o usuário alterar qualquer campo relevante
document.getElementById('serviceDuration').addEventListener('input', calculateTotalFee);
document.getElementById('preparationTime').addEventListener('input', calculateTotalFee);
document.getElementById('travelTime').addEventListener('change', calculateTotalFee);
document.getElementById('hourlyRateBRL').addEventListener('input', calculateTotalFee);
document.getElementById('hourlyRateUSD').addEventListener('input', calculateTotalFee);

