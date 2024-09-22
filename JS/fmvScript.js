document.addEventListener('DOMContentLoaded', () => {
    // Salvando o valor do dolar em uma constante
    getDolar();
    updatePaymentRates();

    // Restaurar dados do evento do sessionStorage
    const savedEventData = JSON.parse(sessionStorage.getItem('formData'));

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

    // Restaurar nome e sobrenome do participante da URL ou sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const nomeParticipante = urlParams.get('expertName');
    const participantId = urlParams.get('participantId');
    
    if (nomeParticipante && participantId) {
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
    const participantes = JSON.parse(sessionStorage.getItem('participantes')) || [];
    const participante = participantes.find(p => p.id === participantId);

    if (participante) {
        const nomeParticipanteElem = document.getElementById('nomeParticipante');
        const tipoParticipanteElem = document.getElementById('tipoParticipante');

        // Verificar se os elementos existem antes de definir os valores
        if (nomeParticipanteElem) {
            nomeParticipanteElem.value = participante.nome;
        }
        if (tipoParticipanteElem) {
            tipoParticipanteElem.value = participante.tipo;
        }
    } else {
        console.warn(`Participante com ID "${participantId}" não encontrado.`);
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
}

function validateFormFMV() {
    const hourlyRateBRL = document.getElementById('hourlyRateBRL');
    const serviceDuration = document.getElementById('serviceDuration');
    const preparationTime = document.getElementById('preparationTime');
    let isValid = true;

    // Remove previous errors
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    const errorInputs = document.querySelectorAll('.input-error');
    errorInputs.forEach(input => input.classList.remove('input-error'));

    // Validate hourlyRateBRL
    if (!hourlyRateBRL.value) {
        hourlyRateBRL.classList.add('input-error');
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Campo "Hourly Rate BRL" é obrigatório.';
        hourlyRateBRL.parentElement.appendChild(errorMsg);
        isValid = false;
    }

    // Validate serviceDuration
    if (!serviceDuration.value) {
        serviceDuration.classList.add('input-error');
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Campo "Service Duration" é obrigatório.';
        serviceDuration.parentElement.appendChild(errorMsg);
        isValid = false;
    }

    // Validate preparationTime
    if (!preparationTime.value) {
        preparationTime.classList.add('input-error');
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Campo "Preparation Time" é obrigatório.';
        preparationTime.parentElement.appendChild(errorMsg);
        isValid = false;
    }

    return isValid;
}


// Função para salvar os dados do formulário no sessionStorage
function saveData() {
    const form = document.getElementById('paymentForm');
    const formData = new FormData(form);
    const data = {};

    // Salva todos os dados do formulário no objeto `data`
    formData.forEach((value, key) => {
        data[key] = value;
    });

    const travelTime = document.getElementById('travelTime').value;
    const travelCompensation = travelTimeCompensation[travelTime] || 0;  // Calcula o valor da compensação
    data.travelCompensation = travelCompensation.toFixed(2);  // Armazena a compensação

    // Salvar também os campos calculados (Total Paid Hours, Total Fee BRL, Total Fee USD)
    data.totalPaidHours = document.getElementById('totalPaidHours').value;
    data.totalFeeBRL = document.getElementById('totalFeeBRL').value;
    data.totalFeeUSD = document.getElementById('totalFeeUSD').value;

    const urlParams = new URLSearchParams(window.location.search);
    const participantId = urlParams.get('participantId');
    if (participantId) {
        // Armazena os dados do formulário para o participante específico usando o ID
        sessionStorage.setItem(`paymentFormData-${participantId}`, JSON.stringify(data));
    }
}

function monitorFormChanges() {
    const form = document.getElementById('paymentForm');
    
    // Adiciona listeners a todos os campos do formulário
    Array.from(form.elements).forEach(element => {
        element.addEventListener('input', saveData);  // Para campos de texto, número e outros que disparam 'input'
        element.addEventListener('change', saveData); // Para selects, checkboxes e radios que disparam 'change'
    });
}

// Chamar a função de monitoramento quando a página carregar
document.addEventListener('DOMContentLoaded', monitorFormChanges);

// Salva os dados do formulário antes de enviar
document.getElementById('paymentForm').addEventListener('submit', saveData);

// Função para restaurar os dados do formulário a partir do sessionStorage
function restoreData() {
    const urlParams = new URLSearchParams(window.location.search);
    const participantId = urlParams.get('participantId');
    if (participantId) {
        const savedData = sessionStorage.getItem(`paymentFormData-${participantId}`);

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

        // Remove dados do sessionStorage para o participante atual
        const nomeParticipante = urlParams.get('expertName');
        if (nomeParticipante) {
            sessionStorage.removeItem(`paymentFormData-${nomeParticipante}`);
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
document.getElementById('role').addEventListener('input', updatePaymentRates);
document.getElementById('expertLevel').addEventListener('input', updatePaymentRates);

