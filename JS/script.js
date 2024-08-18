document.addEventListener('DOMContentLoaded', () => {

const form = document.getElementById('eventForm');
const downloadButton = document.getElementById('downloadPDF');
const participantesSelects = [];
let todosOsParticipantes = new Set();
let savedData = { participantes: [] };

function validateForm() {
    const requiredFields = [
        'nomeEvento', 'dataEvento', 'localEvento',
        'nomeSolicitante', 'unidade'
    ];
    const allFieldsFilled = requiredFields.every(id =>
        document.getElementById(id).value.trim()
    );
    downloadButton.disabled = !allFieldsFilled;
}

function atualizarParticipantesDisponiveis() {
    const participantes = new Set();
    document.querySelectorAll('.participante').forEach(participanteDiv => {
        const nome = participanteDiv.querySelector('input[name="nomeParticipante"]').value.trim();
        if (nome) {
            participantes.add(nome);
        }
    });

    todosOsParticipantes = new Set(participantes);
    participantesSelects.forEach(select => {
        const currentSelected = new Set(select.getValue(true));
        const updatedChoices = Array.from(todosOsParticipantes).map(nome => ({
            value: nome,
            label: nome,
            selected: currentSelected.has(nome),
        }));
        select.clearStore();
        select.setChoices(updatedChoices, 'value', 'label', false);

        currentSelected.forEach(nome => {
            if (todosOsParticipantes.has(nome)) {
                select.setChoiceByValue(nome);
            }
        });
    });
}

function adicionarParticipante(nome, tipo) {
    if (!todosOsParticipantes.has(nome)) {
        todosOsParticipantes.add(nome);
        atualizarParticipantesDisponiveis();
    }
    savedData.participantes.push({ nome, tipo });
    localStorage.setItem('formData', JSON.stringify(savedData));
}

document.getElementById('adicionarParticipante').addEventListener('click', () => {
    const participanteDiv = document.createElement('div');
    participanteDiv.classList.add('participante');
    participanteDiv.innerHTML = `
        <label for="nomeParticipante">Nome:</label>
        <input type="text" name="nomeParticipante">
        <label for="tipoParticipante">Tipo:</label>
        <select name="tipoParticipante">
            <option value="Expert Externo">Expert Externo</option>
            <option value="Staff Interno">Staff Interno</option>
        </select>
        <button type="button" class="removerParticipante">Remover Participante</button>
        <button type="button" class="abrirFormPagamento" disabled>Abrir Formulário de Pagamento</button>
    `;
    document.getElementById('listaParticipantes').appendChild(participanteDiv);

    const nomeInput = participanteDiv.querySelector('input[name="nomeParticipante"]');
    const tipoSelect = participanteDiv.querySelector('select[name="tipoParticipante"]');
    const abrirFormButton = participanteDiv.querySelector('.abrirFormPagamento');

    nomeInput.addEventListener('input', () => {
        if (nomeInput.value.trim() && tipoSelect.value === 'Expert Externo') {
            abrirFormButton.disabled = false;
        } else {
            abrirFormButton.disabled = true;
        }
    });

    tipoSelect.addEventListener('change', () => {
        if (nomeInput.value.trim() && tipoSelect.value === 'Expert Externo') {
            abrirFormButton.disabled = false;
        } else {
            abrirFormButton.disabled = true;
        }
    });

    abrirFormButton.addEventListener('click', () => {
        const nome = nomeInput.value.trim();
        const tipo = tipoSelect.value;

        if (nome && tipo === 'Expert Externo') {
            adicionarParticipante(nome, tipo);
            
            // Salva o estado atual do formulário de evento
            const eventDetails = {
                nomeEvento: document.getElementById('nomeEvento').value,
                dataEvento: document.getElementById('dataEvento').value,
                localEvento: document.getElementById('localEvento').value,
                nomeSolicitante: document.getElementById('nomeSolicitante').value,
                unidade: document.getElementById('unidade').value,
                participantes: savedData.participantes
            };
            localStorage.setItem('eventDetails', JSON.stringify(eventDetails));

            window.location.href = `payment-form.html?expertName=${encodeURIComponent(nome)}&tipo=${encodeURIComponent(tipo)}`;
        }
    });

    participanteDiv.querySelector('.removerParticipante').addEventListener('click', () => {
        const nome = nomeInput.value.trim();
        if (nome) {
            removerParticipante(nome);
            participanteDiv.remove();
        }
    });
});


function restoreFormData() {
    const storedData = localStorage.getItem('formData');
    const eventDetails = JSON.parse(localStorage.getItem('eventDetails'));
    const payments = JSON.parse(localStorage.getItem('payments')) || {};

    if (storedData) {
        savedData = JSON.parse(storedData);
        savedData.participantes.forEach(participante => {
            const participanteDiv = document.createElement('div');
            participanteDiv.classList.add('participante');
            participanteDiv.innerHTML = `
                <label for="nomeParticipante">Nome:</label>
                <input type="text" name="nomeParticipante" value="${participante.nome}">
                <label for="tipoParticipante">Tipo:</label>
                <select name="tipoParticipante">
                    <option value="Expert Externo" ${participante.tipo === 'Expert Externo' ? 'selected' : ''}>Expert Externo</option>
                    <option value="Staff Interno" ${participante.tipo === 'Staff Interno' ? 'selected' : ''}>Staff Interno</option>
                </select>
                <button type="button" class="removerParticipante">Remover Participante</button>
                <button type="button" class="abrirFormPagamento" ${participante.tipo === 'Expert Externo' ? '' : 'disabled'}>Abrir Formulário de Pagamento</button>
            `;
            document.getElementById('listaParticipantes').appendChild(participanteDiv);

            const nomeInput = participanteDiv.querySelector('input[name="nomeParticipante"]');
            const tipoSelect = participanteDiv.querySelector('select[name="tipoParticipante"]');
            const abrirFormButton = participanteDiv.querySelector('.abrirFormPagamento');

            abrirFormButton.addEventListener('click', () => {
                if (nomeInput.value.trim() && tipoSelect.value === 'Expert Externo') {
                    window.location.href = `payment-form.html?nome=${encodeURIComponent(nomeInput.value.trim())}&tipo=${encodeURIComponent(tipoSelect.value)}`;
                }
            });

            participanteDiv.querySelector('.removerParticipante').addEventListener('click', () => {
                const nome = nomeInput.value.trim();
                if (nome) {
                    removerParticipante(nome);
                    participanteDiv.remove();
                }
            });

            // Verificar se há pagamento salvo para este participante
            if (payments[participante.nome]) {
                abrirFormButton.disabled = false;
            }
        });
    }

    if (eventDetails) {
        document.getElementById('nomeEvento').value = eventDetails.nomeEvento;
        document.getElementById('dataEvento').value = eventDetails.dataEvento;
        document.getElementById('localEvento').value = eventDetails.localEvento;
        document.getElementById('nomeSolicitante').value = eventDetails.nomeSolicitante;
        document.getElementById('unidade').value = eventDetails.unidade;
    }

    validateForm();
    atualizarParticipantesDisponiveis();
}



    downloadButton.addEventListener('click', () => {
        const nomeEvento = document.getElementById('nomeEvento').value.trim();
        const dataEvento = document.getElementById('dataEvento').value.trim();

        const participantes = [];
        document.querySelectorAll('.participante').forEach(participanteDiv => {
            const nome = participanteDiv.querySelector('input[name="nomeParticipante"]').value.trim();
            const tipo = participanteDiv.querySelector('select[name="tipoParticipante"]').value.trim();
            participantes.push({ nome, tipo });
        });

        const atividades = [];
        document.querySelectorAll('.atividade').forEach(atividadeDiv => {
            const descricao = atividadeDiv.querySelector('input[name="descricaoAtividade"]').value.trim();
            const salaLink = atividadeDiv.querySelector('input[name="salaLink"]').value.trim();
            const dataHora = atividadeDiv.querySelector('input[name="dataHoraAtividade"]').value.trim();
            const teveRefeicao = atividadeDiv.querySelector('input[name="teveRefeicao"]').checked;
            const palestrantes = Array.from(atividadeDiv.querySelector('select[name="palestrantes"]').selectedOptions).map(option => option.value);
            const outrosParticipantes = Array.from(atividadeDiv.querySelector('select[name="outrosParticipantes"]').selectedOptions).map(option => option.value);
            atividades.push({ descricao, salaLink, dataHora, teveRefeicao, palestrantes, outrosParticipantes });
        });

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text(`Evento: ${nomeEvento}`, 10, 10);
        doc.text(`Data: ${dataEvento}`, 10, 20);

        let currentY = 30;
        doc.text("Participantes:", 10, currentY);
        currentY += 10;
        participantes.forEach(participante => {
            doc.text(`- ${participante.nome} (${participante.tipo})`, 10, currentY);
            currentY += 10;
        });

        currentY += 10;
        doc.text("Agenda:", 10, currentY);
        currentY += 10;
        atividades.forEach(atividade => {
            doc.text(`- ${atividade.descricao}`, 10, currentY);
            doc.text(`  - Sala/Link: ${atividade.salaLink}`, 10, currentY + 5);
            doc.text(`  - Data/Hora: ${atividade.dataHora}`, 10, currentY + 10);
            doc.text(`  - Refeição: ${atividade.teveRefeicao ? 'Sim' : 'Não'}`, 10, currentY + 15);
            doc.text(`   - Palestrantes: ${atividade.palestrantes.join(', ')}`, 10, currentY + 20);
            doc.text(`   - Outros Participantes: ${atividade.outrosParticipantes.join(', ')}`, 10, currentY + 25);
            currentY += 35;
        });

        doc.save('dados_combinados.pdf');
    });

    validateForm();
    restoreFormData();
    atualizarParticipantesDisponiveis();
});