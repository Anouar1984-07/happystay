<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion des requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$API_BASE = 'http://82.25.115.1:5001';

// Récupérer l'action depuis l'URL
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'status':
            $response = file_get_contents($API_BASE . '/api/status');
            echo $response;
            break;

        case 'reports':
            $response = file_get_contents($API_BASE . '/api/reports');
            echo $response;
            break;

        case 'execute':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Méthode non autorisée');
            }

            $input = json_decode(file_get_contents('php://input'), true);

            $postData = json_encode([
                'scope' => $input['scope'] ?? 'national',
                'region' => $input['region'] ?? 'France',
                'periode' => $input['periode'] ?? '7j'
            ]);

            $context = stream_context_create([
                'http' => [
                    'method' => 'POST',
                    'header' => 'Content-Type: application/json',
                    'content' => $postData,
                    'timeout' => 60
                ]
            ]);

            $response = file_get_contents($API_BASE . '/api/execute', false, $context);

            if ($response === false) {
                throw new Exception('Erreur lors de l\'exécution de l\'agent');
            }

            echo $response;
            break;

        case 'report':
            $filename = $_GET['filename'] ?? '';
            if (empty($filename)) {
                throw new Exception('Nom de fichier manquant');
            }

            $reportUrl = $API_BASE . '/api/report/' . urlencode($filename);
            $response = file_get_contents($reportUrl);

            if ($response === false) {
                throw new Exception('Fichier non trouvé');
            }

            // Déterminer le type de contenu
            $ext = pathinfo($filename, PATHINFO_EXTENSION);
            if ($ext === 'json') {
                header('Content-Type: application/json');
            } else if ($ext === 'html') {
                header('Content-Type: text/html');
            }

            echo $response;
            break;

        default:
            throw new Exception('Action non reconnue');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>