<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = ['user_id_1', 'user_id_2'];

    public function user1()
    {
        return $this->belongsTo(User::class, 'user_id_1');
    }

    public function user2()
    {
        return $this->belongsTo(User::class, 'user_id_2');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function getOtherUser($userId)
    {
        return $this->user_id_1 == $userId ? $this->user2 : $this->user1;
    }
}
