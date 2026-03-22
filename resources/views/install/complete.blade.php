@extends('install.layout', ['step' => 7])

@section('content')
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div class="text-center">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>

            <h1 class="text-2xl font-bold text-gray-900 mb-2">Installation erfolgreich!</h1>
            <p class="text-gray-600 mb-8">
                {{ config('app.name', 'Dashboard') }} wurde erfolgreich installiert. Sie können sich jetzt mit Ihrem Admin-Account anmelden.
            </p>

            <div class="bg-gray-50 rounded-lg p-4 mb-8 text-left max-w-md mx-auto">
                <h3 class="font-medium text-gray-900 mb-2">Nächste Schritte:</h3>
                <ul class="text-sm text-gray-600 space-y-2">
                    <li class="flex items-center">
                        <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Datenbank eingerichtet
                    </li>
                    <li class="flex items-center">
                        <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Admin-Account erstellt
                    </li>
                    <li class="flex items-center">
                        <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Migrationen ausgeführt
                    </li>
                </ul>
            </div>

            <a href="/login" class="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                Zum Login
            </a>
        </div>
    </div>
@endsection
