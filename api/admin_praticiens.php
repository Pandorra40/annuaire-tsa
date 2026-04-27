<?php
require_once __DIR__ . '/config.php';
requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();
$id = (int)($_GET['id'] ?? 0);

// GET — un seul praticien ou tous
if ($method === 'GET') {
    if ($id) {
        $stmt = $db->prepare('SELECT * FROM praticiens WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) jsonResponse(['error' => 'Introuvable'], 404);
        $row['ages'] = agesToArray($row['ages']);
        $row['teleconsultation'] = (bool)$row['teleconsultation'];
        jsonResponse($row);
    } else {
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
}

// PATCH — modifier un praticien
if ($method === 'PATCH') {
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $db->prepare('
        UPDATE praticiens SET
            nom=?, type=?, ville=?, departement=?, adresse=?,
            telephone=?, site_web=?, teleconsultation=?, delai=?,
            ages=?, notes=?, adeli=?
        WHERE id=?
    ');
    $stmt->execute([
        $data['nom'], $data['type'], $data['ville'], $data['departement'],
        $data['adresse'] ?? null, $data['telephone'] ?? null,
        $data['site_web'] ?? null,
        !empty($data['teleconsultation']) ? 1 : 0,
        $data['delai'] ?? null,
        agesToString($data['ages'] ?? []),
        $data['notes'] ?? null,
        $data['adeli'] ?? null,
        $id
    ]);
    jsonResponse(['ok' => true]);
}

// DELETE — supprimer définitivement un praticien
if ($method === 'DELETE') {
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    $db->prepare('DELETE FROM signalements WHERE praticien_id = ?')->execute([$id]);
    $db->prepare('DELETE FROM praticiens WHERE id = ?')->execute([$id]);
    jsonResponse(['ok' => true]);
}

jsonResponse(['error' => 'Méthode non supportée'], 405);
