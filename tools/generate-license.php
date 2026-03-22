<?php
/**
 * HLS Dashboard License Generator
 *
 * Usage:
 *   php tools/generate-license.php --plan=professional --users=25 --name="Firma GmbH" --email="info@firma.de" [--valid-until=2027-03-21]
 *
 * This tool signs license data with your PRIVATE key.
 * The app verifies with the embedded PUBLIC key.
 * NEVER distribute private.pem or this script!
 */

$options = getopt('', ['plan:', 'users:', 'name:', 'email:', 'valid-until::']);

if (empty($options['plan']) || empty($options['users']) || empty($options['name']) || empty($options['email'])) {
    echo "Usage: php tools/generate-license.php --plan=<starter|professional|enterprise> --users=<max_users> --name=\"Company Name\" --email=\"email@example.com\" [--valid-until=YYYY-MM-DD]\n\n";
    echo "Examples:\n";
    echo "  php tools/generate-license.php --plan=professional --users=25 --name=\"Firma GmbH\" --email=\"info@firma.de\"\n";
    echo "  php tools/generate-license.php --plan=enterprise --users=100 --name=\"Big Corp\" --email=\"admin@bigcorp.de\" --valid-until=2027-12-31\n";
    exit(1);
}

$privateKeyPath = __DIR__ . '/private.pem';
if (!file_exists($privateKeyPath)) {
    echo "ERROR: private.pem not found in tools/ directory.\n";
    echo "Run: openssl genrsa -out tools/private.pem 2048\n";
    exit(1);
}

$privateKey = openssl_pkey_get_private(file_get_contents($privateKeyPath));
if ($privateKey === false) {
    echo "ERROR: Could not read private key.\n";
    exit(1);
}

$validPlans = ['starter', 'professional', 'enterprise'];
if (!in_array($options['plan'], $validPlans)) {
    echo "ERROR: Invalid plan. Must be one of: " . implode(', ', $validPlans) . "\n";
    exit(1);
}

$payload = [
    'licensed_to' => $options['name'],
    'email' => $options['email'],
    'plan' => $options['plan'],
    'max_users' => (int) $options['users'],
    'valid_until' => $options['valid-until'] ?? null,
    'issued_at' => date('Y-m-d'),
];

$payloadJson = json_encode($payload, JSON_UNESCAPED_UNICODE);
$payloadBase64 = base64_encode($payloadJson);

// Sign the base64-encoded payload (not the raw JSON)
openssl_sign($payloadBase64, $signature, $privateKey, OPENSSL_ALGO_SHA256);
$signatureBase64 = base64_encode($signature);

$licenseKey = $payloadBase64 . '.' . $signatureBase64;

echo "\n=== HLS Dashboard License Generator ===\n\n";
echo "Licensed to: {$options['name']}\n";
echo "Email:       {$options['email']}\n";
echo "Plan:        {$options['plan']}\n";
echo "Max Users:   {$options['users']}\n";
echo "Valid Until: " . ($options['valid-until'] ?? 'Lifetime') . "\n";
echo "Issued:      " . date('Y-m-d') . "\n";
echo "\n=== LICENSE KEY (send to customer) ===\n\n";
echo $licenseKey . "\n";
echo "\n=== END ===\n";
