<?php

namespace App\Services;

use App\Models\Reservation;
use Carbon\Carbon;

/**
 * Service central qui applique les regles de gestion du cahier des charges :
 * - Une salle ne peut etre reservee que si elle est disponible (pas de conflit)
 * - Un employe ne peut pas avoir 2 reservations qui se chevauchent sur la meme salle
 */
class DisponibiliteService
{
    /**
     * Verifie si une salle est disponible sur le creneau demande.
     * Retourne true si DISPONIBLE, false si CONFLIT.
     */
    public function estDisponible(int $salleId, string $date, string $heureDebut, int $dureeMinutes, ?int $ignorerReservationId = null): bool
    {
        $heureFin = $this->calculerHeureFin($heureDebut, $dureeMinutes);

        $query = Reservation::where('salle_id', $salleId)
            ->where('date', $date)
            ->where('statut', 'confirmee')
            ->where(function ($q) use ($heureDebut, $heureFin) {
                // Chevauchement si : debut_existant < fin_demande ET fin_existant > debut_demande
                $q->where('heure_debut', '<', $heureFin)
                  ->where('heure_fin', '>', $heureDebut);
            });

        if ($ignorerReservationId) {
            $query->where('id', '!=', $ignorerReservationId);
        }

        return $query->doesntExist();
    }

    public function calculerHeureFin(string $heureDebut, int $dureeMinutes): string
    {
        return Carbon::createFromFormat('H:i', $heureDebut)
            ->addMinutes($dureeMinutes)
            ->format('H:i');
    }
}
