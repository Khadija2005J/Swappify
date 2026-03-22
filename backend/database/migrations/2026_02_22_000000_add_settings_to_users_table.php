<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Notification preferences
            $table->boolean('notify_new_requests')->default(true)->after('photo');
            $table->boolean('notify_messages')->default(true)->after('notify_new_requests');
            
            // Privacy settings
            $table->boolean('profile_public')->default(true)->after('notify_messages');
            $table->boolean('show_in_search')->default(true)->after('profile_public');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['notify_new_requests', 'notify_messages', 'profile_public', 'show_in_search']);
        });
    }
};
