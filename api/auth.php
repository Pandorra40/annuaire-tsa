<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// POST — connexion admin
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $mdp  = $data['password'] ?? '';

    if (!$mdp || !password_verify($mdp, ADMIN_HASH)) {
        jsonResponse(['error' => 'Mot de passe incorrect'], 401);
    }

    // Générer un token sécurisé
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', time() + SESSION_DURATION);

    $db = getDB();
    // Nettoyer les sessions expirées
    $db->exec('DELETE FROM admin_sessions WHERE expires_at < NOW()');
    // Créer la nouvelle session
    $db->prepare('INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)')->execute([$token, $expires]);

    jsonResponse(['token' => $token, 'expires' => $expires]);
}

// DELETE — déconnexion admin
if ($method === 'DELETE') {
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if ($token) {
        $db = getDB();
        $db->prepare('DELETE FROM admin_sessions WHERE token = ?')->execute([$token]);
    }
    jsonResponse(['ok' => true]);
}

jsonResponse(['error' => 'Méthode non supportée'], 405);
