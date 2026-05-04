<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// POST — signalement public
if ($method === 'POST') {
    rateLimit('signalement', 5, 3600); // max 5 par heure par IP

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) jsonResponse(['error' => 'Données invalides'], 400);

    $motif = trim($data['motif'] ?? '');
    if (!$motif) jsonResponse(['error' => 'Motif obligatoire'], 400);
    validateLength($motif, 200, 'motif');

    $detail = isset($data['detail']) ? strip_tags(trim($data['detail'])) : null;
    if ($detail) validateLength($detail, 500, 'détails');

    $praticienId = (int)($data['praticien_id'] ?? 0);
    if (!$praticienId) jsonResponse(['error' => 'ID praticien manquant'], 400);

    $db = getDB();
    $stmt = $db->prepare('INSERT INTO signalements (praticien_id, praticien_nom, motif, detail, statut) VALUES (?, ?, ?, ?, "ouvert")');
    $stmt->execute([
        $praticienId,
        $data['praticien_nom'] ?? null,
        $motif,
        $detail,
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
    if (!in_array($statut, ['ignore', 'resolu'])) jsonResponse(['error' => 'Statut invalide'], 400);
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
