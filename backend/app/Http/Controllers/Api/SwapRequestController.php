<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SwapRequest;
use Illuminate\Http\Request;

class SwapRequestController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'teach_skill' => 'required|string',
            'learn_skill' => 'required|string',
        ]);

        $existingPending = SwapRequest::where('sender_id', $request->user()->id)
            ->where('receiver_id', $request->receiver_id)
            ->where('teach_skill', $request->teach_skill)
            ->where('learn_skill', $request->learn_skill)
            ->where('status', 'pending')
            ->first();

        if ($existingPending) {
            return response()->json([
                'message' => 'You already sent this swap request and it is still pending.'
            ], 409);
        }

        $swap = SwapRequest::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $request->receiver_id,
            'teach_skill' => $request->teach_skill,
            'learn_skill' => $request->learn_skill,
        ]);

        return response()->json($swap, 201);
    }

    public function incoming(Request $request){
    return response()->json(
        $request->user()->receivedRequests()
            ->whereIn('status', ['pending', 'accepted'])  
            ->with('sender')
            ->get()
    );
   }

    public function sent(Request $request)
{
    return response()->json(
        $request->user()->sentRequests()
            ->whereIn('status', ['pending', 'accepted']) 
            ->with('receiver')
            ->get()
    );
}

    public function partners(Request $request)
    {
        $userId = $request->user()->id;

        $acceptedSwaps = SwapRequest::where('status', 'accepted')
            ->where(function ($query) use ($userId) {
                $query->where('sender_id', $userId)
                    ->orWhere('receiver_id', $userId);
            })
            ->with(['sender', 'receiver'])
            ->latest('updated_at')
            ->get();

        $partners = $acceptedSwaps
            ->groupBy(function ($swap) use ($userId) {
                return $swap->sender_id === $userId ? $swap->receiver_id : $swap->sender_id;
            })
            ->map(function ($swapsWithPartner) use ($userId) {
                $latestSwap = $swapsWithPartner->first();
                $partner = $latestSwap->sender_id === $userId ? $latestSwap->receiver : $latestSwap->sender;

                if (!$partner) {
                    return null;
                }

                return [
                    'id' => $partner->id,
                    'name' => $partner->name,
                    'email' => $partner->email,
                    'profile_photo_url' => $partner->photo ? asset($partner->photo) : null,
                    'photo_url' => $partner->photo ? asset($partner->photo) : null,
                    'swap_request_id' => $latestSwap->id,
                    'teach_skill' => $latestSwap->teach_skill,
                    'learn_skill' => $latestSwap->learn_skill,
                    'accepted_at' => $latestSwap->updated_at,
                ];
            })
            ->filter()
            ->values();

        return response()->json($partners);
    }


    public function accept(Request $request, $id)
    {
        $swap = SwapRequest::where('id', $id)
            ->where('receiver_id', $request->user()->id)
            ->firstOrFail();

        $swap->update(['status' => 'accepted']);

        return response()->json(
    $swap->load('sender', 'receiver')
);

    }

    public function reject(Request $request, $id)
    {
        $swap = SwapRequest::where('id', $id)
            ->where('receiver_id', $request->user()->id)
            ->firstOrFail();

        $swap->update(['status' => 'rejected']);

        return response()->json($swap);
    }

    public function delete(Request $request, $id)
    {
        $swap = SwapRequest::where('id', $id)
            ->where('sender_id', $request->user()->id)
            ->firstOrFail();

        if ($swap->status !== 'pending') {
            return response()->json(['message' => 'You can only delete pending swap requests'], 400);
        }

        $swap->delete();

        return response()->json(['message' => 'Swap request deleted successfully']);
    }
}

