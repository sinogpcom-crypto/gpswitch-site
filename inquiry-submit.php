<?php

declare(strict_types=1);

require __DIR__ . '/inquiry-bootstrap.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'message' => 'Method not allowed.',
    ]);
    exit;
}

[$clean, $errors] = inquiry_validate_submission($_POST);

if ($errors !== []) {
    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => implode(' ', $errors),
        'errors' => $errors,
    ]);
    exit;
}

try {
    $id = inquiry_create($clean);

    echo json_encode([
        'ok' => true,
        'message' => 'Thank you. Your inquiry has been submitted successfully.',
        'id' => $id,
    ]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Submission failed. Please try again later.',
    ]);
}
