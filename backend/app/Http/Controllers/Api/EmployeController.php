<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employe;
use Illuminate\Http\Request;

class EmployeController extends Controller
{
    public function index()
    {
        return response()->json(Employe::orderBy('nom')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'numero' => 'required|string|max:20|unique:employes',
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'departement' => 'required|string|max:100',
        ]);

        return response()->json(Employe::create($data), 201);
    }

    public function show(Employe $employe)
    {
        return response()->json($employe->load('reservations'));
    }

    public function update(Request $request, Employe $employe)
    {
        $data = $request->validate([
            'numero' => 'sometimes|string|max:20|unique:employes,numero,' . $employe->id,
            'nom' => 'sometimes|string|max:100',
            'prenom' => 'sometimes|string|max:100',
            'departement' => 'sometimes|string|max:100',
        ]);

        $employe->update($data);

        return response()->json($employe);
    }

    public function destroy(Employe $employe)
    {
        $employe->delete();

        return response()->json(null, 204);
    }
}
