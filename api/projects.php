<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

switch ($method) {
    case 'GET':
        if ($id) {
            // Get single project
            $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ?");
            $stmt->execute([$id]);
            $project = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($project) {
                $project['tags'] = json_decode($project['tags'], true) ?: [];
                sendResponse($project);
            } else {
                sendResponse(['error' => 'Project not found'], 404);
            }
        } else {
            // Get all projects
            $stmt = $pdo->query("SELECT * FROM projects ORDER BY created_at DESC");
            $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($projects as &$project) {
                $project['tags'] = json_decode($project['tags'], true) ?: [];
            }
            
            sendResponse($projects);
        }
        break;

    case 'POST':
        // Create new project
        $input = json_decode(file_get_contents('php://input'), true);
        
        $error = validateRequired($input, ['name']);
        if ($error) {
            sendResponse(['error' => $error], 400);
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO projects (name, description, status, priority, due_date, tags) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $tags = isset($input['tags']) ? json_encode($input['tags']) : json_encode([]);
        $dueDate = !empty($input['due_date']) ? $input['due_date'] : null;
        
        $stmt->execute([
            $input['name'],
            $input['description'] ?? '',
            $input['status'] ?? 'planning',
            $input['priority'] ?? 'medium',
            $dueDate,
            $tags
        ]);
        
        $newId = $pdo->lastInsertId();
        
        // Return the created project
        $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ?");
        $stmt->execute([$newId]);
        $project = $stmt->fetch(PDO::FETCH_ASSOC);
        $project['tags'] = json_decode($project['tags'], true) ?: [];
        
        sendResponse($project, 201);
        break;

    case 'PUT':
        // Update project
        if (!$id) {
            sendResponse(['error' => 'Project ID is required'], 400);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        $error = validateRequired($input, ['name']);
        if ($error) {
            sendResponse(['error' => $error], 400);
        }
        
        $stmt = $pdo->prepare("
            UPDATE projects 
            SET name = ?, description = ?, status = ?, priority = ?, due_date = ?, tags = ?
            WHERE id = ?
        ");
        
        $tags = isset($input['tags']) ? json_encode($input['tags']) : json_encode([]);
        $dueDate = !empty($input['due_date']) ? $input['due_date'] : null;
        
        $stmt->execute([
            $input['name'],
            $input['description'] ?? '',
            $input['status'] ?? 'planning',
            $input['priority'] ?? 'medium',
            $dueDate,
            $tags,
            $id
        ]);
        
        if ($stmt->rowCount() === 0) {
            sendResponse(['error' => 'Project not found'], 404);
        }
        
        // Return the updated project
        $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ?");
        $stmt->execute([$id]);
        $project = $stmt->fetch(PDO::FETCH_ASSOC);
        $project['tags'] = json_decode($project['tags'], true) ?: [];
        
        sendResponse($project);
        break;

    case 'DELETE':
        // Delete project
        if (!$id) {
            sendResponse(['error' => 'Project ID is required'], 400);
        }
        
        $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() === 0) {
            sendResponse(['error' => 'Project not found'], 404);
        }
        
        sendResponse(['message' => 'Project deleted successfully']);
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
        break;
}
?>
