<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// POST — soumission publique d'une suggestion de livre
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) jsonResponse(['error' => 'Données invalides'], 400);

    $titre  = trim($data['titre']  ?? '');
    $auteur = trim($data['auteur'] ?? '');

    if (!$titre || !$auteur) {
        jsonResponse(['error' => 'Titre et auteur obligatoires'], 400);
    }

    $db = getDB();
    $stmt = $db->prepare('
        INSERT INTO suggestions_livres (titre, auteur, annee, categorie, description, lien, statut)
        VALUES (?, ?, ?, ?, ?, ?, "en_attente")
    ');
    $stmt->execute([
        $titre, $auteur,
        (int)($data['annee'] ?? 0) ?: null,
        $data['categorie'] ?? null,
        $data['description'] ?? null,
        $data['lien'] ?? null,
    ]);
    jsonResponse(['ok' => true], 201);
}

// GET — liste admin des suggestions en attente
if ($method === 'GET') {
    requireAdmin();
    $statut = $_GET['statut'] ?? 'en_attente';
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM suggestions_livres WHERE statut = ? ORDER BY created_at ASC');
    $stmt->execute([$statut]);
    jsonResponse($stmt->fetchAll());
}

// PATCH — valider ou refuser (admin)
if ($method === 'PATCH') {
    requireAdmin();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonResponse(['error' => 'ID manquant'], 400);
    $data   = json_decode(file_get_contents('php://input'), true);
    $statut = $data['statut'] ?? '';
    if (!in_array($statut, ['valide', 'refuse'])) jsonResponse(['error' => 'Statut invalide'], 400);

    $db = getDB();

    if ($statut === 'valide') {
        $stmt = $db->prepare('SELECT * FROM suggestions_livres WHERE id = ?');
        $stmt->execute([$id]);
        $s = $stmt->fetch();
        if (!$s) jsonResponse(['error' => 'Suggestion introuvable'], 404);

        $db->prepare('
            INSERT INTO livres (titre, auteur, annee, categorie, type, description, lien, statut)
            VALUES (?, ?, ?, ?, "suggestion", ?, ?, "publie")
        ')->execute([
            $s['titre'], $s['auteur'], $s['annee'],
            $s['categorie'] ?: 'témoignage',
            $s['description'], $s['lien'],
        ]);
    }

    $db->prepare('UPDATE suggestions_livres SET statut = ? WHERE id = ?')->execute([$statut, $id]);
    jsonResponse(['ok' => true]);
}

jsonResponse(['error' => 'Méthode non supportée'], 405);
