<?php
$conn = new PDO('sqlite:database.db');

if (isset($_POST['action'])) {
    $query = $_POST['query'];
    
    if ($_POST['action'] == 'autocomplete_nomeEvento') {
        $stmt = $conn->prepare("SELECT DISTINCT nomeEvento FROM eventos WHERE nomeEvento LIKE :query");
        $stmt->bindValue(':query', $query . '%');
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $suggestions = [];
        foreach ($results as $row) {
            $suggestions[] = $row['nomeEvento'];
        }
        echo json_encode($suggestions);
    
    } elseif ($_POST['action'] == 'autocomplete_localEvento') {
        $stmt = $conn->prepare("SELECT DISTINCT localEvento FROM eventos WHERE localEvento LIKE :query");
        $stmt->bindValue(':query', $query . '%');
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $suggestions = [];
        foreach ($results as $row) {
            $suggestions[] = $row['localEvento'];
        }
        echo json_encode($suggestions);
     
    // elseif ($_POST['action'] == 'autocomplete_dataEvento') {
    //     $stmt = $conn->prepare("SELECT DISTINCT dataEvento FROM eventos WHERE dataEvento LIKE :query");
    //     $stmt->bindValue(':query', $query . '%');
    //     $stmt->execute();
    //     $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    //     $suggestions = [];
    //     foreach ($results as $row) {
    //         $suggestions[] = $row['dataEvento'];
    //     }
    //     echo json_encode($suggestions);
    
    } elseif ($_POST['action'] == 'autocomplete_nomeSolicitante') {
        $stmt = $conn->prepare("SELECT DISTINCT nomeSolicitante FROM eventos WHERE nomeSolicitante LIKE :query");
        $stmt->bindValue(':query', $query . '%');
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $suggestions = [];
        foreach ($results as $row) {
            $suggestions[] = $row['nomeSolicitante'];
        }
        echo json_encode($suggestions);
    
    } elseif ($_POST['action'] == 'autocomplete_unidade') {
        $stmt = $conn->prepare("SELECT DISTINCT unidade FROM eventos WHERE unidade LIKE :query");
        $stmt->bindValue(':query', $query . '%');
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $suggestions = [];
        foreach ($results as $row) {
            $suggestions[] = $row['unidade'];
        }
        echo json_encode($suggestions);
    
    } elseif ($_POST['action'] == 'submit') {
        $nomeEvento = $_POST['nomeEvento'];
        $localEvento = $_POST['localEvento'];
        $dataEvento = $_POST['dataEvento'];
        $nomeSolicitante = $_POST['nomeSolicitante'];
        $unidade = $_POST['unidade'];
        
        $stmt = $conn->prepare("INSERT INTO eventos (nomeEvento, localEvento, dataEvento, nomeSolicitante, unidade) VALUES (:nomeEvento, :localEvento, :dataEvento, :nomeSolicitante, :unidade)");
        $stmt->bindValue(':nomeEvento', $nomeEvento);
        $stmt->bindValue(':localEvento', $localEvento);
        $stmt->bindValue(':dataEvento', $dataEvento);
        $stmt->bindValue(':nomeSolicitante', $nomeSolicitante);
        $stmt->bindValue(':unidade', $unidade);
        
        $stmt->execute();

        echo "Formulário enviado e salvo com sucesso!";
    } 
}
?>
