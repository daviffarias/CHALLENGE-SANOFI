document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('eventForm');
    const downloadButton = document.getElementById('downloadPDF');
    const participantesSelects = [];
    let todosOsParticipantes = new Set();

    function validateForm() {
        const nomeEvento = document.getElementById('nomeEvento').value.trim();
        const dataEvento = document.getElementById('dataEvento').value.trim();
        downloadButton.disabled = !(nomeEvento && dataEvento);
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
            
            // Reseleciona apenas os participantes que estavam selecionados anteriormente
            currentSelected.forEach(nome => {
                if (todosOsParticipantes.has(nome)) {
                    select.setChoiceByValue(nome);
                }
            });
        });
    }

    function atualizarParticipantesNoFormulario(selectModificado) {
        const valorSelecionado = selectModificado.getValue(true);
        participantesSelects.forEach(select => {
            if (select !== selectModificado) {
                const choicesInstance = select;
                if (choicesInstance) {
                    // Remove os participantes selecionados na lista atual da outra lista
                    valorSelecionado.forEach(valor => {
                        choicesInstance.removeActiveItemsByValue(valor);
                    });
                }
            }
        });
    
        atualizarParticipantesDisponiveis();
    }

    function adicionarParticipante(nome) {
        if (!todosOsParticipantes.has(nome)) {
            todosOsParticipantes.add(nome);
            atualizarParticipantesDisponiveis();
        }
    }

    function removerParticipante(nome) {
        todosOsParticipantes.delete(nome);
        
        // Remover o participante de todas as listas de atividades
        participantesSelects.forEach(select => {
            const choicesInstance = select;
            if (choicesInstance) {
                choicesInstance.removeActiveItemsByValue(nome);
            }
        });
        
        atualizarParticipantesDisponiveis();
    }

    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', validateForm);
    });

    document.getElementById('adicionarParticipante').addEventListener('click', () => {
        const participanteDiv = document.createElement('div');
        participanteDiv.classList.add('participante');
        participanteDiv.innerHTML = `
            <label for="nomeParticipante">Nome:</label>
            <input type="text" name="nomeParticipante">
            <label for="tipoParticipante">Tipo:</label>
            <select name="tipoParticipante">
                <option value="expert">Expert</option>
                <option value="externo">Externo</option>
            </select>
            <button type="button" class="removerParticipante">Remover Participante</button>
        `;
        document.getElementById('listaParticipantes').appendChild(participanteDiv);

        const nomeInput = participanteDiv.querySelector('input[name="nomeParticipante"]');
        nomeInput.addEventListener('blur', () => {
            const nome = nomeInput.value.trim();
            if (nome) {
                adicionarParticipante(nome);
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

    document.getElementById('adicionarAtividade').addEventListener('click', () => {
        const atividadeDiv = document.createElement('div');
        atividadeDiv.classList.add('atividade');
        atividadeDiv.innerHTML = `
            <label for="descricaoAtividade">Descrição da Atividade:</label>
            <input type="text" name="descricaoAtividade">
            <label for="salaLink">Sala ou Link:</label>
            <input type="text" name="salaLink">
            <label for="dataHoraAtividade">Data e Horário:</label>
            <input type="datetime-local" name="dataHoraAtividade">
            <label for="teveRefeicao">Teve Refeição?</label>
            <input type="checkbox" name="teveRefeicao">
            <label for="palestrantes">Palestrantes (Computam Horas):</label>
            <select name="palestrantes" multiple></select>
            <label for="outrosParticipantes">Outros Participantes:</label>
            <select name="outrosParticipantes" multiple></select>
            <button type="button" class="removerAtividade">Remover Atividade</button>
        `;

        document.getElementById('listaAtividades').appendChild(atividadeDiv);

        const palestrantesSelect = atividadeDiv.querySelector('select[name="palestrantes"]');
        const outrosParticipantesSelect = atividadeDiv.querySelector('select[name="outrosParticipantes"]');

        const choicesPalestrantes = new Choices(palestrantesSelect, { removeItemButton: true, allowHTML: true });
        const choicesOutrosParticipantes = new Choices(outrosParticipantesSelect, { removeItemButton: true, allowHTML: true });

        participantesSelects.push(choicesPalestrantes, choicesOutrosParticipantes);

        setTimeout(() => {
            atualizarParticipantesDisponiveis();

            palestrantesSelect.addEventListener('change', () => {
                atualizarParticipantesNoFormulario(choicesPalestrantes);
            });

            outrosParticipantesSelect.addEventListener('change', () => {
                atualizarParticipantesNoFormulario(choicesOutrosParticipantes);
            });
        }, 0);

        atividadeDiv.querySelector('.removerAtividade').addEventListener('click', () => {
            participantesSelects.splice(participantesSelects.indexOf(choicesPalestrantes), 1);
            participantesSelects.splice(participantesSelects.indexOf(choicesOutrosParticipantes), 1);
            atividadeDiv.remove();
            atualizarParticipantesDisponiveis();
        });
    });

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
    atualizarParticipantesDisponiveis();
});
