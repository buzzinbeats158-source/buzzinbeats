#!/usr/bin/env php
<?php
// Run as: php create-staging-user.php
// from /var/www/buzzinbeats-staging

chdir('/var/www/buzzinbeats-staging');
require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$app->boot();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'admin@staging.test';

$existing = User::where('email', $email)->first();
if ($existing) {
    $existing->update([
        'password'          => Hash::make('Staging@123'),
        'email_verified_at' => now(),
    ]);
    echo "Updated existing user: " . $email . "\n";
} else {
    $u = User::create([
        'name'               => 'Staging Admin',
        'email'              => $email,
        'password'           => Hash::make('Staging@123'),
        'email_verified_at'  => now(),
        'role'               => 'admin',
    ]);
    echo "Created user: " . $u->email . "\n";
}

echo "Login at: https://staging.buzzinbeats.com\n";
echo "Email:    admin@staging.test\n";
echo "Password: Staging@123\n";
