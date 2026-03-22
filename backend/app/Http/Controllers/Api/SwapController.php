<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SwapController extends Controller
{
    public function getSwapSession(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated.',
            ], 401);
        }

        // Simulate local and remote user data
        $localUser = [
            'name' => $user->name,
            'teaching' => 'React',
            'avatar' => $user->profile_photo_url,
        ];

        $remoteUser = [
            'name' => 'Alex_Eng',
            'teaching' => 'Prolog',
            'avatar' => '/remote-avatar.png',
        ];

        $chatHistory = [
            [
                'sender' => 'Alex_Eng',
                'text' => 'Can you explain the useEffect hook again?'
            ],
            [
                'sender' => $user->name,
                'text' => 'Sure! It\'s for side effects in functional components.'
            ]
        ];

        return response()->json([
            'localUser' => $localUser,
            'remoteUser' => $remoteUser,
            'chatHistory' => $chatHistory,
        ]);
    }
}