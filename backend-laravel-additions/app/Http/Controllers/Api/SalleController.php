<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Salle;
use Illuminate\Http\Request;

class SalleController extends Controller
{
    public function index()
    {
        return response()->json(Salle::orderBy('numero')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'numero' => 'required|string|max:20|unique:salles',
            'capacite' => 'required|integer|min:1',
            'type' => 'required|in:salle_conference,bureau,salle_formation',
        ]);

        return response()->json(Salle::create($data), 201);
    }

    public function show(Salle $salle)
    {
        return response()->json($salle->load('reservations'));
    }

    public function update(Request $request, Salle $salle)
    {
        $data = $request->validate([
            'numero' => 'sometimes|string|max:20|unique:salles,numero,' . $salle->id,
            'capacite' => 'sometimes|integer|min:1',
            'type' => 'sometimes|in:salle_conference,bureau,salle_formation',
        ]);

        $salle->update($data);

        return response()->json($salle);
    }

    public function destroy(Salle $salle)
    {
        $salle->delete();

        return response()->json(null, 204);
    }
}
