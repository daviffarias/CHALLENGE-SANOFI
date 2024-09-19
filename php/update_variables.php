<?php
// Recebe os dados da requisição
$data = json_decode(file_get_contents('php://input'), true);

$variable = $data['variable'];
$value = $data['value'];

// Verifica se o valor é um número
if (!is_numeric($value)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valor inválido']);
    exit;
}

// Atualiza o arquivo com as variáveis
$file = 'variaveis_globais.php';
$content = file_get_contents($file);

// Atualiza a variável correta no conteúdo do arquivo
if ($variable === 'var1') {
    $content = preg_replace("/(\$var1\s*=\s*)\d+;/", "\$var1 = $value;", $content);
} elseif ($variable === 'var2') {
    $content = preg_replace("/(\$var2\s*=\s*)\d+;/", "\$var2 = $value;", $content);
}

// Escreve as alterações de volta no arquivo
if (file_put_contents($file, $content)) {
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao atualizar o arquivo']);
}
?>
