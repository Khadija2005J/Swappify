<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    use HasFactory;

    protected $fillable = [
        'swap_request_id',
        'rated_user_id',
        'rater_id',
        'score',
        'comment',
    ];

    public function ratedUser()
    {
        return $this->belongsTo(User::class, 'rated_user_id');
    }

    public function rater()
    {
        return $this->belongsTo(User::class, 'rater_id');
    }

    public function swapRequest()
    {
        return $this->belongsTo(SwapRequest::class);
    }
}
