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
            localStorage.setItem('participantes', JSON.stringify([...todosOsParticipantes]));
        }
    }

    function removerParticipante(nome) {
        todosOsParticipantes.delete(nome);

        participantesSelects.forEach(select => {
            const choicesInstance = select;
            if (choicesInstance) {
                choicesInstance.removeActiveItemsByValue(nome);
            }
        });

        atualizarParticipantesDisponiveis();
        localStorage.setItem('participantes', JSON.stringify([...todosOsParticipantes]));
    }

    function criarParticipanteDiv(nome = '', tipo = 'expert') {
        const participanteDiv = document.createElement('div');
        participanteDiv.classList.add('participante');
    
        participanteDiv.innerHTML = `
            <label for="nomeParticipante">Nome:</label>
            <input type="text" name="nomeParticipante" value="${nome}">
            <label for="tipoParticipante">Tipo:</label>
            <select name="tipoParticipante">
                <option value="expert" ${tipo === 'expert' ? 'selected' : ''}>Expert Externo</option>
                <option value="interno" ${tipo === 'interno' ? 'selected' : ''}>Staff Interno</option>
            </select>
            <button type="button" class="removerParticipante">Remover Participante</button>
            <button type="button" class="abrirFormulario" disabled>Abrir Formulário de Pagamento</button>
        `;
    
        const nomeInput = participanteDiv.querySelector('input[name="nomeParticipante"]');
        const tipoSelect = participanteDiv.querySelector('select[name="tipoParticipante"]');
        const abrirFormularioBtn = participanteDiv.querySelector('.abrirFormulario');
    
        // Função para atualizar o estado do botão
        function verificarCondicoes() {
            const nome = nomeInput.value.trim();
            const tipo = tipoSelect.value;
            abrirFormularioBtn.disabled = !(nome && tipo === 'expert');
        }
    
        // Configurar eventos
        nomeInput.addEventListener('blur', () => {
            const nome = nomeInput.value.trim();
            if (nome) {
                adicionarParticipante(nome);
            }
            verificarCondicoes();
        });
    
        tipoSelect.addEventListener('change', verificarCondicoes);
    
        abrirFormularioBtn.addEventListener('click', () => {
            const nome = nomeInput.value.trim();
            if (nome) {
                window.location.href = `payment-form.html?expertName=${encodeURIComponent(nome)}&expertType=${encodeURIComponent(tipoSelect.value)}`;
            }
        });
    
        participanteDiv.querySelector('.removerParticipante').addEventListener('click', () => {
            const nome = nomeInput.value.trim();
            if (nome) {
                removerParticipante(nome);
                participanteDiv.remove();
            }
        });
    
        verificarCondicoes();
        document.getElementById('listaParticipantes').appendChild(participanteDiv);
    }
    

    // Carrega os participantes armazenados ao carregar a página
    const participantesArmazenados = JSON.parse(localStorage.getItem('participantes')) || [];
    participantesArmazenados.forEach(nome => {
        criarParticipanteDiv(nome);
    });

    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', validateForm);
    });

    document.getElementById('adicionarParticipante').addEventListener('click', () => {
        criarParticipanteDiv();
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

    downloadButton.addEventListener('click', async () => {
        const nomeEvento = document.getElementById('nomeEvento').value.trim();
        const dataEvento = document.getElementById('dataEvento').value.trim();

        const participantes = [];
        document.querySelectorAll('.participante').forEach(participanteDiv => {
            const nome = participanteDiv.querySelector('input[name="nomeParticipante"]').value.trim();
            const tipo = participanteDiv.querySelector('select[name="tipoParticipante"]').value;
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

        await gerarPDF({ nomeEvento, dataEvento, participantes, atividades });
    });

    async function gerarPDF() {
        const { PDFDocument, rgb } = PDFLib;
    
        // Coletar dados do formulário
        const nomeEvento = document.getElementById('nomeEvento').value || '';
        const localEvento = document.getElementById('localEvento').value || '';
        const dataEvento = document.getElementById('dataEvento').value || '';
        const nomeSolicitante = document.getElementById('nomeSolicitante').value || '';
        const unidade = document.getElementById('unidade').value || '';
        const racionalEvento = document.getElementById('racionalEvento').value || '';
        const comentariosObservacoes = document.getElementById('comentariosObservacoes').value || '';
    
        // Verifique se há participantes
        const participantes = Array.from(document.querySelectorAll('#listaParticipantes .participante')).map(participante => {
            const nomeInput = participante.querySelector('input[name="nomeParticipante"]');
            const tipoSelect = participante.querySelector('select[name="tipoParticipante"]');
            return {
                nome: nomeInput ? nomeInput.value.trim() : '',
                tipo: tipoSelect ? tipoSelect.value : ''
            };
        });
    
        // Verifique se há atividades
        const atividades = Array.from(document.querySelectorAll('#listaAtividades .atividade')).map(atividade => {
            const descricaoInput = atividade.querySelector('input[name="descricaoAtividade"]');
            const salaLinkInput = atividade.querySelector('input[name="salaLink"]');
            const dataHoraInput = atividade.querySelector('input[name="dataHoraAtividade"]');
            const teveRefeicaoCheckbox = atividade.querySelector('input[name="teveRefeicao"]');
            const palestrantesSelect = atividade.querySelector('select[name="palestrantes"]');
            const outrosParticipantesSelect = atividade.querySelector('select[name="outrosParticipantes"]');
            
            return {
                descricao: descricaoInput ? descricaoInput.value.trim() : '',
                salaLink: salaLinkInput ? salaLinkInput.value.trim() : '',
                dataHora: dataHoraInput ? dataHoraInput.value.trim() : '',
                teveRefeicao: teveRefeicaoCheckbox ? teveRefeicaoCheckbox.checked : false,
                palestrantes: palestrantesSelect ? Array.from(palestrantesSelect.selectedOptions).map(option => option.value) : [],
                outrosParticipantes: outrosParticipantesSelect ? Array.from(outrosParticipantesSelect.selectedOptions).map(option => option.value) : []
            };
        });
    
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const { height } = page.getSize();
    
        let yOffset = height - 50;
    
        // Dados do Evento
        page.drawText(`Nome do Evento: ${nomeEvento}`, { x: 50, y: yOffset, size: 12 });
        yOffset -= 20;
        page.drawText(`Local do Evento: ${localEvento}`, { x: 50, y: yOffset, size: 12 });
        yOffset -= 20;
        page.drawText(`Data do Evento: ${dataEvento}`, { x: 50, y: yOffset, size: 12 });
        yOffset -= 20;
        page.drawText(`Nome do Solicitante: ${nomeSolicitante}`, { x: 50, y: yOffset, size: 12 });
        yOffset -= 20;
        page.drawText(`Unidade: ${unidade}`, { x: 50, y: yOffset, size: 12 });
        yOffset -= 20;
        page.drawText(`Racional do Evento: ${racionalEvento}`, { x: 50, y: yOffset, size: 12, maxWidth: 500 });
        yOffset -= 40;
        page.drawText(`Comentários ou Observações: ${comentariosObservacoes}`, { x: 50, y: yOffset, size: 12, maxWidth: 500 });
        yOffset -= 60;
    
        // Participantes
        page.drawText('Participantes:', { x: 50, y: yOffset, size: 12, color: rgb(0, 0, 1) });
        yOffset -= 20;
        participantes.forEach((participante, index) => {
            page.drawText(`Nome: ${participante.nome} - Tipo: ${participante.tipo}`, { x: 50, y: yOffset, size: 12 });
            yOffset -= 20;
        });
    
        // Agenda
        page.drawText('Agenda:', { x: 50, y: yOffset, size: 12, color: rgb(0, 0, 1) });
        yOffset -= 20;
        atividades.forEach((atividade, index) => {
            page.drawText(`Descrição: ${atividade.descricao}`, { x: 50, y: yOffset, size: 12 });
            yOffset -= 20;
            page.drawText(`Sala/Link: ${atividade.salaLink}`, { x: 50, y: yOffset, size: 12 });
            yOffset -= 20;
            page.drawText(`Data e Hora: ${atividade.dataHora}`, { x: 50, y: yOffset, size: 12 });
            yOffset -= 20;
            page.drawText(`Teve Refeição: ${atividade.teveRefeicao ? 'Sim' : 'Não'}`, { x: 50, y: yOffset, size: 12 });
            yOffset -= 20;
            page.drawText(`Palestrantes: ${atividade.palestrantes.join(', ')}`, { x: 50, y: yOffset, size: 12 });
            yOffset -= 20;
            page.drawText(`Outros Participantes: ${atividade.outrosParticipantes.join(', ')}`, { x: 50, y: yOffset, size: 12 });
            yOffset -= 40;
        });
    
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
    
        const link = document.createElement('a');
        link.href = url;
        link.download = 'evento.pdf';
        link.click();
        URL.revokeObjectURL(url);
    }
    
    
    
});
