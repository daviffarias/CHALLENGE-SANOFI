$(document).ready(function () {
    let currentFocus = -1;

    function setupAutocomplete(inputId, suggestionsId, action) {
        const inputElement = $('#' + inputId);
        const suggestionsElement = $('#' + suggestionsId);

        function positionSuggestions() {
            const offset = inputElement.offset();
            const height = inputElement.outerHeight();
            suggestionsElement.css({
                top: offset.top + height,
                left: offset.left,
                width: inputElement.outerWidth() // Ajusta a largura da caixa de sugestões
            });
        }

        inputElement.on('input', function () {
            var query = $(this).val();
            if (query.length > 0) {
                $.ajax({
                    url: 'autocomplete.php',
                    method: 'POST',
                    data: { action: action, query: query },
                    success: function (data) {
                        suggestionsElement.empty(); // Limpa as sugestões anteriores
                        var suggestions = JSON.parse(data);
                        suggestions.forEach(function (item) {
                            suggestionsElement.append('<div>' + item + '</div>');
                        });

                        // Posicionar a caixa de sugestões
                        positionSuggestions();

                        // Ao clicar em uma sugestão, preenche o input
                        suggestionsElement.find('div').on('click', function () {
                            inputElement.val($(this).text());
                            suggestionsElement.empty(); // Limpa as sugestões após clicar
                        });
                    }
                });
            } else {
                suggestionsElement.empty(); // Limpa se não houver texto
            }
        });

        inputElement.on('keydown', function (e) {
            let suggestions = suggestionsElement.find('div');
            if (e.key === 'ArrowDown') {
                currentFocus++;
                addActive(suggestions);
            } else if (e.key === 'ArrowUp') {
                currentFocus--;
                addActive(suggestions);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (currentFocus > -1) {
                    if (suggestions.length > 0) {
                        suggestions.eq(currentFocus).click();
                    }
                }
            }
        });

        function addActive(suggestions) {
            if (!suggestions.length) return;
            removeActive(suggestions);
            if (currentFocus >= suggestions.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = suggestions.length - 1;
            suggestions.eq(currentFocus).addClass('active');
        }

        function removeActive(suggestions) {
            suggestions.removeClass('active');
        }
    }

    // Configura o autocomplete para cada campo
    setupAutocomplete('nomeEvento', 'nomeEventoSuggestions', 'autocomplete_nomeEvento'); // inputId, suggestionsId, action

    // Evento para o envio do formulário
    $('#eventForm').on('submit', function (e) {
        e.preventDefault(); // Evita o envio normal do formulário

        var formData = $(this).serialize(); // Pega todos os dados do formulário

        $.ajax({
            url: 'autocomplete.php',
            method: 'POST',
            data: formData + '&action=submit',
            success: function (response) {
                alert('Formulário enviado com sucesso!');
                // Limpar todos os inputs
                $('#myForm')[0].reset();
                $('#suggestions').empty();
                $('#emailSuggestions').empty();
            }
        });
    });
});
