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
                width: inputElement.outerWidth()
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
                        suggestionsElement.empty();
                        var suggestions = JSON.parse(data);
                        // Exibir no máximo 5 sugestões
                        suggestions.slice(0, 5).forEach(function (item) {
                            suggestionsElement.append('<div>' + item + '</div>');
                        });

                        positionSuggestions();

                        suggestionsElement.find('div').on('click', function () {
                            inputElement.val($(this).text());
                            suggestionsElement.empty();
                        });
                    }
                });
            } else {
                suggestionsElement.empty();
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
                if (currentFocus > -1 && suggestions.length > 0) {
                    suggestions.eq(currentFocus).click();
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

        $(document).on('click', function (e) {
            if (!inputElement.is(e.target) && !suggestionsElement.is(e.target) && suggestionsElement.has(e.target).length === 0) {
                suggestionsElement.empty();
            }
        });
    }

    setupAutocomplete('nomeEvento', 'nomeEventoSuggestions', 'autocomplete_nomeEvento');
    setupAutocomplete('localEvento', 'localEventoSuggestions', 'autocomplete_localEvento');
    setupAutocomplete('dataEvento', 'dataEventoSuggestions', 'autocomplete_dataEvento');
    setupAutocomplete('nomeSolicitante', 'nomeSolicitanteSuggestions', 'autocomplete_nomeSolicitante');
    setupAutocomplete('unidade', 'unidadeSuggestions', 'autocomplete_unidade');

    $('#eventForm').on('submit', function (e) {
        e.preventDefault();

        if (!validateFormFields()) {
            alert('Por favor, preencha todos os campos obrigatórios antes de gerar o PDF.');
            return; // Interrompe a execução se a validação falhar
        }


        var formData = $(this).serialize();

        $.ajax({
            url: 'autocomplete.php',
            method: 'POST',
            data: formData + '&action=submit',
            success: function (response) {
                alert('Formulário enviado com sucesso!');
                $('#eventForm')[0].reset();
                $('#suggestions').empty();
                $('#emailSuggestions').empty();
            }
        });
    });
});
