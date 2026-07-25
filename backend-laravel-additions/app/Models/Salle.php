<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salle extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero',
        'capacite',
        'type', // salle_conference | bureau | salle_formation
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
