<?php
$db = new PDO('sqlite:../database.db');

// Query para buscar a taxaChairman
$query = "SELECT value FROM taxas WHERE name = 'taxaChairman'";
$stmt = $db->query($query);
$taxa = $stmt->fetchColumn();

echo json_encode($taxa);
?>

