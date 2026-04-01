@extends('install.layout', ['step' => 1])

@section('content')
<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
    <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Willkommen beim {{ config('app.name', 'Dashboard') }}</h1>
        <p class="text-gray-600 max-w-md mx-auto">
            Die Installation dauert nur wenige Minuten. Richten Sie Ihre Datenbank ein und erstellen Sie Ihren Administrator-Account.
        </p>
    </div>

    @if($isInstalled)
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div class="flex items-center">
                <svg class="w-5 h-5 text-amber-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <div>
                    <p class="text-sm text-amber-800 font-medium">Bereits installiert</p>
                    <p class="text-sm text-amber-700">Das Dashboard ist bereits konfiguriert. Was möchten Sie tun?</p>
                </div>
            </div>
        </div>

        <div class="space-y-3">
            <a href="{{ route('install.index', ['mode' => 'repair']) }}" class="block w-full text-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                Installation reparieren (Datenbank bleibt erhalten)
            </a>
            <a href="/" class="block w-full text-center py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
                Zum Dashboard
            </a>
        </div>
    @else
        <div class="space-y-4">
            <div class="grid grid-cols-1 gap-4">
                <div class="border border-gray-200 rounded-lg p-4">
                    <h3 class="font-medium text-gray-900 mb-2">Datenbank-Optionen</h3>
                    <ul class="text-sm text-gray-600 space-y-1">
                        <li>MySQL / MariaDB</li>
                        <li>PostgreSQL</li>
                        <li>SQLite (einfachste Option)</li>
                        <li>Supabase (Cloud)</li>
                    </ul>
                </div>
                <div class="border border-gray-200 rounded-lg p-4">
                    <h3 class="font-medium text-gray-900 mb-2">Was wird benötigt?</h3>
                    <ul class="text-sm text-gray-600 space-y-1">
                        <li>Datenbank-Zugangsdaten</li>
                        <li>Administrator-E-Mail und Passwort</li>
                    </ul>
                </div>
            </div>

            <form action="{{ route('install.eula') }}" method="GET">
                <button type="submit" class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                    Installation starten
                </button>
            </form>
        </div>
    @endif
</div>
@endsection
