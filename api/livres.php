<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET — livres publiés (publics)
if ($method === 'GET') {
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM livres WHERE statut = "publie" ORDER BY type ASC, titre ASC');
    $stmt->execute();
    jsonResponse($stmt->fetchAll());
}

// POST — ajouter un livre (admin)
if ($method === 'POST') {
    requireAdmin();
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) jsonResponse(['error' => 'Données invalides'], 400);

    $titre  = trim($data['titre']  ?? '');
    $auteur = trim($data['auteur'] ?? '');
    $cat    = trim($data['categorie'] ?? '');
    $type   = trim($data['type']   ?? '');

    if (!$titre || !$auteur || !$cat || !$type) {
        jsonResponse(['error' => 'Champs obligatoires manquants'], 400);
    }

    $db = getDB();
    $stmt = $db->prepare('
        INSERT INTO livres (titre, auteur, annee, categorie, type, description, lien, statut)
        VALUES (?, ?, ?, ?, ?, ?, ?, "publie")
    ');
    $stmt->execute([
        $titre, $auteur,
        (int)($data['annee'] ?? date('Y')),
        $cat, $type,
        $data['description'] ?? null,
        $data['lien'] ?? null,
    ]);
    jsonResponse(['ok' => true, 'id' => $db->lastInsertId()], 201);
}

// DELETE — supprimer un livre (admin)
if ($method === 'DELETE') {
    requireAdmin();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    $db = getDB();
    $db->prepare('DELETE FROM livres WHERE id = ?')->execute([$id]);
    jsonResponse(['ok' => true]);
}

jsonResponse(['error' => 'Méthode non supportée'], 405);
