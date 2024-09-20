<?php
session_start();
try {
    $db = new PDO('sqlite:../database.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $username = $_POST['username'];
        $password = $_POST['password'];

        $stmt = $db->prepare('SELECT * FROM users WHERE username = :username');
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && $user['password'] === $password) {
            $_SESSION['loggedin'] = true;
            header('Location: ../painel_admin.php');
            exit;
        } else {
            $_SESSION['loggedin'] = false;
            header('Location: ../index.html?error=1');
        }
    }
} catch (PDOException $e) {
    echo "Erro: " . $e->getMessage();
}
?>
