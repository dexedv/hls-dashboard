<?php

namespace App\Services;

use App\Models\License;
use Illuminate\Support\Facades\Schema;

class LicenseService
{
    private const LICENSE_SECRET = 'HLS-LICENSE-V2-K3Y-2026-SECURE-XJ9';
    private const PLAN_REVERSE   = [0 => 'starter', 1 => 'professional', 2 => 'enterprise'];

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
     * Validate a compact HMAC license key (format: XXXXXXX-XXXXXXX, 15 chars)
     * Returns decoded payload on success, false on failure
     */
    public function validateSignature(string $licenseKey): array|false
    {
        // Strip dashes/spaces, uppercase
        $key = strtoupper(str_replace(['-', ' '], '', $licenseKey));

        if (strlen($key) !== 14) {
            return false;
        }

        if (!preg_match('/^[0-9A-F]{14}$/', $key)) {
            return false;
        }

        $keyBytes = hex2bin($key);
        $data     = substr($keyBytes, 0, 4);
        $checksum = substr($keyBytes, 4, 3);

        // Verify HMAC
        $hmac             = hash_hmac('sha256', $data, self::LICENSE_SECRET, true);
        $expectedChecksum = substr($hmac, 0, 3);

        if (!hash_equals($expectedChecksum, $checksum)) {
            return false;
        }

        // Decode data bytes
        $planByte   = ord($data[0]);
        $maxUsers   = unpack('n', substr($data, 1, 2))[1];
        $expiryByte = ord($data[3]);
        $yearOffset = intdiv($expiryByte, 12);
        $month      = ($expiryByte % 12) + 1;

        $plan = self::PLAN_REVERSE[$planByte] ?? null;
        if ($plan === null || $maxUsers < 1) {
            return false;
        }

        $year       = 2026 + $yearOffset;
        $validUntil = sprintf('%04d-%02d-28', $year, $month);

        return [
            'licensed_to' => 'HLS-Service',
            'email'       => 'license@hls-service.de',
            'plan'        => $plan,
            'max_users'   => $maxUsers,
            'valid_until' => $validUntil,
            'features'    => null,
        ];
    }
}
