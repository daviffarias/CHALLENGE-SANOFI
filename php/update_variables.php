<?php
$data = json_decode(file_get_contents('php://input'), true);
$variable = $data['variable'];
$value = $data['value'];

// Verifica se a variável é 'chairman'
if ($variable === 'chairman') {
    // Conectar ao banco de dados SQLite
    $db = new PDO('sqlite:../database.db');

    // Atualizar o valor no banco de dados
    $stmt = $db->prepare("UPDATE taxas SET value = :value WHERE name = 'taxaChairman'");
    $stmt->bindValue(':value', $value); 
    
    if ($stmt->execute()) {
        http_response_code(200);
    } else {
        http_response_code(500); // Erro ao atualizar
    }
}
?>
