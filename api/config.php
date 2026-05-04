<?php
// ============================================================
// ANNUAIRE TSA — Configuration centrale
// NE PAS mettre ce fichier dans un dossier public accessible
// ============================================================

// Supprime les warnings PHP qui casseraient le JSON
error_reporting(0);
ini_set('display_errors', '0');

define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'annua2764286');
define('DB_USER', 'annua2764286');
define('DB_PASS', '47swhnjdlh'); // ← à remplacer

// Mot de passe admin (hashé bcrypt)
// Pour générer un nouveau hash, utilisez : php -r "echo password_hash('votre_mdp', PASSWORD_BCRYPT);"
// Remplacez la valeur ci-dessous par votre propre hash
define('ADMIN_HASH', '$2y$10$JBXhfgAxg2NQJfRKPmtGpO7EJGTps4iPI2X8KZE2RcVUKBHoAZzJK');

// Durée de session admin (en secondes) — 8 heures
define('SESSION_DURATION', 28800);

// Connexion PDO
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';port=3306;dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]
        );
    }
    return $pdo;
}

// Headers CORS et JSON
function jsonHeaders(): void {
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
}

// Réponse JSON
function jsonResponse(mixed $data, int $code = 200): void {
    http_response_code($code);
    jsonHeaders();
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('Pragma: no-cache');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Vérification token admin
function requireAdmin(): void {
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if (!$token) jsonResponse(['error' => 'Non authentifié'], 401);
    $db = getDB();
    $stmt = $db->prepare('SELECT id FROM admin_sessions WHERE token = ? AND expires_at > NOW()');
    $stmt->execute([$token]);
    if (!$stmt->fetch()) jsonResponse(['error' => 'Session expirée'], 401);
}

// Conversion ages (JSON array → string MySQL et vice versa)
function agesToString(?array $ages): ?string {
    if (!$ages) return null;
    return implode(',', $ages);
}

function agesToArray(?string $ages): array {
    if (!$ages) return [];
    return explode(',', $ages);
}

// Rate limiting basé sur fichier (compatible tous hébergeurs)
function rateLimit(string $action, int $max = 10, int $fenetre = 3600): void {
    $ip   = preg_replace('/[^a-f0-9:.]/', '', $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
    $file = sys_get_temp_dir() . '/tsa_rl_' . md5($action . $ip) . '.json';
    $now  = time();
    $data = [];

    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true) ?: [];
    }

    // Nettoyer les entrées hors fenêtre
    $data = array_filter($data, fn($t) => ($now - $t) < $fenetre);

    if (count($data) >= $max) {
        jsonResponse(['error' => 'Trop de requêtes. Réessayez plus tard.'], 429);
    }

    $data[] = $now;
    file_put_contents($file, json_encode(array_values($data)));
}

// Validation longueur d'un champ
function validateLength(string $value, int $max, string $field): void {
    if (strlen($value) > $max) {
        jsonResponse(['error' => "Le champ $field est trop long (max $max caractères)."], 400);
    }
}

// Validation URL
function validateUrl(?string $url): ?string {
    if (!$url) return null;
    $url = trim($url);
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        jsonResponse(['error' => 'URL invalide.'], 400);
    }
    $scheme = parse_url($url, PHP_URL_SCHEME);
    if (!in_array($scheme, ['http', 'https'])) {
        jsonResponse(['error' => 'URL invalide.'], 400);
    }
    return $url;
}
