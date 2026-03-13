<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ChatMessage;
use App\Services\SupabaseHelper;
use App\Repositories\SupabaseRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class ChatController extends Controller
{
    /**
     * Ensure chat table exists
     */
    private function ensureChatTable()
    {
        // Skip for Supabase
        if ($this->isSupabase()) {
            return;
        }

        // Create table if not exists
        if (!Schema::hasTable('chat_messages')) {
            Schema::create('chat_messages', function ($table) {
                $table->id();
                $table->unsignedBigInteger('sender_id');
                $table->unsignedBigInteger('receiver_id');
                $table->text('message');
                $table->boolean('is_read')->default(false);
                $table->timestamps();

                $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('receiver_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }

    /**
     * Check if using Supabase
     */
    private function isSupabase()
    {
        $dbDriver = config('database.default');
        return $dbDriver === 'pgsql' || config('services.supabase.url');
    }

    /**
     * Show chat page with all messages
     */
    public function index(Request $request)
    {
        // Ensure table exists
        $this->ensureChatTable();

        $currentUser = Auth::user();
        $userId = $currentUser->id;

        if (SupabaseHelper::useSupabase()) {
            $allMessages = SupabaseRepository::chatMessages()->get();

            // Get messages where current user is sender or receiver
            $messages = $allMessages->filter(function($msg) use ($userId) {
                return $msg['sender_id'] == $userId || $msg['receiver_id'] == $userId;
            });

            // Get unique conversation users
            $userIds = [];
            foreach ($messages as $msg) {
                if ($msg['sender_id'] != $userId) $userIds[] = $msg['sender_id'];
                if ($msg['receiver_id'] != $userId) $userIds[] = $msg['receiver_id'];
            }
            $userIds = array_unique($userIds);

            // Get user details
            $allUsers = SupabaseRepository::users()->all();
            $conversationUsers = $allUsers->filter(function($user) use ($userIds) {
                return in_array($user['id'], $userIds);
            })->values();

            // Get unread count
            $unreadCount = $messages->filter(function($msg) use ($userId) {
                return $msg['receiver_id'] == $userId && !$msg['is_read'];
            })->count();

            return Inertia::render('Chat/Index', [
                'messages' => $messages->values(),
                'conversationUsers' => $conversationUsers,
                'unreadCount' => $unreadCount,
            ]);
        }

        // Local database (MySQL)
        $messages = ChatMessage::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Get unique conversation users
        $userIds = [];
        foreach ($messages as $msg) {
            if ($msg->sender_id != $userId) $userIds[] = $msg->sender_id;
            if ($msg->receiver_id != $userId) $userIds[] = $msg->receiver_id;
        }
        $userIds = array_unique($userIds);

        $conversationUsers = User::whereIn('id', $userIds)->get();

        // Get unread count
        $unreadCount = ChatMessage::where('receiver_id', $userId)
            ->where('is_read', false)
            ->count();

        return Inertia::render('Chat/Index', [
            'messages' => $messages,
            'conversationUsers' => $conversationUsers,
            'unreadCount' => $unreadCount,
        ]);
    }

    /**
     * Get messages with a specific user
     */
    public function conversation(Request $request, $userId)
    {
        $currentUser = Auth::user();
        $currentUserId = $currentUser->id;

        if (SupabaseHelper::useSupabase()) {
            $allMessages = SupabaseRepository::chatMessages()->get();

            $messages = $allMessages->filter(function($msg) use ($currentUserId, $userId) {
                return ($msg['sender_id'] == $currentUserId && $msg['receiver_id'] == $userId) ||
                       ($msg['sender_id'] == $userId && $msg['receiver_id'] == $currentUserId);
            })->sortBy('created_at')->values();

            // Mark messages as read
            foreach ($messages as $msg) {
                if ($msg['receiver_id'] == $currentUserId && !$msg['is_read']) {
                    SupabaseRepository::chatMessages()->update($msg['id'], ['is_read' => true]);
                }
            }

            $otherUser = SupabaseRepository::users()->get()->firstWhere('id', $userId);

            return response()->json([
                'messages' => $messages,
                'otherUser' => $otherUser,
            ]);
        }

        // Local database
        $messages = ChatMessage::where(function($query) use ($currentUserId, $userId) {
            $query->where('sender_id', $currentUserId)->where('receiver_id', $userId);
        })->orWhere(function($query) use ($currentUserId, $userId) {
            $query->where('sender_id', $userId)->where('receiver_id', $currentUserId);
        })->orderBy('created_at', 'asc')->get();

        // Mark as read
        ChatMessage::where('sender_id', $userId)
            ->where('receiver_id', $currentUserId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $otherUser = User::find($userId);

        return response()->json([
            'messages' => $messages,
            'otherUser' => $otherUser,
        ]);
    }

    /**
     * Send a message
     */
    public function send(Request $request)
    {
        // Ensure table exists
        $this->ensureChatTable();

        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        $currentUser = Auth::user();

        if (SupabaseHelper::useSupabase()) {
            SupabaseRepository::chatMessages()->create([
                'sender_id' => $currentUser->id,
                'receiver_id' => $request->input('receiver_id'),
                'message' => $request->input('message'),
                'is_read' => false,
            ]);
        } else {
            ChatMessage::create([
                'sender_id' => $currentUser->id,
                'receiver_id' => $request->input('receiver_id'),
                'message' => $request->input('message'),
                'is_read' => false,
            ]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Get all team members for chat
     */
    public function users(Request $request)
    {
        $currentUserId = Auth::id();

        if (SupabaseHelper::useSupabase()) {
            $users = SupabaseRepository::users()->all()
                ->filter(function($user) use ($currentUserId) {
                    return $user['id'] != $currentUserId;
                })
                ->values();

            return response()->json(['users' => $users]);
        }

        $users = User::where('id', '!=', $currentUserId)->get();

        return response()->json(['users' => $users]);
    }

    /**
     * Get unread count
     */
    public function unread()
    {
        $currentUserId = Auth::id();

        if (SupabaseHelper::useSupabase()) {
            $allMessages = SupabaseRepository::chatMessages()->get();
            $unreadCount = $allMessages->filter(function($msg) use ($currentUserId) {
                return $msg['receiver_id'] == $currentUserId && !$msg['is_read'];
            })->count();
        } else {
            $unreadCount = ChatMessage::where('receiver_id', $currentUserId)
                ->where('is_read', false)
                ->count();
        }

        return response()->json(['unreadCount' => $unreadCount]);
    }
}
