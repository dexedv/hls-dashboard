<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    private Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Show 2FA setup / generate secret and QR code
     */
    public function enable(Request $request)
    {
        $user = $request->user();

        $secret = $this->google2fa->generateSecretKey();

        // Store secret temporarily in session until confirmed
        session(['2fa_secret' => $secret]);

        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name', 'Dashboard'),
            $user->email,
            $secret
        );

        return response()->json([
            'secret' => $secret,
            'qr_url' => $qrCodeUrl,
        ]);
    }

    /**
     * Confirm 2FA setup with verification code
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();
        $secret = session('2fa_secret');

        if (!$secret) {
            return response()->json(['success' => false, 'message' => '2FA-Setup abgelaufen. Bitte erneut starten.'], 422);
        }

        $valid = $this->google2fa->verifyKey($secret, $request->code);

        if (!$valid) {
            return response()->json(['success' => false, 'message' => 'Ungültiger Code. Bitte erneut versuchen.'], 422);
        }

        // Generate recovery codes
        $recoveryCodes = collect(range(1, 8))->map(fn () => Str::random(10))->toArray();

        $user->update([
            'two_factor_secret' => encrypt($secret),
            'two_factor_enabled' => true,
            'two_factor_recovery_codes' => encrypt(json_encode($recoveryCodes)),
        ]);

        session()->forget('2fa_secret');

        return response()->json([
            'success' => true,
            'message' => '2FA erfolgreich aktiviert.',
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    /**
     * Disable 2FA
     */
    public function disable(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        if (!Auth::validate(['email' => $user->email, 'password' => $request->password])) {
            return response()->json(['success' => false, 'message' => 'Falsches Passwort.'], 422);
        }

        $user->update([
            'two_factor_secret' => null,
            'two_factor_enabled' => false,
            'two_factor_recovery_codes' => null,
        ]);

        return response()->json(['success' => true, 'message' => '2FA deaktiviert.']);
    }

    /**
     * Show 2FA challenge page (after login)
     */
    public function showChallenge()
    {
        if (!session('2fa_user_id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    /**
     * Verify 2FA challenge code
     */
    public function verifyChallenge(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $userId = session('2fa_user_id');
        if (!$userId) {
            return redirect()->route('login');
        }

        $user = \App\Models\User::findOrFail($userId);
        $secret = decrypt($user->two_factor_secret);

        // Check if it's a recovery code
        if (strlen($request->code) === 10) {
            $recoveryCodes = json_decode(decrypt($user->two_factor_recovery_codes), true);
            $index = array_search($request->code, $recoveryCodes);

            if ($index !== false) {
                // Remove used recovery code
                unset($recoveryCodes[$index]);
                $user->update([
                    'two_factor_recovery_codes' => encrypt(json_encode(array_values($recoveryCodes))),
                ]);

                Auth::login($user, session('2fa_remember', false));
                session()->forget(['2fa_user_id', '2fa_remember']);
                $request->session()->regenerate();

                return redirect()->intended(route('dashboard'));
            }
        }

        // Verify TOTP code
        $valid = $this->google2fa->verifyKey($secret, $request->code);

        if (!$valid) {
            return back()->withErrors(['code' => 'Ungültiger Code.']);
        }

        Auth::login($user, session('2fa_remember', false));
        session()->forget(['2fa_user_id', '2fa_remember']);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }
}
