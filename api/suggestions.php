<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// POST — soumission publique d'une suggestion
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) jsonResponse(['error' => 'Données invalides'], 400);

    $nom  = trim($data['nom']  ?? '');
    $type = trim($data['type'] ?? '');
    $ville = trim($data['ville'] ?? '');
    $dept = trim($data['departement'] ?? '');

    if (!$nom || !$type || !$ville || !$dept) {
        jsonResponse(['error' => 'Champs obligatoires manquants'], 400);
    }

    $db = getDB();
    $stmt = $db->prepare('
        INSERT INTO suggestions (nom, type, ville, departement, adresse, telephone, site_web, teleconsultation, delai, ages, notes, adeli, statut, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "en_attente", ?)
    ');
    $stmt->execute([
        $nom, $type, $ville, $dept,
        $data['adresse']   ?? null,
        $data['telephone'] ?? null,
        $data['site_web']  ?? null,
        !empty($data['teleconsultation']) ? 1 : 0,
        $data['delai']     ?? null,
        agesToString($data['ages'] ?? []),
        $data['notes']     ?? null,
        $data['adeli']     ?? null,
        $data['source']    ?? 'communaute',
    ]);
    jsonResponse(['ok' => true], 201);
}

// GET — liste admin des suggestions en attente
if ($method === 'GET') {
    requireAdmin();
    $statut = $_GET['statut'] ?? 'en_attente';
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM suggestions WHERE statut = ? ORDER BY created_at ASC');
    $stmt->execute([$statut]);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        $row['ages'] = agesToArray($row['ages']);
        $row['teleconsultation'] = (bool)$row['teleconsultation'];
    }
    jsonResponse($rows);
}

// PATCH — valider ou refuser une suggestion (admin)
if ($method === 'PATCH') {
    requireAdmin();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    $data = json_decode(file_get_contents('php://input'), true);
    $statut = $data['statut'] ?? '';
    if (!in_array($statut, ['valide', 'refuse'])) jsonResponse(['error' => 'Statut invalide'], 400);

    $db = getDB();

    // Si validation → copier dans praticiens
    if ($statut === 'valide') {
        $stmt = $db->prepare('SELECT * FROM suggestions WHERE id = ?');
        $stmt->execute([$id]);
        $s = $stmt->fetch();
        if (!$s) jsonResponse(['error' => 'Suggestion introuvable'], 404);

        try {
            $ins = $db->prepare('
                INSERT INTO praticiens (nom, type, ville, departement, adresse, telephone, site_web, teleconsultation, delai, ages, notes, adeli, statut, confirmations)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "publie", 0)
            ');
            $ins->execute([
                $s['nom'] ?? '',
                $s['type'] ?? '',
                $s['ville'] ?? '',
                $s['departement'] ?? '',
                $s['adresse'] ?? null,
                $s['telephone'] ?? null,
                $s['site_web'] ?? null,
                $s['teleconsultation'] ?? 0,
                $s['delai'] ?? null,
                $s['ages'] ?? null,
                $s['notes'] ?? null,
                $s['adeli'] ?? null,
            ]);
        } catch (Exception $e) {
            jsonResponse(['error' => 'Erreur insertion praticien : ' . $e->getMessage()], 500);
        }
    }

    $db->prepare('UPDATE suggestions SET statut = ? WHERE id = ?')->execute([$statut, $id]);
    jsonResponse(['ok' => true]);
}

jsonResponse(['error' => 'Méthode non supportée'], 405);
