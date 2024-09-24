<?php
session_start();
if ($_SESSION['loggedin'] == false) {
    header('Location: ../index.html');
    exit();
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../CSS/style.css">
    <link rel="stylesheet" href="../CSS/admin.css">
    <title>Painel Admin</title>
    <script>
        async function loadChairmanValue() {
            const response = await fetch('./php/get_variables.php');
            const data = await response.json();
            document.getElementById('chairman-current').innerText = data; // Supondo que 'chairman' seja o nome da variável
        }

        async function updateChairmanValue() {
            const newValue = document.getElementById('chairman-input').value;

            const response = await fetch('./php/update_variables.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variable: 'chairman', value: newValue })
            });

            if (response.ok) {
                alert('Valor atualizado com sucesso!');
                loadChairmanValue(); // Recarrega o valor atualizado
            } else {
                alert('Erro ao atualizar o valor.');
            }
        }

        window.onload = loadChairmanValue;
    </script>
</head>

<body>
    <header>
        <div class="header-content">
            <img src="https://logodownload.org/wp-content/uploads/2018/09/sanofi-logo-1-1.png" alt="Sanofi Logo" class="logo">
            <h1>FusionTech</h1>
            <div class="header-buttons">
                <a href="formulario_evento.html" class="btn header-btn">Cadastro de Evento</a>
                <a href="./index.html" class="btn header-btn">Página inicial</a>
            </div>
        </div>
    </header>

    <h1>Painel Admin</h1>

    <div style="margin-left:20px">
        <label>Taxa Chairman:</label>
        <span id="chairman-current"></span>
        <br>
        <input type="text" id="chairman-input" placeholder="Novo valor" style="max-width:200px">
        <br>
        <button onclick="updateChairmanValue()">Atualizar</button>
        <br><br>
    </div>

    <footer>
        <p>&copy; 2024 FusionTech</p>
    </footer>
</body>
</html>
