<?php
/**
 * RSA Key-Pair Generator for HLS Dashboard License System
 *
 * Run this ONCE on your development machine:
 *   php tools/generate-keypair.php
 *
 * This creates:
 *   tools/private.pem - KEEP SECRET! Never distribute!
 *   tools/public.pem  - Embed in LicenseService.php
 */

echo "=== HLS Dashboard - RSA Key-Pair Generator ===\n\n";

$config = [
    'private_key_bits' => 2048,
    'private_key_type' => OPENSSL_KEYTYPE_RSA,
];

$res = openssl_pkey_new($config);

if (!$res) {
    echo "ERROR: Could not generate key pair.\n";
    echo openssl_error_string() . "\n";
    exit(1);
}

// Extract private key
openssl_pkey_export($res, $privateKey);

// Extract public key
$publicKeyDetails = openssl_pkey_get_details($res);
$publicKey = $publicKeyDetails['key'];

$toolsDir = __DIR__;

// Save private key
file_put_contents($toolsDir . '/private.pem', $privateKey);
echo "Private key saved to: tools/private.pem\n";
echo "  >> KEEP THIS SECRET! Never commit to git!\n\n";

// Save public key
file_put_contents($toolsDir . '/public.pem', $publicKey);
echo "Public key saved to: tools/public.pem\n";
echo "  >> Embed this in app/Services/LicenseService.php\n\n";

echo "=== PUBLIC KEY (copy to LicenseService.php) ===\n";
echo $publicKey;
echo "\n=== Done! ===\n";
