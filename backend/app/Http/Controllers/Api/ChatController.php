<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController
{
    public function conversations()
    {
        $user = Auth::user();
        
        $conversations = Conversation::where('user_id_1', $user->id)
            ->orWhere('user_id_2', $user->id)
            ->with(['user1', 'user2', 'messages' => function ($q) {
                $q->latest()->limit(1);
            }])
            ->latest('updated_at')
            ->get()
            ->map(function (Conversation $conv) use ($user) {
                $unreadCount = $conv->messages()
                    ->whereNull('read_at')
                    ->where('sender_id', '!=', $user->id)
                    ->count();

                return [
                    'id' => $conv->id,
                    'other_user' => $conv->getOtherUser($user->id),
                    'last_message' => $conv->messages->first(),
                    'unread_count' => $unreadCount,
                ];
            });

        return response()->json($conversations);
    }

    public function getMessages($conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);
        $user = Auth::user();

        if ($conversation->user_id_1 != $user->id && $conversation->user_id_2 != $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = $conversation->messages()->with('sender')->get();
        return response()->json($messages);
    }

    public function sendMessage(Request $request, $conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);
        $user = Auth::user();

        if ($conversation->user_id_1 != $user->id && $conversation->user_id_2 != $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message = Message::create([
            'conversation_id' => $conversationId,
            'sender_id' => $user->id,
            'body' => $request->input('body'),
        ]);

        $conversation->touch();

        return response()->json($message->load('sender'), 201);
    }

    public function startOrGetConversation($userId)
    {
        $user = Auth::user();

        if ($user->id == $userId) {
            return response()->json(['error' => 'Cannot chat with yourself'], 400);
        }

        $conversation = Conversation::where(function ($q) use ($user, $userId) {
            $q->where('user_id_1', $user->id)->where('user_id_2', $userId);
        })->orWhere(function ($q) use ($user, $userId) {
            $q->where('user_id_1', $userId)->where('user_id_2', $user->id);
        })->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'user_id_1' => $user->id,
                'user_id_2' => $userId,
            ]);
        }

        return response()->json($conversation);
    }

    public function unreadNotifications()
    {
        $user = Auth::user();

        $conversations = Conversation::where('user_id_1', $user->id)
            ->orWhere('user_id_2', $user->id)
            ->with(['user1', 'user2'])
            ->get();

        $notifications = $conversations->map(function (Conversation $conversation) use ($user) {
            $unreadMessagesQuery = $conversation->messages()
                ->where('sender_id', '!=', $user->id)
                ->whereNull('read_at');

            $unreadCount = $unreadMessagesQuery->count();

            if ($unreadCount === 0) {
                return null;
            }

            $lastUnreadMessage = $unreadMessagesQuery
                ->with('sender')
                ->latest('created_at')
                ->first();

            $otherUser = $conversation->getOtherUser($user->id);

            return [
                'id' => 'message-' . $conversation->id,
                'type' => 'message',
                'conversation_id' => $conversation->id,
                'other_user_id' => $otherUser?->id,
                'other_user_name' => $otherUser?->name,
                'title' => 'New message',
                'message' => ($otherUser?->name ?? 'Someone') . ($unreadCount > 1 ? " sent {$unreadCount} unread messages" : ' sent you a message'),
                'preview' => $lastUnreadMessage?->body,
                'timestamp' => $lastUnreadMessage?->created_at,
                'unread_count' => $unreadCount,
                'read' => false,
            ];
        })->filter()->values();

        return response()->json([
            'total_unread' => $notifications->sum('unread_count'),
            'notifications' => $notifications,
        ]);
    }
}
