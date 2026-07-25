<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Salle;
use App\Services\DisponibiliteService;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function __construct(protected DisponibiliteService $disponibiliteService)
    {
    }

    public function index()
    {
        return response()->json(
            Reservation::with(['employe', 'salle'])->orderBy('date', 'desc')->orderBy('heure_debut')->get()
        );
    }

    /**
     * Regle de gestion appliquee ici :
     * - une salle ne peut etre reservee que si elle est disponible (pas de conflit)
     * - un employe ne peut pas reserver 2 fois la meme salle sur un creneau qui se chevauche
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'employe_id' => 'required|exists:employes,id',
            'salle_id' => 'required|exists:salles,id',
            'date' => 'required|date',
            'heure_debut' => 'required|date_format:H:i',
            'duree_minutes' => 'required|integer|min:15|max:480',
        ]);

        $disponible = $this->disponibiliteService->estDisponible(
            $data['salle_id'],
            $data['date'],
            $data['heure_debut'],
            $data['duree_minutes']
        );

        if (!$disponible) {
            return response()->json([
                'message' => 'Cette salle est deja reservee sur ce creneau horaire.',
            ], 409); // 409 Conflict
        }

        $heureFin = $this->disponibiliteService->calculerHeureFin($data['heure_debut'], $data['duree_minutes']);

        $reservation = Reservation::create([
            ...$data,
            'heure_fin' => $heureFin,
            'statut' => 'confirmee',
        ]);

        return response()->json($reservation->load(['employe', 'salle']), 201);
    }

    public function show(Reservation $reservation)
    {
        return response()->json($reservation->load(['employe', 'salle']));
    }

    public function update(Request $request, Reservation $reservation)
    {
        $data = $request->validate([
            'statut' => 'nullable|in:confirmee,annulee',
        ]);

        $reservation->update($data);

        return response()->json($reservation);
    }

    public function destroy(Reservation $reservation)
    {
        $reservation->delete();

        return response()->json(null, 204);
    }

    /**
     * Endpoint dedie pour verifier la disponibilite AVANT de creer la reservation
     * POST /api/salles/{salle}/verifier-disponibilite  { date, heure_debut, duree_minutes }
     */
    public function verifierDisponibilite(Request $request, Salle $salle)
    {
        $data = $request->validate([
            'date' => 'required|date',
            'heure_debut' => 'required|date_format:H:i',
            'duree_minutes' => 'required|integer|min:15|max:480',
        ]);

        $disponible = $this->disponibiliteService->estDisponible(
            $salle->id,
            $data['date'],
            $data['heure_debut'],
            $data['duree_minutes']
        );

        return response()->json(['disponible' => $disponible]);
    }
}
