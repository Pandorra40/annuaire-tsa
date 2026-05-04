<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: public, max-age=3600');

$url = 'https://openlibrary.org/search.json?subject=autism&sort=new&limit=40&fields=title,author_name,first_publish_year,cover_i,key,subject,language';

$ctx = stream_context_create(['http' => [
    'timeout' => 10,
    'header'  => 'User-Agent: annuaire-tsa.fr/1.0'
]]);

$json = @file_get_contents($url, false, $ctx);

if ($json === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Impossible de contacter Open Library']);
    exit;
}

echo $json;
