<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'employe_id',
        'salle_id',
        'date',
        'heure_debut',
        'duree_minutes',
        'heure_fin',
        'statut', // confirmee | annulee
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function employe()
    {
        return $this->belongsTo(Employe::class);
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }
}
