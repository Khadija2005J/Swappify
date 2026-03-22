<?php
use App\Http\Controllers\Api\SkillsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SwapRequestController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\SwapController;

Route::get('/users/featured', [AuthController::class, 'getFeaturedUsers']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::get('/settings', [AuthController::class, 'getSettings']);
    Route::put('/settings', [AuthController::class, 'updateSettings']);
    
    Route::get('/skills/search', [SkillsController::class, 'searchSkills']);
});

// Routes publiques pour voir les profils
Route::get('/user/{userId}', [ProfileController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/skills', [SkillsController::class, 'mySkills']);
    Route::post('/skills', [SkillsController::class, 'addSkill']);
    Route::get('/matches', [SkillsController::class, 'matches']);
    Route::post('/find-swap', [SkillsController::class, 'findSwap']);
    Route::post('/swap-request', [SwapRequestController::class, 'send']);
    Route::get('/swap-requests/incoming', [SwapRequestController::class, 'incoming']);
    Route::get('/swap-requests/sent', [SwapRequestController::class, 'sent']);
    Route::get('/swap-requests/partners', [SwapRequestController::class, 'partners']);
    Route::post('/swap-request/{id}/accept', [SwapRequestController::class, 'accept']);
    Route::post('/swap-request/{id}/reject', [SwapRequestController::class, 'reject']);
    Route::delete('/swap-request/{id}', [SwapRequestController::class, 'delete']);
    Route::delete('/skills/{id}', [SkillsController::class, 'deleteSkill']);
    
    // Routes profil
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/rate', [ProfileController::class, 'rate']);
    Route::delete('/ratings/{ratingId}', [ProfileController::class, 'deleteRating']);

    // Delete profile photo
    Route::post('/profile/photo/delete', [ProfileController::class, 'deletePhoto']);
    
    // Routes chat
    Route::get('/conversations', [ChatController::class, 'conversations']);
    Route::get('/notifications/messages-unread', [ChatController::class, 'unreadNotifications']);
    Route::get('/conversations/{conversationId}/messages', [ChatController::class, 'getMessages']);
    Route::post('/conversations/{conversationId}/messages', [ChatController::class, 'sendMessage']);
    Route::post('/conversations/start/{userId}', [ChatController::class, 'startOrGetConversation']);
});

Route::middleware('auth:sanctum')->get('/swap-session', [SwapController::class, 'getSwapSession']);