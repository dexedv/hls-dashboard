<?php

namespace App\Http\Middleware;

use App\Helpers\PermissionHelper;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect('/login');
        }

        if (!PermissionHelper::hasPermission($user, $permission)) {
            abort(403, 'Sie haben keine Berechtigung für diese Aktion.');
        }

        return $next($request);
    }
}
