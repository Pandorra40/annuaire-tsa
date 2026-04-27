<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET — lecture publique des praticiens publiés
if ($method === 'GET') {
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM praticiens WHERE statut = "publie" ORDER BY nom ASC');
    $stmt->execute();
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        $row['ages'] = agesToArray($row['ages']);
        $row['teleconsultation'] = (bool)$row['teleconsultation'];
        $row['confirmations'] = (int)$row['confirmations'];
    }
    jsonResponse($rows);
}

// PATCH — confirmation fiche (public, incrémente le compteur)
if ($method === 'PATCH') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    $db = getDB();
    $stmt = $db->prepare('UPDATE praticiens SET confirmations = confirmations + 1, derniere_confirmation = NOW() WHERE id = ? AND statut = "publie"');
    $stmt->execute([$id]);
    jsonResponse(['ok' => true]);
}

jsonResponse(['error' => 'Méthode non supportée'], 405);
