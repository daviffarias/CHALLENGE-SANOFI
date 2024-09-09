<?php
$conn = new PDO('sqlite:database.db');

if (isset($_POST['action'])) {
    $query = $_POST['query'];
    
    if ($_POST['action'] == 'autocomplete_nomeEvento') {
        $stmt = $conn->prepare("SELECT DISTINCT nome FROM sugestoes WHERE nome LIKE :query");
        $stmt->bindValue(':query', $query . '%');
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $suggestions = [];
        foreach ($results as $row) {
            $suggestions[] = $row['nome'];
        }
        echo json_encode($suggestions);
    
    } elseif ($_POST['action'] == 'autocomplete_email') {
        $stmt = $conn->prepare("SELECT DISTINCT email FROM sugestoes WHERE email LIKE :query");
        $stmt->bindValue(':query', $query . '%');
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $suggestions = [];
        foreach ($results as $row) {
            $suggestions[] = $row['email'];
        }
        echo json_encode($suggestions);
    
    } elseif ($_POST['action'] == 'submit') {
        $nome = $_POST['nomeEvento'];
        // $email = $_POST['emailInput'];

        $stmt = $conn->prepare("INSERT INTO sugestoes (nome) VALUES (:nome)");
        $stmt->bindValue(':nome', $nome);
        // $stmt->bindValue(':email', $email);
        $stmt->execute();

        echo "Formulário enviado e salvo com sucesso!";
    }
}
?>
