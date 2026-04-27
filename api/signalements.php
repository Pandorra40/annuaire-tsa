<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// POST — signalement public
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) jsonResponse(['error' => 'Données invalides'], 400);

    $motif = trim($data['motif'] ?? '');
    if (!$motif) jsonResponse(['error' => 'Motif obligatoire'], 400);

    $db = getDB();
    $stmt = $db->prepare('INSERT INTO signalements (praticien_id, praticien_nom, motif, detail, statut) VALUES (?, ?, ?, ?, "ouvert")');
    $stmt->execute([
        $data['praticien_id']  ?? null,
        $data['praticien_nom'] ?? null,
        $motif,
        $data['detail']        ?? null,
    ]);
    jsonResponse(['ok' => true], 201);
}

// GET — liste admin des signalements
if ($method === 'GET') {
    requireAdmin();
    $statut = $_GET['statut'] ?? 'ouvert';
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM signalements WHERE statut = ? ORDER BY created_at DESC');
    $stmt->execute([$statut]);
    jsonResponse($stmt->fetchAll());
}

// PATCH — ignorer un signalement (admin)
if ($method === 'PATCH') {
    requireAdmin();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    $data = json_decode(file_get_contents('php://input'), true);
    $statut = $data['statut'] ?? 'ignore';
    $db = getDB();
    $db->prepare('UPDATE signalements SET statut = ? WHERE id = ?')->execute([$statut, $id]);
    jsonResponse(['ok' => true]);
}

// DELETE — supprimer signalements liés à un praticien (admin)
if ($method === 'DELETE') {
    requireAdmin();
    $praticienId = (int)($_GET['praticien_id'] ?? 0);
    if (!$praticienId) jsonResponse(['error' => 'ID praticien manquant'], 400);
    $db = getDB();
    $db->prepare('DELETE FROM signalements WHERE praticien_id = ?')->execute([$praticienId]);
    jsonResponse(['ok' => true]);
}

jsonResponse(['error' => 'Méthode non supportée'], 405);
