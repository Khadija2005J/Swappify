<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Rating;
use App\Models\SwapRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Database\Query\Exception as QueryException;

class ProfileController extends Controller
{
    public function show($userId)
    {
        $user = User::with('skills', 'ratingsReceived.rater')->findOrFail($userId);
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'education' => $user->education,
            'bio' => $user->bio,
            'rating_avg' => $user->rating_avg,
            'rating_count' => $user->rating_count,
            'skills' => $user->skills,
            'profile_photo_url' => $user->photo ? asset($user->photo) : null,
            'photo_url' => $user->photo ? asset($user->photo) : null,
            'ratings' => $user->ratingsReceived->map(function($rating) {
                return [
                    'id' => $rating->id,
                    'score' => $rating->score,
                    'comment' => $rating->comment,
                    'rater' => [
                        'id' => $rating->rater->id,
                        'name' => $rating->rater->name,
                    ],
                    'created_at' => $rating->created_at,
                ];
            }),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'phone' => 'nullable|string|max:20',
            'education' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:500',
            'skills' => 'nullable|array',
            'skills.*.name' => 'required|string|max:255',
            'skills.*.level' => 'required|integer|min:0|max:100',
            'skills.*.type' => 'required|in:knows,wants_to_learn',
            'photo' => 'nullable|file|max:2048',
            'profile_photo' => 'nullable|file|max:2048',
        ]);

        // Update skills
        if (isset($validated['skills']) && is_array($validated['skills'])) {
            $user->skills()->delete(); // Clear existing skills
            foreach ($validated['skills'] as $skill) {
                $user->skills()->create([
                    'skill_name' => $skill['name'],
                    'level' => $skill['level'] ?? 50,
                    'type' => $skill['type'],
                ]);
            }
        }

        // Update simple fields
        $simple = $validated;
        unset($simple['photo'], $simple['profile_photo'], $simple['skills']);
        $user->update($simple);

        // Handle photo upload separately so we store it on the public disk
        // Prefer 'profile_photo' if provided, otherwise 'photo'
        $fileKey = $request->hasFile('profile_photo') ? 'profile_photo' : ($request->hasFile('photo') ? 'photo' : null);
        if ($fileKey) {
            try {
                $file = $request->file($fileKey);

                // Store in public/profile_photos so asset() can serve directly without storage:link
                $ext = strtolower($file->getClientOriginalExtension() ?? 'jpg');
                $filename = time() . '_' . Str::random(8) . '.' . $ext;
                $relativePath = 'profile_photos/' . $filename;
                $publicDir = public_path('profile_photos');
                if (! is_dir($publicDir)) { @mkdir($publicDir, 0755, true); }

                try {
                    $moved = $file->move($publicDir, $filename);
                    $fullPath = $moved->getPathname();
                } catch (\Exception $moveEx) {
                    $contents = @file_get_contents($file->getRealPath());
                    if ($contents === false) {
                        return response()->json(['message' => 'Could not read uploaded file.'], 500);
                    }
                    $fullPath = $publicDir . DIRECTORY_SEPARATOR . $filename;
                    if (! is_dir(dirname($fullPath))) { @mkdir(dirname($fullPath), 0755, true); }
                    $written = @file_put_contents($fullPath, $contents);
                    if ($written === false) {
                        return response()->json(['message' => 'Could not save uploaded file.'], 500);
                    }
                }

                // Validate uploaded file using image headers (getimagesize)
                $isImage = false;
                try {
                    $info = @getimagesize($fullPath);
                    if ($info && isset($info[2]) && in_array($info[2], [IMAGETYPE_GIF, IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) {
                        $isImage = true;
                    }
                } catch (\Throwable $_e) {
                    $isImage = false;
                }

                if (! $isImage) {
                    // remove invalid file
                    if (is_file($fullPath)) {@unlink($fullPath);} 
                    return response()->json(['message' => 'The profile photo field must be a valid image file.'], 422);
                }

                // remove old photo if exists (only if column exists)
                if (Schema::hasColumn('users', 'photo') && $user->photo) {
                    $oldFull = public_path($user->photo);
                    if (is_file($oldFull)) {@unlink($oldFull);} 
                }

                // Ensure 'photo' column exists (SQLite doesn't support AFTER(), avoid using it)
                if (! Schema::hasColumn('users', 'photo')) {
                    Schema::table('users', function ($table) {
                        $table->string('photo')->nullable();
                    });
                }

                // Save path
                $user->photo = $relativePath;
                $user->save();
            } catch (\Exception $e) {
                // Catch common errors and return friendly message
                $msg = $e->getMessage();
                if (stripos($msg, 'Unable to guess the MIME type') !== false || stripos($msg, 'no guessers are available') !== false) {
                    return response()->json(['message' => 'Unable to process image upload because PHP fileinfo extension is disabled. Please enable php_fileinfo (see README).'], 500);
                }
                return response()->json(['message' => 'Error processing uploaded file: ' . $e->getMessage()], 500);
            }
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load('skills')->toArray(),
            'skills' => $user->skills,
            'photo_url' => $user->photo ? asset($user->photo) : null,
        ]);
    }

    public function rate(Request $request)
    {
        $validated = $request->validate([
            'swap_request_id' => 'required|exists:swap_requests,id',
            'rated_user_id' => 'required|exists:users,id',
            'score' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:500',
        ]);

        $userId = $request->user()->id;

        if ((int) $validated['rated_user_id'] === (int) $userId) {
            return response()->json(['message' => 'You cannot rate yourself.'], 422);
        }

        $swapRequest = SwapRequest::findOrFail($validated['swap_request_id']);

        $isParticipant = ((int) $swapRequest->sender_id === (int) $userId)
            || ((int) $swapRequest->receiver_id === (int) $userId);

        if (! $isParticipant) {
            return response()->json(['message' => 'You are not part of this swap.'], 403);
        }

        if ($swapRequest->status !== 'accepted') {
            return response()->json(['message' => 'You can only rate accepted swaps.'], 422);
        }

        $partnerId = (int) $swapRequest->sender_id === (int) $userId
            ? (int) $swapRequest->receiver_id
            : (int) $swapRequest->sender_id;

        if ((int) $validated['rated_user_id'] !== $partnerId) {
            return response()->json(['message' => 'You can only rate your swap partner.'], 422);
        }

        $existing = Rating::where('swap_request_id', $validated['swap_request_id'])
            ->where('rater_id', $userId)
            ->where('rated_user_id', $validated['rated_user_id'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already rated this user for this swap'], 400);
        }

        $rating = Rating::create([
            'swap_request_id' => $validated['swap_request_id'],
            'rated_user_id' => $validated['rated_user_id'],
            'rater_id' => $userId,
            'score' => $validated['score'],
            'comment' => $validated['comment'],
        ]);

        $this->updateUserRating($validated['rated_user_id']);

        return response()->json([
            'message' => 'Rating submitted successfully',
            'rating' => $rating,
        ]);
    }

    public function deletePhoto(Request $request)
    {
        $user = $request->user();
        // If the column doesn't exist (migration not run), return success without error
        if (! Schema::hasColumn('users', 'photo')) {
            return response()->json([
                'message' => 'Photo removed',
                'photo_url' => null,
                'profile_photo_url' => null,
            ]);
        }

        // Handle profile picture removal
        if ($request->has('remove_profile_photo') && $request->remove_profile_photo) {
            if ($user->photo) {
                $oldPhotoPath = public_path($user->photo);
                if (file_exists($oldPhotoPath)) {
                    @unlink($oldPhotoPath);
                }
                $user->photo = null;
                $user->save();
            }
        }

        return response()->json([
            'message' => 'Photo removed',
            'photo_url' => null,
            'profile_photo_url' => null,
        ]);
    }

    public function deleteRating(Request $request, $ratingId)
    {
        $rating = Rating::findOrFail($ratingId);
        
        // Only the person who made the rating can delete it
        if ($rating->rater_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $ratedUserId = $rating->rated_user_id;
        $rating->delete();
        
        // Update the rated user's rating stats
        $this->updateUserRating($ratedUserId);
        
        return response()->json(['message' => 'Rating deleted successfully']);
    }

    private function updateUserRating($userId)
    {
        $ratings = Rating::where('rated_user_id', $userId)->get();
        
        if ($ratings->count() > 0) {
            $avgScore = $ratings->avg('score');
            $user = User::find($userId);
            $user->update([
                'rating_avg' => round($avgScore, 2),
                'rating_count' => $ratings->count(),
            ]);
        } else {
            // No ratings left, reset to 0
            $user = User::find($userId);
            $user->update([
                'rating_avg' => 0,
                'rating_count' => 0,
            ]);
        }
    }
}
