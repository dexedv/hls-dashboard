<?php
// Create database and run migrations
try {
    // First connect without database to create it
    $conn = new PDO('mysql:host=localhost', 'root', '');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create database
    $conn->exec("CREATE DATABASE IF NOT EXISTS dashboard_hp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Database 'dashboard_hp' created!\n";

    $conn = null;

    // Now connect to the database
    $conn = new PDO('mysql:host=localhost;dbname=dashboard_hp', 'root', '');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Show tables
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($tables)) {
        echo "No tables yet - need to run migrations!\n";
    } else {
        echo "Tables: " . implode(", ", $tables) . "\n";
    }

    $conn = null;
    echo "Done!\n";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
