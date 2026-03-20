<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    /**
     * Ensure chat table exists
     */
    private function ensureChatTable()
    {
        try {
            if (Schema::hasTable('chat_messages')) {
                return;
            }
        } catch (\Exception $e) {
            \Log::error('Chat table check error: ' . $e->getMessage());
            return;
        }

        try {
            Schema::create('chat_messages', function (\Illuminate\Database\Schema\Blueprint $table) {
                $table->id();
                $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
                $table->text('message');
                $table->boolean('is_read')->default(false);
                $table->timestamps();
            });
        } catch (\Exception $e) {
            \Log::error('Chat table creation error: ' . $e->getMessage());
        }
    }

    /**
     * Show chat page - returns JSON for API calls
     */
    public function index(Request $request)
    {
        // Ensure table exists
        $this->ensureChatTable();

        $currentUser = Auth::user();
        $userId = $currentUser->id;

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

        // Always return JSON (for floating chat button)
        return response()->json([
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

        ChatMessage::create([
            'sender_id' => $currentUser->id,
            'receiver_id' => $request->input('receiver_id'),
            'message' => $request->input('message'),
            'is_read' => false,
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Get all team members for chat
     */
    public function users(Request $request)
    {
        $currentUserId = Auth::id();

        $users = User::where('id', '!=', $currentUserId)->get();

        return response()->json(['users' => $users]);
    }

    /**
     * Get unread count
     */
    public function unread()
    {
        $currentUserId = Auth::id();

        $unreadCount = ChatMessage::where('receiver_id', $currentUserId)
            ->where('is_read', false)
            ->count();

        return response()->json(['unreadCount' => $unreadCount]);
    }

    /**
     * Setup chat - create table if not exists
     */
    public function setup()
    {
        $this->ensureChatTable();
        return response()->json(['success' => true, 'message' => 'Chat table ready']);
    }
}
