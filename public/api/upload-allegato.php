<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

try {
    // Check if file was uploaded
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('File upload error: ' . ($_FILES['file']['error'] ?? 'No file received'));
    }

    $file = $_FILES['file'];
    $fileName = $_POST['fileName'] ?? basename($file['name']);
    
    // Validate file type
    $allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!in_array($file['type'], $allowedTypes)) {
        throw new Exception('File type not allowed. Only PDF, DOC, and DOCX files are accepted.');
    }
    
    // Validate file size (10MB max)
    $maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if ($file['size'] > $maxSize) {
        throw new Exception('File too large. Maximum size is 10MB.');
    }
    
    // Create allegati directory if it doesn't exist
    $uploadDir = '/files/allegati/';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            throw new Exception('Failed to create upload directory');
        }
    }
    
    // Sanitize filename
    $fileName = preg_replace('/[^a-zA-Z0-9.-]/', '_', $fileName);
    $filePath = $uploadDir . $fileName;
    
    // Check if file already exists
    if (file_exists($filePath)) {
        throw new Exception('File already exists');
    }
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        throw new Exception('Failed to save file');
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'fileName' => $fileName,
        'fileUrl' => '/files/allegati/' . $fileName,
        'fileSize' => $file['size']
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
