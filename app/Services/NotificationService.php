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

    /**
     * Notify multiple users about an assignment. Skips the acting user.
     */
    public static function notifyAssigned(
        array $userIds,
        string $title,
        string $message,
        string $link,
        ?int $excludeUserId = null
    ): void {
        foreach (array_unique($userIds) as $userId) {
            if ($userId == $excludeUserId) continue;
            self::create((int)$userId, $title, $message, 'assignment', $link);
        }
    }

    /**
     * Only notify users newly added vs the existing list.
     */
    public static function notifyNewlyAssigned(
        array $newUserIds,
        array $existingUserIds,
        string $title,
        string $message,
        string $link,
        ?int $excludeUserId = null
    ): void {
        $added = array_values(array_diff(array_map('intval', $newUserIds), array_map('intval', $existingUserIds)));
        self::notifyAssigned($added, $title, $message, $link, $excludeUserId);
    }
}
