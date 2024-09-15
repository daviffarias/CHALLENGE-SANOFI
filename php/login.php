<?php
// login.php
/*
// Configuração do banco de dados
$conn = new PDO('sqlite:database.db');

// Verificar se o formulário foi enviado
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Preparar e executar a consulta
    $stmt = $conn->prepare("SELECT * FROM usuarios WHERE username = :username");
    $stmt->bindValue(':username', $username);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verificar se o usuário existe e a senha está correta
    if ($user && password_verify($password, $user['password'])) {
        echo "Login bem-sucedido!";
        // Redirecionar ou iniciar sessão aqui
    } else {
        echo "Usuário ou senha inválidos.";
    }
}
    */
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../CSS/style.css">
    <link rel="stylesheet" href="../CSS/admin.css">
    <title>Login</title>
</head>
<body>

    <header>
        <div class="header-content">
            <img src="https://logodownload.org/wp-content/uploads/2018/09/sanofi-logo-1-1.png" alt="Sanofi Logo"
                class="logo">
            <h1>FusionTech</h1>
            <!-- Botões de Login e Cadastro de Evento adicionados ao cabeçalho -->
            <div class="header-buttons">
                <a href="formulario_evento.html" class="btn header-btn">Cadastro de Evento</a>
                <!-- <form id="formLogin" action="php/login.php" method="post"> -->
                <button type="submit" class="btn header-btn">Login</button>
               <!-- </form> -->
            </div>
        </div>
    </header>

    <section class="hero">
        <form class="login-form" method="POST" action="">
            <h3>Login</h3>
            <label for="username">Usuário:</label>
            <input type="text" id="username" name="username" placeholder="Usuário" required autocomplete='off'>
            <label for="password">Senha:</label>
            <input type="password" id="password" name="password" placeholder="Senha" required autocomplete='off'>
            <button type="submit" class="btn">Login</button>
        </form>
    </section>

    <footer>
        <p>&copy; 2024 FusionTech</p>
    </footer>
</body>
</html>
