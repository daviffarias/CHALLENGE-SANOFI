let todosOsParticipantes = new Map();
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('eventForm');
    //const downloadButton = document.getElementById('downloadPDF');
    const participantesSelects = [];

    function atualizarParticipantesDisponiveis() {
        participantesSelects.forEach(select => {
            const currentSelected = new Set(select.getValue(true));
            
            // Atualize para acessar corretamente o nome e tipo do participante
            const updatedChoices = Array.from(todosOsParticipantes.entries()).map(([id, participante]) => ({
                value: id,
                label: participante.nome, // Acessa o nome do participante dentro do objeto
                selected: currentSelected.has(id),
            }));
            
            select.clearStore();
            select.setChoices(updatedChoices, 'value', 'label', false);
    
            currentSelected.forEach(id => {
                if (todosOsParticipantes.has(id)) {
                    select.setChoiceByValue(id);
                }
            });
        });
    }
    

    function atualizarParticipantesNoFormulario(selectModificado, selectOposto, participantesEspecificos) {
        const valorSelecionado = selectModificado.getValue(true);
    
        // Remover participantes selecionados da lista oposta
        valorSelecionado.forEach(valor => {
            selectOposto.removeActiveItemsByValue(valor);
        });
    
        // Atualizar apenas os participantes da lista específica da atividade atual
        const updatedChoices = Array.from(todosOsParticipantes.entries()).map(([id, nome]) => ({
            value: id,
            label: nome,
            selected: participantesEspecificos.includes(id)
        }));
    
        selectModificado.clearStore();
        selectModificado.setChoices(updatedChoices, 'value', 'label', false);
    
        valorSelecionado.forEach(id => {
            if (todosOsParticipantes.has(id)) {
                selectModificado.setChoiceByValue(id);
            }
        });
    }
    

    function adicionarParticipante(id, nome, tipo = 'Expert externo') {
        if (!todosOsParticipantes.has(id)) {
            todosOsParticipantes.set(id, { nome, tipo }); // Agora salva nome e tipo
            atualizarParticipantesDisponiveis();
            salvarParticipantesNoSessionStorage();
        } else {
            // Atualizar o nome ou tipo se o participante já existir
            todosOsParticipantes.set(id, { nome, tipo });
            atualizarParticipantesDisponiveis();
            salvarParticipantesNoSessionStorage();
        }
    }
    
    function salvarParticipantesNoSessionStorage() {
        const participantesArray = Array.from(todosOsParticipantes, ([id, participante]) => ({ 
            id, 
            nome: participante.nome, 
            tipo: participante.tipo // Adiciona o tipo para salvar no sessionStorage
        }));
        sessionStorage.setItem('participantes', JSON.stringify(participantesArray));
    }
     
    // Função para remover um participante
    function removerParticipante(id) {
        const nome = todosOsParticipantes.get(id);
        const confirmar = confirm(`Você tem certeza de que deseja excluir todos os dados do participante "${nome}"? Esta ação não pode ser desfeita.`);
    
        if (confirmar) {
            if (todosOsParticipantes.has(id)) {
                todosOsParticipantes.delete(id);
                console.log(`Participante "${nome}" removido.`);
            } else {
                console.log(`Participante com ID "${id}" não encontrado na lista.`);
            }
    
            salvarParticipantesNoSessionStorage();
    
            document.querySelectorAll('.participante').forEach(participanteDiv => {
                const participanteId = participanteDiv.querySelector('input[name="participanteId"]').value;
                if (participanteId === id) {
                    participanteDiv.remove();
                }
            });
    
            atualizarParticipantesDisponiveis();
    
            // Remover o formulário de pagamento associado ao participante
            sessionStorage.removeItem(`paymentFormData-${id}`);
        }
    }

    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function criarParticipanteDiv(nome = '', tipo = 'Expert externo', id = null) {
        const participanteDiv = document.createElement('div');
        participanteDiv.classList.add('participante');
        
        // Gerar um novo ID se não for fornecido
        const participanteId = id || generateUniqueId();
        
        participanteDiv.innerHTML = `
            <input type="hidden" name="participanteId" value="${participanteId}">
            <label for="nomeParticipante">Nome:</label>
            <input type="text" name="nomeParticipante" value="${nome}" autocomplete='off'>
            <label for="tipoParticipante">Tipo:</label>
            <select name="tipoParticipante">
                <option value="Expert externo" ${tipo === 'Expert externo' ? 'selected' : ''}>Expert Externo</option>
                <option value="Staff Sanofi" ${tipo === 'Staff Sanofi' ? 'selected' : ''}>Staff Sanofi</option>
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
            abrirFormularioBtn.disabled = !(nome && tipo === 'Expert externo');
        }
    
        // Atualizar o nome no sessionStorage quando o valor for alterado
        nomeInput.addEventListener('input', () => {
            const novoNome = nomeInput.value.trim();
            if (novoNome) {
                // Atualiza o nome do participante no sessionStorage
                const participantes = JSON.parse(sessionStorage.getItem('participantes')) || [];
                const participanteIndex = participantes.findIndex(p => p.id === participanteId);
    
                if (participanteIndex !== -1) {
                    participantes[participanteIndex].nome = novoNome;
                    sessionStorage.setItem('participantes', JSON.stringify(participantes));
                }
            }
    
            verificarCondicoes();
        });
    
        // Atualizar o tipo de participante no sessionStorage quando o valor for alterado
        tipoSelect.addEventListener('change', () => {
            const novoTipo = tipoSelect.value;
            
            // Atualizar o tipo do participante no sessionStorage
            const participantes = JSON.parse(sessionStorage.getItem('participantes')) || [];
            const participanteIndex = participantes.findIndex(p => p.id === participanteId);
    
            if (participanteIndex !== -1) {
                participantes[participanteIndex].tipo = novoTipo;
                sessionStorage.setItem('participantes', JSON.stringify(participantes));
            }
    
            verificarCondicoes();
        });
    
        // Outros eventos e verificações
        nomeInput.addEventListener('blur', () => {
            const nome = nomeInput.value.trim();
            const tipo = tipoSelect.value;
            if (nome) {
                adicionarParticipante(participanteId, nome, tipo);
            }
            verificarCondicoes();
        });
    
        abrirFormularioBtn.addEventListener('click', () => {
            const nome = nomeInput.value.trim();
            if (nome) {
                window.location.href = `payment-form.html?expertName=${encodeURIComponent(nome)}&participantId=${participanteId}`;
            }
        });
    
        participanteDiv.querySelector('.removerParticipante').addEventListener('click', () => {
            removerParticipante(participanteId);
        });
    
        verificarCondicoes();
        document.getElementById('listaParticipantes').appendChild(participanteDiv);
    }
    
    // Carrega os participantes armazenados ao carregar a página
    const participantesArmazenados = JSON.parse(sessionStorage.getItem('participantes')) || [];
    participantesArmazenados.forEach(({ id, nome, tipo }) => {
        todosOsParticipantes.set(id, { nome, tipo }); // Agora armazena nome e tipo
        criarParticipanteDiv(nome, tipo, id);
    });    

    document.getElementById('adicionarParticipante').addEventListener('click', () => {
        criarParticipanteDiv();
    });

    function adicionarAtividade(id = '', descricao = '', salaLink = '', timeEnd = '', timeInit = '', data = '', teveRefeicao = false, palestrantes = [], outrosParticipantes = []) {
        const atividadeDiv = document.createElement('div');
        atividadeDiv.classList.add('atividade');
    
        // Usar ID passado, ou gerar um novo
        const atividadeId = id || generateUniqueId();
    
        atividadeDiv.innerHTML = `
            <label for="descricaoAtividade">Descrição da Atividade:</label>
            <input type="text" name="descricaoAtividade" value="${descricao}">
            <label for="salaLink">Sala ou Link:</label>
            <input type="text" name="salaLink" value="${salaLink}">
            <label for="data">Data:</label>
            <input type="date" name="data" value="${data}">
            <label for="timeInit">Horário de início:</label>
            <input type="time" name="timeInit" value="${timeInit}">
            <label for="timeEnd">Horário de término:</label>
            <input type="time" name="timeEnd" value="${timeEnd}">
            <label for="teveRefeicao">Teve Refeição?</label>
            <input type="checkbox" name="teveRefeicao" ${teveRefeicao ? 'checked' : ''}>
            <label for="palestrantes">Palestrantes (Computam Horas):</label>
            <select name="palestrantes" multiple></select>
            <label for="outrosParticipantes">Participação ativa requerida:</label>
            <select name="outrosParticipantes" multiple></select>
            <button type="button" class="removerAtividade" data-id="${atividadeId}">Remover Atividade</button>
        `;
    
        const palestrantesSelect = atividadeDiv.querySelector('select[name="palestrantes"]');
        const outrosParticipantesSelect = atividadeDiv.querySelector('select[name="outrosParticipantes"]');
    
        const choicesPalestrantes = new Choices(palestrantesSelect, { removeItemButton: true, allowHTML: true });
        const choicesOutrosParticipantes = new Choices(outrosParticipantesSelect, { removeItemButton: true, allowHTML: true });
    
        participantesSelects.push(choicesPalestrantes, choicesOutrosParticipantes);
    
        // Atualizar os selects com os participantes e selecionar os já escolhidos
        setTimeout(() => {
            atualizarParticipantesDisponiveis();
    
            palestrantes.forEach(id => choicesPalestrantes.setChoiceByValue(id));
            outrosParticipantes.forEach(id => choicesOutrosParticipantes.setChoiceByValue(id));
    
            palestrantesSelect.addEventListener('change', () => {
                atualizarParticipantesNoFormulario(choicesPalestrantes, choicesOutrosParticipantes);
            });
    
            outrosParticipantesSelect.addEventListener('change', () => {
                atualizarParticipantesNoFormulario(choicesOutrosParticipantes, choicesPalestrantes);
            });
        }, 0);
    
        // Adiciona o evento de remoção de atividade
        atividadeDiv.querySelector('.removerAtividade').addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            removerAtividade(id);
            atividadeDiv.remove();
        });
    
        document.getElementById('listaAtividades').appendChild(atividadeDiv);
    }
    
    // Função para remover uma atividade com base no ID
    function removerAtividade(id) {
        // Recuperar o formData do sessionStorage
        const formData = JSON.parse(sessionStorage.getItem('formData'));
    
        // Verificar se o formData e o array de atividades existem
        if (formData && formData.atividades) {
            // Encontrar o índice da atividade pelo ID
            const atividadeIndex = formData.atividades.findIndex(atividade => atividade.id === id);
    
            if (atividadeIndex !== -1) {
                // Remover a atividade do array de atividades
                formData.atividades.splice(atividadeIndex, 1);
    
                // Atualizar o formData no sessionStorage
                sessionStorage.setItem('formData', JSON.stringify(formData));
    
                console.log('Atividade removida com sucesso!');
            } else {
                console.error('Atividade não encontrada.');
            }
        } else {
            console.error('Não foi possível remover a atividade: dados não encontrados.');
        }
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

    function saveData() {
        const atividades = [];
        document.querySelectorAll('.atividade').forEach(atividadeDiv => {
            // Coletar o ID da atividade a partir do botão "Remover Atividade"
            const id = atividadeDiv.querySelector('.removerAtividade').getAttribute('data-id');
            const descricao = atividadeDiv.querySelector('input[name="descricaoAtividade"]').value;
            const salaLink = atividadeDiv.querySelector('input[name="salaLink"]').value;
            const data = atividadeDiv.querySelector('input[name="data"]').value;
            const timeInit = atividadeDiv.querySelector('input[name="timeInit"]').value;
            const timeEnd = atividadeDiv.querySelector('input[name="timeEnd"]').value;
            const teveRefeicao = atividadeDiv.querySelector('input[name="teveRefeicao"]').checked;
            
            // Coletar palestrantes e outros participantes
            const palestrantes = Array.from(atividadeDiv.querySelector('select[name="palestrantes"]').selectedOptions).map(option => option.value);
            const outrosParticipantes = Array.from(atividadeDiv.querySelector('select[name="outrosParticipantes"]').selectedOptions).map(option => option.value);
            
            atividades.push({id, descricao, salaLink, data, timeInit, timeEnd, teveRefeicao, palestrantes, outrosParticipantes});
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
            atividades
        };
    
        sessionStorage.setItem('formData', JSON.stringify(formData));
    }
    

    function restoreData() {
        const savedData = JSON.parse(sessionStorage.getItem('formData'));
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
                    adicionarAtividade(
                        atividade.id,
                        atividade.descricao, 
                        atividade.salaLink, 
                        atividade.timeEnd, 
                        atividade.timeInit, 
                        atividade.data, 
                        atividade.teveRefeicao, 
                        atividade.palestrantes, 
                        atividade.outrosParticipantes
                    );
                });                
            }
        }
    }

    // Função para limpar os dados do formulário e do sessionStorage
    function resetForm() {
        if (confirm('Você tem certeza de que deseja resetar o formulário?')) {
            // Limpar dados do formulário
            document.getElementById('eventForm').reset();

            // Limpar atividades
            document.getElementById('listaAtividades').innerHTML = '';

            // Limpar participantes
            document.getElementById('listaParticipantes').innerHTML = '';

            // Remover dados do sessionStorage
            sessionStorage.removeItem('formData');

            // Remover dados dos participantes
            sessionStorage.removeItem('participantes');
        }
    }

    // Salvar os dados sempre que houver uma mudança no formulário
    document.getElementById('eventForm').addEventListener('change', saveData);

    // Restaurar os dados ao carregar a página
    window.onload = restoreData;

    // Adicionar funcionalidade ao botão de reset
    document.getElementById('resetForm').addEventListener('click', resetForm);
});

// Função para validar os campos do formulário
function validateFormFields() {
    let isValid = true;

    // Limpa os erros anteriores
    document.querySelectorAll('.input-error').forEach(element => {
        element.classList.remove('input-error');
    });
    document.querySelectorAll('.error-message').forEach(element => {
        element.remove();
    });

    // Validação para campos do formulário principal
    const requiredFields = [
        'tipoEvento', 'nomeEvento', 'dataEvento', 'localEvento',
        'nomeSolicitante', 'unidade', 'racionalEvento'
    ];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            isValid = false;
            field.classList.add('input-error');
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = `Campo ${fieldId} é obrigatório.`;
            field.parentNode.appendChild(errorMessage);
        }
    });

    // Validação para atividades
    document.querySelectorAll('.atividade').forEach(atividadeDiv => {
        const descricao = atividadeDiv.querySelector('input[name="descricaoAtividade"]');
        const salaLink = atividadeDiv.querySelector('input[name="salaLink"]');
        const data = atividadeDiv.querySelector('input[name="data"]');
        const timeInit = atividadeDiv.querySelector('input[name="timeInit"]');
        const timeEnd = atividadeDiv.querySelector('input[name="timeEnd"]');

        let atividadeValida = true;

        [descricao, salaLink, data, timeInit, timeEnd].forEach(field => {
            if (field && !field.value.trim()) {
                atividadeValida = false;
                field.classList.add('input-error');
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = `Campo ${field.name} é obrigatório.`;
                field.parentNode.appendChild(errorMessage);
            }
        });

        if (!atividadeValida) {
            isValid = false;
        }
    });

    return isValid;
}