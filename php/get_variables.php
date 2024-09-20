<?php
// Inclui o arquivo que contém as variáveis globais
include 'variaveis_globais.php';

// Retorna as variáveis como JSON
header('Content-Type: application/json');
echo json_encode([
    'var1' => $var1,
]);
?>
