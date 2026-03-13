<?php

namespace App\Http\Middleware;

use App\Services\EnvManager;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckInstalled
{
    private EnvManager $envManager;

    public function __construct(EnvManager $envManager)
    {
        $this->envManager = $envManager;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Allow health check
        if ($request->is('up') || $request->is('api/*')) {
            return $next($request);
        }

        // Allow install routes
        if ($request->is('install*')) {
            // If already installed and trying to access without reinstall flag
            if ($this->envManager->isInstalled() && !$request->query('reinstall') && !$request->query('mode')) {
                return redirect('/');
            }
            return $next($request);
        }

        // Check if application is installed
        if (!$this->envManager->isInstalled()) {
            return redirect()->route('install.index');
        }

        return $next($request);
    }
}
