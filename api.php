<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$conn = new mysqli('localhost', 'root', '', 'mi_proyecto');

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $result = $conn->query("SELECT * FROM registros");
        $registros = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($registros);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $conn->prepare("INSERT INTO registros (fechaEmision, fechaRecepcion, numOficio, nombreSuscribe, dependenciaDestinataria, asunto, responsable, estatus, documentoDigital) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssssssss", $data['fechaEmision'], $data['fechaRecepcion'], $data['numOficio'], $data['nombreSuscribe'], $data['dependenciaDestinataria'], $data['asunto'], $data['responsable'], $data['estatus'], $data['documentoDigital']);
        $stmt->execute();
        echo json_encode(['folio' => $conn->insert_id]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $conn->prepare("UPDATE registros SET fechaEmision=?, fechaRecepcion=?, numOficio=?, nombreSuscribe=?, dependenciaDestinataria=?, asunto=?, responsable=?, estatus=?, documentoDigital=? WHERE folio=?");
        $stmt->bind_param("sssssssss", $data['fechaEmision'], $data['fechaRecepcion'], $data['numOficio'], $data['nombreSuscribe'], $data['dependenciaDestinataria'], $data['asunto'], $data['responsable'], $data['estatus'], $data['documentoDigital'], $data['folio']);
        $stmt->execute();
        echo json_encode($data);
        break;

    case 'DELETE':
        $folio = $_GET['folio'];
        $stmt = $conn->prepare("DELETE FROM registros WHERE folio=?");
        $stmt->bind_param("i", $folio);
        $stmt->execute();
        echo json_encode(['folio' => $folio]);
        break;
}

$conn->close();
?>
