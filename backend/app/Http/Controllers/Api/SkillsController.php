<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use App\Models\User;
use App\Models\SkillTemplate;
use Illuminate\Http\Request;

class SkillsController extends Controller{
    // Get all skills for logged-in user
    public function mySkills(Request $request)
    {
        $skills = $request->user()->skills;
        return response()->json($skills);
    }

    // Add a new skill
    public function addSkill(Request $request)
    {
        $request->validate([
            'skill_name' => 'required|string',
            'type' => 'required|in:knows,wants_to_learn',
        ]);

        $skill = $request->user()->skills()->create([
            'skill_name' => $request->skill_name,
            'type' => $request->type,
        ]);

        return response()->json($skill, 201);
    }

    // Get suggested matches
    public function matches(Request $request)
    {
        $user = $request->user();

        $myKnows = $user->skills()->where('type', 'knows')->pluck('skill_name');
        $myWants = $user->skills()->where('type', 'wants_to_learn')->pluck('skill_name');

        $matchedUsers = User::where('id', '!=', $user->id)
            ->whereHas('skills', function ($q) use ($myWants) {
                $q->whereIn('skill_name', $myWants)
                  ->where('type', 'knows');
            })
            ->whereHas('skills', function ($q) use ($myKnows) {
                $q->whereIn('skill_name', $myKnows)
                  ->where('type', 'wants_to_learn');
            })
            ->get();

        return response()->json($matchedUsers);
    }

    public function findSwap(Request $request){
    $request->validate([
        'teach' => 'required|string',
        'learn' => 'required|string',
    ]);

    $userId = $request->user()->id;
    $teachSkill = trim($request->teach);
    $learnSkill = trim($request->learn);

    // More flexible matching: find users who can help with learning and need help with teaching
    // Match 1: User knows what I want to learn (any type where they have the skill)
    // Match 2: User wants/needs what I can teach (any type where they have the skill)
    $matches = User::where('id', '!=', $userId)
        ->whereHas('skills', function ($q) use ($learnSkill) {
            // User has the skill I want to learn (case-insensitive)
            $q->whereRaw("LOWER(skill_name) = LOWER(?)", [$learnSkill]);
        })
        ->whereHas('skills', function ($q) use ($teachSkill) {
            // User has the skill I can teach (case-insensitive)
            $q->whereRaw("LOWER(skill_name) = LOWER(?)", [$teachSkill]);
        })
        ->get();

    return response()->json($matches);
    }

    public function deleteSkill(Request $request, $id){
    $skill = Skill::where('id', $id)
        ->where('user_id', $request->user()->id)
        ->firstOrFail();

    $skill->delete();

    return response()->json(['message' => 'Skill deleted']);
    }

    public function searchSkills(Request $request)
    {
        $q = $request->query('q', '');

        if (strlen($q) < 1) {
            return response()->json([]);
        }

        $skills = SkillTemplate::where('name', 'LIKE', $q . '%')
            ->orderBy('name')
            ->limit(10)
            ->get();

        return response()->json($skills);
    }
}