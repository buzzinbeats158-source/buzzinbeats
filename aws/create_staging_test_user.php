<?php
chdir('/var/www/buzzinbeats-staging');
require '/var/www/buzzinbeats-staging/vendor/autoload.php';
$app = require_once '/var/www/buzzinbeats-staging/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

try {
    $user = User::updateOrCreate(
        ['email' => 'buzzinglocal8000@buzzinbeats.com'],
        [
            'name' => 'Staging Test User',
            'password' => Hash::make('10Logitech158'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]
    );
    echo "USER_SYNC_SUCCESS: " . $user->email . "\n";
} catch (\Exception $e) {
    echo "USER_SYNC_ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
