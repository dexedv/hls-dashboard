<?php
/**
 * HLS Dashboard License Generator
 *
 * Usage:
 *   php tools/generate-license.php --plan=<starter|professional|enterprise> --users=<max_users> --name="Company Name" --email="email@example.com" [--valid-until=YYYY-MM-DD]
 *
 * NEVER distribute this script or the LICENSE_SECRET!
 */

// Must match LicenseService::LICENSE_SECRET exactly
define('LICENSE_SECRET', 'HLS-LICENSE-V2-K3Y-2026-SECURE-XJ9');
define('PLAN_MAP', ['starter' => 0, 'professional' => 1, 'enterprise' => 2]);

$options = getopt('', ['plan:', 'users:', 'name:', 'email:', 'valid-until::']);

if (empty($options['plan']) || empty($options['users']) || empty($options['name']) || empty($options['email'])) {
    echo "Usage: php tools/generate-license.php --plan=<starter|professional|enterprise> --users=<max_users> --name=\"Company Name\" --email=\"email@example.com\" [--valid-until=YYYY-MM-DD]\n\n";
    echo "Examples:\n";
    echo "  php tools/generate-license.php --plan=professional --users=25 --name=\"Firma GmbH\" --email=\"info@firma.de\"\n";
    echo "  php tools/generate-license.php --plan=enterprise --users=300 --name=\"HLS-Service\" --email=\"admin@hls.de\" --valid-until=2027-03-30\n";
    exit(1);
}

$validPlans = ['starter', 'professional', 'enterprise'];
if (!in_array($options['plan'], $validPlans)) {
    echo "ERROR: Invalid plan. Must be one of: " . implode(', ', $validPlans) . "\n";
    exit(1);
}

$maxUsers   = (int) $options['users'];
$validUntil = $options['valid-until'] ?? date('Y-m-d', strtotime('+1 year'));
$plan       = $options['plan'];
$name       = $options['name'];
$email      = $options['email'];

if ($maxUsers < 1 || $maxUsers > 65535) {
    echo "ERROR: users must be between 1 and 65535.\n";
    exit(1);
}

$planByte   = PLAN_MAP[$plan];
$year       = (int) date('Y', strtotime($validUntil));
$month      = (int) date('n', strtotime($validUntil));
$yearOffset = $year - 2026;

if ($yearOffset < 0 || $yearOffset > 21) {
    echo "ERROR: valid-until year must be between 2026 and 2047.\n";
    exit(1);
}

// Pack 4 data bytes:
//   [0]   plan (0=starter, 1=professional, 2=enterprise)
//   [1-2] max_users uint16 big-endian
//   [3]   expiry = yearOffset*12 + (month-1)  →  0-252
$expiryByte = ($yearOffset * 12) + ($month - 1);
$data       = chr($planByte) . pack('n', $maxUsers) . chr($expiryByte);

// 3-byte HMAC checksum
$hmac     = hash_hmac('sha256', $data, LICENSE_SECRET, true);
$checksum = substr($hmac, 0, 3);

// 7 bytes → 14 uppercase hex chars → format XXXXXXX-XXXXXXX (15 chars)
$hex       = strtoupper(bin2hex($data . $checksum));
$formatted = substr($hex, 0, 7) . '-' . substr($hex, 7, 7);

echo "\n=== HLS Dashboard License Generator ===\n\n";
echo "Licensed to: {$name}\n";
echo "Email:       {$email}\n";
echo "Plan:        {$plan}\n";
echo "Max Users:   {$maxUsers}\n";
echo "Valid Until: {$validUntil}\n";
echo "Issued:      " . date('Y-m-d') . "\n";
echo "\n=== LICENSE KEY ===\n\n";
echo $formatted . "\n";
echo "\n=== END ===\n";
