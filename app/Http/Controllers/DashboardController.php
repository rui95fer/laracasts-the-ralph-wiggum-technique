<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard stats page.
     */
    public function stats(): Response
    {
        return Inertia::render('dashboard/Stats', [
            'totalUsers' => User::count(),
            'lastRefreshed' => now()->format('M d, Y g:i A'),
        ]);
    }
}
