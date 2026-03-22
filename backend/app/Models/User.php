<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'education',
        'bio',
        'photo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function skills()
{
    return $this->hasMany(\App\Models\Skill::class);
}
public function sentRequests()
{
    return $this->hasMany(\App\Models\SwapRequest::class, 'sender_id');
}

public function receivedRequests()
{
    return $this->hasMany(\App\Models\SwapRequest::class, 'receiver_id');
}

public function ratingsReceived()
{
    return $this->hasMany(\App\Models\Rating::class, 'rated_user_id');
}

public function ratingsGiven()
{
    return $this->hasMany(\App\Models\Rating::class, 'rater_id');
}

}
