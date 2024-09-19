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
    <title>Login</title>
    <script>
        async function loadVariables() {
            const response = await fetch('./php/get_variables.php');
            const data = await response.json();

            document.getElementById('var1-current').innerText = data.var1;
            document.getElementById('var2-current').innerText = data.var2;
        }

        async function updateVariable(variableName) {
            const newValue = document.getElementById(variableName + '-input').value;

            const response = await fetch('./php/update_variables.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variable: variableName, value: newValue })
            });

            if (response.ok) {
                alert('Valor atualizado com sucesso!');
                loadVariables(); // Recarrega as variáveis atualizadas
            } else {
                alert('Erro ao atualizar o valor.');
            }
        }

        window.onload = loadVariables;
    </script>
</head>

<body>

    <header>
        <div class="header-content">
            <img src="https://logodownload.org/wp-content/uploads/2018/09/sanofi-logo-1-1.png" alt="Sanofi Logo"
                class="logo">
            <h1>FusionTech</h1>
            <div class="header-buttons">
                <a href="formulario_evento.html" class="btn header-btn">Cadastro de Evento</a>
                <a href="./index.html" class="btn header-btn">Página inicial</a>
            </div>
        </div>
    </header>

    <h1>Painel Admin</h1>

    <div>
        <label>Variável 1:</label>
        <span id="var1-current"></span>
        <input type="text" id="var1-input" placeholder="Novo valor">
        <button onclick="updateVariable('var1')">Atualizar</button>
    </div>

    <div>
        <label>Variável 2:</label>
        <span id="var2-current"></span>
        <input type="text" id="var2-input" placeholder="Novo valor">
        <button onclick="updateVariable('var2')">Atualizar</button>
    </div>

    <footer>
        <p>&copy; 2024 FusionTech</p>
    </footer>
</body>
</html>
