document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const expertName = urlParams.get('expertName');
    const eventDetails = JSON.parse(localStorage.getItem('eventDetails'));

    if (expertName && eventDetails) {
        document.getElementById('requestorName').value = eventDetails.nomeSolicitante;
        document.getElementById('sanofiEntity').value = eventDetails.unidade;
        document.getElementById('requestorCountry').value = eventDetails.requestorCountry || ''; // Adicione 'requestorCountry' ao salvar o formulário de evento
        document.getElementById('projectTitle').value = eventDetails.nomeEvento;
        document.getElementById('serviceLocation').value = eventDetails.localEvento;
        document.getElementById('serviceDate').value = eventDetails.dataEvento;

        const [lastName, firstName] = expertName.split(' ');
        document.getElementById('expertLastName').value = lastName || '';
        document.getElementById('expertFirstName').value = firstName || '';
    }

    document.getElementById('paymentForm').addEventListener('submit', (e) => {
        e.preventDefault();

        // Atualizar o localStorage com os dados de pagamento salvos
        const participantPaymentDetails = {
            expertName,
            serviceType: document.getElementById('serviceType').value,
            role: document.getElementById('role').value,
            expertLevel: document.getElementById('expertLevel').value,
            hourlyRateBRL: document.getElementById('hourlyRateBRL').value,
            serviceDuration: document.getElementById('serviceDuration').value,
            preparationTime: document.getElementById('preparationTime').value,
            additionalInfo: document.getElementById('additionalInfo').value
        };

        let payments = JSON.parse(localStorage.getItem('payments')) || {};
        payments[expertName] = participantPaymentDetails;
        localStorage.setItem('payments', JSON.stringify(payments));

        alert('Formulário de pagamento salvo com sucesso!');
        window.location.href = 'formulario_evento.html';
    });
});
