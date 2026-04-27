<?php
require_once __DIR__ . '/config.php';

// Cache simple fichier — évite de requêter Open Library à chaque visite
$cacheFile = sys_get_temp_dir() . '/openlibrary_cache.json';
$cacheTTL  = 86400; // 24h

if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTTL) {
    jsonHeaders();
    echo file_get_contents($cacheFile);
    exit;
}

$url = 'https://openlibrary.org/search.json?subject=autism&sort=new&limit=40&fields=title,author_name,first_publish_year,cover_i,key,subject,language';

$ctx = stream_context_create(['http' => [
    'timeout' => 10,
    'header'  => 'User-Agent: AnnuaireTSA/1.0'
]]);

$raw = @file_get_contents($url, false, $ctx);
if ($raw === false) {
    jsonResponse(['error' => 'Impossible de contacter Open Library'], 502);
}

// Mise en cache
file_put_contents($cacheFile, $raw);

jsonHeaders();
echo $raw;
