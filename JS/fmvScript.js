document.addEventListener('DOMContentLoaded', () => {
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
// Função para atualizar a taxa por hora em USD
function updateHourlyRateUSD() {
    const brlRate = parseFloat(document.getElementById('hourlyRateBRL').value);
    if (isNaN(brlRate)) return;

    fetch('https://v6.exchangerate-api.com/v6/abb2928bfdc4ed44635f504f/latest/BRL')
        .then(response => response.json())
        .then(data => {
            const usdRate = data.conversion_rates.USD;
            document.getElementById('hourlyRateUSD').value = (brlRate * usdRate).toFixed(2);
        })
        .catch(error => console.error('Erro ao obter a taxa de câmbio:', error));
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

    formData.forEach((value, key) => {
        data[key] = value;
    });

    const nomeParticipante = urlParams.get('expertName'); // Pega o nome do participante da URL
    if (nomeParticipante) {
        // Armazena os dados do formulário para o participante específico
        localStorage.setItem(`paymentFormData-${nomeParticipante}`, JSON.stringify(data));
    }
}


// Função para restaurar os dados do formulário a partir do localStorage
function restoreData() {
    const nomeParticipante = urlParams.get('expertName'); // Pega o nome do participante da URL
    if (nomeParticipante) {
        const savedData = localStorage.getItem(`paymentFormData-${nomeParticipante}`);

        if (savedData) {
            const data = JSON.parse(savedData);
            const form = document.getElementById('paymentForm');

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

        // Remove dados do localStorage para o participante atual
        const nomeParticipante = urlParams.get('expertName');
        if (nomeParticipante) {
            localStorage.removeItem(`paymentFormData-${nomeParticipante}`);
        }
    }
}



