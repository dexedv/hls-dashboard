<?php

namespace App\Services;

use App\Models\License;
use Illuminate\Support\Facades\Schema;

class LicenseService
{
    // Embedded RSA Public Key - used to verify license signatures
    private const PUBLIC_KEY = '-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtSb1DnOqLu/d+MLq3gpL
f5259ep2EgLgiQ6bdrT0XgVsrcmQk/vbFyDWWwl2i3oVbYKtDaGqYBT1YCtxaXNC
absy7QpJgNQMZky+EUcl+aHUfOKQfi+MiEbWd3onzSfv8S/hL4OvsfWfpafOEBoL
kS+jemXRQsJdQcFNFUXNpBnCMggdTNvxRZMvVo0tQgazriLkHTvhRu3FnMPHnshQ
lISXI+T4neVhejrTAejcwc1v6nGusD2FpBMnhFUZCJCQSGfOfBDuJCGHr9Rl2s0z
6wTE9+HToFjkFLMO7L6qu4jO7ZZQy10MBys/Tnarh3SkBkynFDXzE4q4HWAwsoDj
EwIDAQAB
-----END PUBLIC KEY-----';

    /**
     * Activate a license key - validates signature and stores in DB
     */
    public function activate(string $licenseKey): array
    {
        $payload = $this->validateSignature($licenseKey);

        if ($payload === false) {
            return ['success' => false, 'message' => 'Ungültiger Lizenzschlüssel. Die Signatur konnte nicht verifiziert werden.'];
        }

        // Store in database
        try {
            $license = License::updateOrCreate(
                ['license_key' => $licenseKey],
                [
                    'licensed_to' => $payload['licensed_to'],
                    'licensed_email' => $payload['email'],
                    'plan' => $payload['plan'],
                    'max_users' => $payload['max_users'],
                    'features' => $payload['features'] ?? null,
                    'valid_until' => $payload['valid_until'] ?? null,
                    'activated_at' => now(),
                ]
            );

            return [
                'success' => true,
                'message' => 'Lizenz erfolgreich aktiviert.',
                'license' => $license,
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Lizenz konnte nicht gespeichert werden: ' . $e->getMessage()];
        }
    }

    /**
     * Verify if a valid active license exists
     */
    public function verify(): bool
    {
        try {
            if (!Schema::hasTable('licenses')) {
                return false;
            }

            $license = $this->current();
            return $license !== null && $license->isValid();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get current active license
     */
    public function current(): ?License
    {
        try {
            if (!Schema::hasTable('licenses')) {
                return null;
            }

            return License::whereNotNull('activated_at')
                ->latest('activated_at')
                ->first();
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Validate RSA signature of a license key
     * Returns decoded payload on success, false on failure
     */
    public function validateSignature(string $licenseKey): array|false
    {
        $parts = explode('.', $licenseKey);

        if (count($parts) !== 2) {
            return false;
        }

        $payloadBase64 = $parts[0];
        $signatureBase64 = $parts[1];

        $payload = base64_decode($payloadBase64, true);
        $signature = base64_decode($signatureBase64, true);

        if ($payload === false || $signature === false) {
            return false;
        }

        // Verify RSA signature with embedded public key
        $publicKey = openssl_pkey_get_public(self::PUBLIC_KEY);
        if ($publicKey === false) {
            return false;
        }

        $verified = openssl_verify($payloadBase64, $signature, $publicKey, OPENSSL_ALGO_SHA256);

        if ($verified !== 1) {
            return false;
        }

        $data = json_decode($payload, true);

        if (!$data || !isset($data['licensed_to'], $data['email'], $data['plan'], $data['max_users'])) {
            return false;
        }

        return $data;
    }
}
