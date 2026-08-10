<?php

use App\Models\User;

it('creates a user with a factory and persists it to the database', function () {
    $user = User::factory()->create();

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'email' => $user->email,
    ]);
});
