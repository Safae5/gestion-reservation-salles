<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employe extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero',
        'nom',
        'prenom',
        'departement',
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
