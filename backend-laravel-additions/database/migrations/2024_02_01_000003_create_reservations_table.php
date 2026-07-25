<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employe_id')->constrained('employes')->cascadeOnDelete();
            $table->foreignId('salle_id')->constrained('salles')->cascadeOnDelete();
            $table->date('date');
            $table->time('heure_debut');
            $table->unsignedInteger('duree_minutes');
            $table->time('heure_fin'); // calculee cote backend = heure_debut + duree_minutes
            $table->string('statut', 20)->default('confirmee'); // confirmee, annulee
            $table->timestamps();

            $table->index(['salle_id', 'date']); // optimise la recherche de conflits
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
