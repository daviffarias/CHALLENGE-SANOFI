let todosOsParticipantes = new Set();
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('eventForm');
    const downloadButton = document.getElementById('downloadPDF');
    const participantesSelects = [];

    function atualizarParticipantesDisponiveis() {
        const participantes = new Set();
        document.querySelectorAll('.participante').forEach(participanteDiv => {
            const nome = participanteDiv.querySelector('input[name="nomeParticipante"]').value.trim();
            if (nome) {
                participantes.add(nome);
            }
        });

        // Atualize a variável global todosOsParticipantes
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

    // Função para remover um participante
    function removerParticipante(nome) {
        const confirmar = confirm(`Você tem certeza de que deseja excluir todos os dados do participante "${nome}"? Esta ação não pode ser desfeita.`);

        if (confirmar) {

            // Verificar se o nome está no Set antes de tentar remover
            if (todosOsParticipantes.has(nome)) {
                todosOsParticipantes.delete(nome);
                console.log(`Participante "${nome}" removido.`);
            } else {
                console.log(`Participante "${nome}" não encontrado na lista.`);
            }

            // Atualizar a lista de participantes no localStorage
            localStorage.setItem('participantes', JSON.stringify([...todosOsParticipantes]));

            // Atualizar a lista de participantes na página
            document.querySelectorAll('.participante').forEach(participanteDiv => {
                const nomeParticipante = participanteDiv.querySelector('input[name="nomeParticipante"]').value.trim();
                if (nomeParticipante === nome) {
                    participanteDiv.remove();
                }
            });

            // Atualizar select boxes
            participantesSelects.forEach(select => {
                select.removeActiveItemsByValue(nome);
            });

            atualizarParticipantesDisponiveis();

            // Verificar após a remoção
            console.log('Participantes após a remoção:', [...todosOsParticipantes]);

            // Verificar localStorage
            console.log('LocalStorage participantes:', JSON.parse(localStorage.getItem('participantes')));

            // Remover o formulário de pagamento associado ao participante
            localStorage.removeItem(`paymentFormData-${nome}`);
        }
    }


    // Função para criar um div de participante
    function criarParticipanteDiv(nome = '', tipo = 'expert') {
        const participanteDiv = document.createElement('div');
        participanteDiv.classList.add('participante');

        participanteDiv.innerHTML = `
        <label for="nomeParticipante">Nome:</label>
        <input type="text" name="nomeParticipante" value="${nome}" autocomplete='off'>
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
                window.location.href = `payment-form.html?expertName=${encodeURIComponent(nome)}`;
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

    document.getElementById('adicionarParticipante').addEventListener('click', () => {
        criarParticipanteDiv();
    });

    function adicionarAtividade(descricao = '', salaLink = '', dataHora = '', teveRefeicao = false) {
        const atividadeDiv = document.createElement('div');
        atividadeDiv.classList.add('atividade');
        atividadeDiv.innerHTML = `
            <label for="descricaoAtividade">Descrição da Atividade:</label>
            <input type="text" name="descricaoAtividade" value="${descricao}">
            <label for="salaLink">Sala ou Link:</label>
            <input type="text" name="salaLink" value="${salaLink}">
            <label for="dataHoraAtividade">Data e Horário:</label>
            <input type="datetime-local" name="dataHoraAtividade" value="${dataHora}">
            <label for="teveRefeicao">Teve Refeição?</label>
            <input type="checkbox" name="teveRefeicao" ${teveRefeicao ? 'checked' : ''}>
            <label for="palestrantes">Palestrantes (Computam Horas):</label>
            <select name="palestrantes" multiple></select>
            <label for="outrosParticipantes">Participação ativa requerida:</label>
            <select name="outrosParticipantes" multiple></select>
            <button type="button" class="removerAtividade">Remover Atividade</button>
        `;

        const palestrantesSelect = atividadeDiv.querySelector('select[name="palestrantes"]');
        const outrosParticipantesSelect = atividadeDiv.querySelector('select[name="outrosParticipantes"]');

        const choicesPalestrantes = new Choices(palestrantesSelect, { removeItemButton: true, allowHTML: true });
        const choicesOutrosParticipantes = new Choices(outrosParticipantesSelect, { removeItemButton: true, allowHTML: true });

        participantesSelects.push(choicesPalestrantes, choicesOutrosParticipantes);

        setTimeout(() => {
            atualizarParticipantesDisponiveis();

            palestrantesSelect.addEventListener('change', () => {
                atualizarParticipantesNoFormulario(choicesPalestrantes, choicesOutrosParticipantes);
            });

            outrosParticipantesSelect.addEventListener('change', () => {
                atualizarParticipantesNoFormulario(choicesOutrosParticipantes, choicesPalestrantes);
            });
        }, 0);

        atividadeDiv.querySelector('.removerAtividade').addEventListener('click', () => {
            participantesSelects.splice(participantesSelects.indexOf(choicesPalestrantes), 1);
            participantesSelects.splice(participantesSelects.indexOf(choicesOutrosParticipantes), 1);
            atividadeDiv.remove();
            atualizarParticipantesDisponiveis();
        });

        document.getElementById('listaAtividades').appendChild(atividadeDiv);
    }

    function atualizarParticipantesNoFormulario(selectModificado, selectOposto) {
        const valorSelecionado = selectModificado.getValue(true);

        // Remover participantes selecionados da lista oposta
        valorSelecionado.forEach(valor => {
            selectOposto.removeActiveItemsByValue(valor);
        });

        // Atualizar a lista de participantes disponíveis
        atualizarParticipantesDisponiveis();
    }


    document.getElementById('adicionarAtividade').addEventListener('click', () => {
        adicionarAtividade();  // Apenas chama a função para adicionar uma nova atividade
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
        const { PDFDocument, rgb, StandardFonts } = PDFLib;

        // Coletar dados do formulário
        const tipoEvento = document.getElementById('tipoEvento').value || '';
        const nomeEvento = document.getElementById('nomeEvento').value || '';
        const localEvento = document.getElementById('localEvento').value || '';
        const dataEvento = document.getElementById('dataEvento').value || '';
        const nomeSolicitante = document.getElementById('nomeSolicitante').value || '';
        const unidade = document.getElementById('unidade').value || '';
        const racionalEvento = document.getElementById('racionalEvento').value || '';
        const comentariosObservacoes = document.getElementById('comentariosObservacoes').value || '';

        const participantes = Array.from(document.querySelectorAll('#listaParticipantes .participante')).map(participante => {
            const nomeInput = participante.querySelector('input[name="nomeParticipante"]');
            const tipoSelect = participante.querySelector('select[name="tipoParticipante"]');
            return {
                nome: nomeInput ? nomeInput.value.trim() : '',
                tipo: tipoSelect ? tipoSelect.value : ''
            };
        });

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

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let yOffset = height - 50;

        // Títulos principais com fonte maior
        page.setFont(fontBold);
        page.setFontSize(18);
        page.drawText('Informações do Evento', { x: 50, y: yOffset, color: rgb(0.2, 0.2, 0.7) });
        yOffset -= 30;

        page.setFontSize(12);
        page.setFont(font);

        // Estilização das informações com espaçamento
        const addText = (label, value, x, y) => {
            page.drawText(`${label}: ${value}`, { x, y, size: 12 });
        };

        addText('Tipo de Evento', tipoEvento, 50, yOffset);
        yOffset -= 20;
        addText('Nome do Evento', nomeEvento, 50, yOffset);
        yOffset -= 20;
        addText('Local do Evento', localEvento, 50, yOffset);
        yOffset -= 20;
        addText('Data do Evento', dataEvento, 50, yOffset);
        yOffset -= 20;
        addText('Nome do Solicitante', nomeSolicitante, 50, yOffset);
        yOffset -= 20;
        addText('Unidade', unidade, 50, yOffset);
        yOffset -= 20;
        page.setFont(fontBold);
        page.drawText('Racional do Evento', { x: 50, y: yOffset, size: 14, color: rgb(0.2, 0.2, 0.7) });
        yOffset -= 20;
        page.setFont(font);
        page.drawText(racionalEvento, { x: 50, y: yOffset, size: 12, maxWidth: 500 });
        yOffset -= 40;

        page.setFont(fontBold);
        page.drawText('Comentários ou Observações', { x: 50, y: yOffset, size: 14, color: rgb(0.2, 0.2, 0.7) });
        yOffset -= 20;
        page.setFont(font);
        page.drawText(comentariosObservacoes, { x: 50, y: yOffset, size: 12, maxWidth: 500 });
        yOffset -= 40;

        // Seção de participantes com borda e espaçamento
        page.setFont(fontBold);
        page.drawText('Participantes', { x: 50, y: yOffset, size: 14, color: rgb(0.2, 0.2, 0.7) });
        yOffset -= 20;

        participantes.forEach((participante, index) => {
            page.setFont(font);
            page.drawText(`Nome: ${participante.nome} - Tipo: ${participante.tipo}`, { x: 60, y: yOffset, size: 12 });
            yOffset -= 20;
        });

        // Seção da agenda com borda e formatação estilizada
        yOffset -= 20;
        page.setFont(fontBold);
        page.drawText('Agenda', { x: 50, y: yOffset, size: 14, color: rgb(0.2, 0.2, 0.7) });
        yOffset -= 20;

        atividades.forEach((atividade, index) => {
            page.setFont(font);
            page.drawText(`Descrição: ${atividade.descricao}`, { x: 60, y: yOffset, size: 12 });
            yOffset -= 20;
            page.drawText(`Sala/Link: ${atividade.salaLink}`, { x: 60, y: yOffset, size: 12 });
            yOffset -= 20;
            page.drawText(`Data e Hora: ${atividade.dataHora}`, { x: 60, y: yOffset, size: 12 });
            yOffset -= 20;
            page.drawText(`Teve Refeição: ${atividade.teveRefeicao ? 'Sim' : 'Não'}`, { x: 60, y: yOffset, size: 12 });
            yOffset -= 20;
            page.drawText(`Palestrantes: ${atividade.palestrantes.join(', ')}`, { x: 60, y: yOffset, size: 12 });
            yOffset -= 20;
            page.drawText(`Outros Participantes: ${atividade.outrosParticipantes.join(', ')}`, { x: 60, y: yOffset, size: 12 });
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



    function saveData() {

        const atividades = [];
        document.querySelectorAll('.atividade').forEach(atividadeDiv => {
            const descricao = atividadeDiv.querySelector('input[name="descricaoAtividade"]').value;
            const salaLink = atividadeDiv.querySelector('input[name="salaLink"]').value;
            const dataHora = atividadeDiv.querySelector('input[name="dataHoraAtividade"]').value;
            const teveRefeicao = atividadeDiv.querySelector('input[name="teveRefeicao"]').checked;
            atividades.push({ descricao, salaLink, dataHora, teveRefeicao });
        });

        const formData = {
            tipoEvento: document.getElementById('tipoEvento').value,
            nomeEvento: document.getElementById('nomeEvento').value,
            dataEvento: document.getElementById('dataEvento').value,
            localEvento: document.getElementById('localEvento').value,
            nomeSolicitante: document.getElementById('nomeSolicitante').value,
            unidade: document.getElementById('unidade').value,
            racionalEvento: document.getElementById('racionalEvento').value,
            comentariosObservacoes: document.getElementById('comentariosObservacoes').value,
            participantes,
            atividades
        };

        localStorage.setItem('formData', JSON.stringify(formData));
    }

    function restoreData() {
        const savedData = JSON.parse(localStorage.getItem('formData'));
        if (savedData) {
            document.getElementById('tipoEvento').value = savedData.tipoEvento;
            document.getElementById('nomeEvento').value = savedData.nomeEvento;
            document.getElementById('dataEvento').value = savedData.dataEvento;
            document.getElementById('localEvento').value = savedData.localEvento;
            document.getElementById('nomeSolicitante').value = savedData.nomeSolicitante;
            document.getElementById('unidade').value = savedData.unidade;
            document.getElementById('racionalEvento').value = savedData.racionalEvento;
            document.getElementById('comentariosObservacoes').value = savedData.comentariosObservacoes;

            // Restaurar atividades
            if (savedData.atividades) {
                savedData.atividades.forEach(atividade => {
                    adicionarAtividade(atividade.descricao, atividade.salaLink, atividade.dataHora, atividade.teveRefeicao);
                });
            }
        }
    }


    // Função para limpar os dados do formulário e do localStorage
    function resetForm() {
        if (confirm('Você tem certeza de que deseja resetar o formulário?')) {
            // Limpar dados do formulário
            document.getElementById('eventForm').reset();

            // Limpar atividades
            document.getElementById('listaAtividades').innerHTML = '';

            // Limpar participantes
            document.getElementById('listaParticipantes').innerHTML = '';

            // Remover dados do localStorage
            localStorage.removeItem('formData');
        }
    }

    // Salvar os dados sempre que houver uma mudança no formulário
    document.getElementById('eventForm').addEventListener('change', saveData);

    // Restaurar os dados ao carregar a página
    window.onload = restoreData;

    // Adicionar funcionalidade ao botão de reset
    document.getElementById('resetForm').addEventListener('click', resetForm);
});