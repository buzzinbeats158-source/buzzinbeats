<?php
/**
 * DANGER: This is a temporary recovery script.
 * It will drop the ghost table, run migrations, and clear cache.
 */

// Move to the application root
chdir('/var/www/buzzinbeats');

// Load Laravel
require '/var/www/buzzinbeats/vendor/autoload.php';
$app = require_once '/var/www/buzzinbeats/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;

echo "--- BUZZINBEATS PRODUCTION RECOVERY ---\n";

try {
    echo "1. Dropping ghost table 'analytics_events'...\n";
    Schema::dropIfExists('analytics_events');
    echo "   [OK]\n";

    echo "2. Running migrations...\n";
    Artisan::call('migrate', ['--force' => true]);
    echo Artisan::output();
    echo "   [OK]\n";

    echo "3. Clearing optimization cache...\n";
    Artisan::call('optimize:clear');
    echo Artisan::output();
    echo "   [OK]\n";

    echo "\n--- ALL OPERATIONS COMPLETE ---\n";
} catch (\Exception $e) {
    echo "\n!!! ERROR during recovery: " . $e->getMessage() . "\n";
    exit(1);
}
