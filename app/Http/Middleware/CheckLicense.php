<?php

namespace App\Http\Middleware;

use App\Services\LicenseService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckLicense
{
    public function __construct(private LicenseService $licenseService)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        // Skip for API/JSON requests
        if ($request->expectsJson()) {
            return $next($request);
        }

        $license = $this->licenseService->current();

        // No license at all - redirect to license page
        if (!$license) {
            if (!$request->is('settings*', 'install*', 'license*')) {
                return redirect()->route('settings.index')
                    ->with('error', 'Keine gültige Lizenz gefunden. Bitte aktivieren Sie eine Lizenz.');
            }
        }

        // License expired - hard block, redirect to settings
        if ($license && $license->isExpired()) {
            if (!$request->is('settings*', 'install*', 'license*')) {
                return redirect()->route('settings.index')
                    ->with('error', 'Ihre Lizenz ist abgelaufen. Bitte erneuern Sie Ihre Lizenz um fortzufahren.');
            }
        }

        return $next($request);
    }
}
