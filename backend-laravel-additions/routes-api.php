<?php
// Copier ce fichier dans backend/routes/api.php (remplacer le contenu existant)
// N'oublie pas d'activer la ligne api: __DIR__.'/../routes/api.php' dans bootstrap/app.php (Laravel 11)

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SalleController;
use App\Http\Controllers\Api\EmployeController;
use App\Http\Controllers\Api\ReservationController;
use Illuminate\Support\Facades\Route;

// --- Authentification (public) ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- Routes protegees (necessitent un token Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('salles', SalleController::class);
    Route::apiResource('employes', EmployeController::class);
    Route::apiResource('reservations', ReservationController::class);

    // Verification de disponibilite d'une salle sans creer la reservation
    Route::post('/salles/{salle}/verifier-disponibilite', [ReservationController::class, 'verifierDisponibilite']);
});
