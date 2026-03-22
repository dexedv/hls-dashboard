<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Helpers\PermissionHelper;
use App\Models\Notification;
use App\Models\Setting;
use App\Models\TimeEntry;
use App\Services\LicenseService;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $permissions = [];
        $userRole = 'guest';

        if ($user) {
            $userRole = $user->role ?? 'employee';
            $permissions = PermissionHelper::getRolePermissions($userRole);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'permissions' => $permissions,
                'userRole' => $userRole,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
            'notifications' => fn () => $user ? Notification::where('user_id', $user->id)
                ->where('read', false)
                ->latest()
                ->limit(5)
                ->get() : [],
            'unreadNotificationsCount' => fn () => $user ? Notification::where('user_id', $user->id)
                ->where('read', false)
                ->count() : 0,
            'activeTimer' => fn () => $user ? TimeEntry::where('user_id', $user->id)
                ->whereNull('end_time')
                ->first() : null,
            'app_version' => config('app.version', '1.0.0'),
            'mail_configured' => fn () => !empty(Setting::get('mail_host')),
            'branding' => fn () => $this->getBranding(),
            'license' => fn () => $this->getLicenseInfo(),
        ];
    }

    private function getBranding(): array
    {
        try {
            return [
                'app_name' => Setting::get('app_name', 'Dashboard'),
                'app_logo' => Setting::get('app_logo'),
                'app_favicon' => Setting::get('app_favicon'),
                'primary_color' => Setting::get('primary_color', '#0284c7'),
            ];
        } catch (\Exception $e) {
            return [
                'app_name' => 'Dashboard',
                'app_logo' => null,
                'app_favicon' => null,
                'primary_color' => '#0284c7',
            ];
        }
    }

    private function getLicenseInfo(): ?array
    {
        try {
            $licenseService = app(LicenseService::class);
            $license = $licenseService->current();

            if (!$license) {
                return null;
            }

            return [
                'plan' => $license->getPlan(),
                'max_users' => $license->getUserLimit(),
                'licensed_to' => $license->licensed_to,
                'valid_until' => $license->valid_until?->format('Y-m-d'),
                'is_expired' => $license->isExpired(),
                'is_valid' => $license->isValid(),
            ];
        } catch (\Exception $e) {
            return null;
        }
    }
}
