<?php

namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    public static function create(int $userId, string $title, string $message, string $type = 'info', ?string $link = null): Notification
    {
        return Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'link' => $link,
        ]);
    }

    public static function notifyUser(int $userId, string $title, string $message, string $type = 'info', ?string $link = null): Notification
    {
        return self::create($userId, $title, $message, $type, $link);
    }
}
