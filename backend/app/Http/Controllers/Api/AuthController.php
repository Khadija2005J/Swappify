<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
            'g-recaptcha-response' => 'required',
        ]);

        if (!$this->verifyCaptcha($request->input('g-recaptcha-response'))) {
            return response()->json(['message' => 'Captcha verification failed'], 422);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $userData = $user->toArray();
        $userData['profile_photo_url'] = $user->photo ? asset($user->photo) : null;
        $userData['photo_url'] = $user->photo ? asset($user->photo) : null;

        return response()->json([
            'user' => $userData,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'g-recaptcha-response' => 'required',
        ]);

        if (!$this->verifyCaptcha($request->input('g-recaptcha-response'))) {
            return response()->json(['message' => 'Captcha verification failed'], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $userData = $user->toArray();
        $userData['profile_photo_url'] = $user->photo ? asset($user->photo) : null;
        $userData['photo_url'] = $user->photo ? asset($user->photo) : null;

        return response()->json([
            'user' => $userData,
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('skills');
        $userData = $user->toArray();
        $userData['profile_photo_url'] = $user->photo ? asset($user->photo) : null;
        $userData['photo_url'] = $user->photo ? asset($user->photo) : null;
        return response()->json($userData);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out'
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        // Check current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 401);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'Password changed successfully'
        ]);
    }

    public function getSettings(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'notify_new_requests' => $user->notify_new_requests,
            'notify_messages' => $user->notify_messages,
            'profile_public' => $user->profile_public,
            'show_in_search' => $user->show_in_search,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'notify_new_requests' => 'boolean',
            'notify_messages' => 'boolean',
            'profile_public' => 'boolean',
            'show_in_search' => 'boolean',
        ]);

        $user = $request->user();
        $user->update($request->all());

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => [
                'notify_new_requests' => $user->notify_new_requests,
                'notify_messages' => $user->notify_messages,
                'profile_public' => $user->profile_public,
                'show_in_search' => $user->show_in_search,
            ]
        ]);
    }

    public function getFeaturedUsers()
{
    // Fetch 10 users with their skills
    // We eager load 'skills' to keep the masterpiece performant
    $users = User::with('skills')->latest()->take(10)->get();

    $formattedUsers = $users->map(function ($user) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'rating_avg' => $user->rating_avg ?? 0,
            'rating_count' => $user->rating_count ?? 0,
            // Asset() ensures the React frontend gets a full http://... link
            'profile_photo_url' => $user->photo ? asset('storage/' . $user->photo) : null,
            'skills' => $user->skills,
        ];
    });

    return response()->json($formattedUsers);
}

    private function verifyCaptcha($response)
    {
        $secret = env('RECAPTCHA_SECRET_KEY');
        $url = 'https://www.google.com/recaptcha/api/siteverify';
        $data = [
            'secret' => $secret,
            'response' => $response
        ];
        $options = [
            'http' => [
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'method' => 'POST',
                'content' => http_build_query($data)
            ]
        ];
        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        $resultJson = json_decode($result);
        return $resultJson->success;
    }
}

