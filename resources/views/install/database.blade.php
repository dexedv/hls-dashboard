@extends('install.layout', ['step' => 4])

@section('content')
    <form action="{{ route('install.database.save') }}" method="POST" class="space-y-6">
        @csrf

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 class="text-xl font-bold text-gray-900 mb-6">Datenbank-Konfiguration</h1>

            <!-- Database Type Selection -->
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-3">Datenbank-Typ</label>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <label class="cursor-pointer">
                        <input type="radio" name="db_type" value="mysql" class="peer sr-only" checked onchange="toggleDbFields()">
                        <div class="p-3 border-2 border-gray-200 rounded-lg text-center peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors">
                            <svg class="w-8 h-8 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
                            </svg>
                            <span class="text-sm font-medium">MySQL</span>
                        </div>
                    </label>
                    <label class="cursor-pointer">
                        <input type="radio" name="db_type" value="postgresql" class="peer sr-only" onchange="toggleDbFields()">
                        <div class="p-3 border-2 border-gray-200 rounded-lg text-center peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors">
                            <svg class="w-8 h-8 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
                            </svg>
                            <span class="text-sm font-medium">PostgreSQL</span>
                        </div>
                    </label>
                    <label class="cursor-pointer">
                        <input type="radio" name="db_type" value="sqlite" class="peer sr-only" onchange="toggleDbFields()">
                        <div class="p-3 border-2 border-gray-200 rounded-lg text-center peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors">
                            <svg class="w-8 h-8 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span class="text-sm font-medium">SQLite</span>
                        </div>
                    </label>
                    <label class="cursor-pointer">
                        <input type="radio" name="db_type" value="supabase" class="peer sr-only" onchange="toggleDbFields()">
                        <div class="p-3 border-2 border-gray-200 rounded-lg text-center peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-300 transition-colors">
                            <svg class="w-8 h-8 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
                            </svg>
                            <span class="text-sm font-medium">Supabase</span>
                        </div>
                    </label>
                </div>
            </div>

            <!-- MySQL/PostgreSQL Fields -->
            <div id="sql-fields" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="db_host" class="block text-sm font-medium text-gray-700 mb-1">Host</label>
                        <input type="text" id="db_host" name="db_host" value="{{ old('db_host', '127.0.0.1') }}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="127.0.0.1">
                    </div>
                    <div>
                        <label for="db_port" class="block text-sm font-medium text-gray-700 mb-1">Port</label>
                        <input type="number" id="db_port" name="db_port" value="{{ old('db_port', '3306') }}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="3306">
                    </div>
                </div>
                <div>
                    <label for="db_database" class="block text-sm font-medium text-gray-700 mb-1">Datenbankname</label>
                    <input type="text" id="db_database" name="db_database" value="{{ old('db_database') }}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="dashboard">
                </div>
                <div>
                    <label for="db_username" class="block text-sm font-medium text-gray-700 mb-1">Benutzername</label>
                    <input type="text" id="db_username" name="db_username" value="{{ old('db_username', 'root') }}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="root">
                </div>
                <div>
                    <label for="db_password" class="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
                    <input type="password" id="db_password" name="db_password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Passwort (leer wenn kein Passwort)">
                </div>
            </div>

            <!-- Supabase Fields -->
            <div id="supabase-fields" class="space-y-4 hidden">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p class="text-sm text-blue-800">
                        Supabase ist eine PostgreSQL-basierte Cloud-Datenbank. Sie benötigen ein Supabase-Konto.
                        <a href="https://supabase.com" target="_blank" class="underline">Hier registrieren</a>
                    </p>
                </div>
                <div>
                    <label for="supabase_url" class="block text-sm font-medium text-gray-700 mb-1">Supabase URL</label>
                    <input type="url" id="supabase_url" name="supabase_url" value="{{ old('supabase_url') }}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://xxxxx.supabase.co">
                </div>
                <div>
                    <label for="supabase_anon_key" class="block text-sm font-medium text-gray-700 mb-1">ANON Key</label>
                    <input type="text" id="supabase_anon_key" name="supabase_anon_key" value="{{ old('supabase_anon_key') }}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
                </div>
                <div>
                    <label for="supabase_service_key" class="block text-sm font-medium text-gray-700 mb-1">Service Key</label>
                    <input type="text" id="supabase_service_key" name="supabase_service_key" value="{{ old('supabase_service_key') }}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
                </div>
            </div>

            <!-- SQLite Info -->
            <div id="sqlite-info" class="hidden">
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p class="text-sm text-green-800">
                        SQLite ist die einfachste Option. Die Datenbank wird als Datei gespeichert. Ideal für Entwicklung und kleine Projekte.
                    </p>
                </div>
            </div>

            <!-- App URL -->
            <div class="mt-6">
                <label for="app_url" class="block text-sm font-medium text-gray-700 mb-1">Anwendungs-URL</label>
                <input type="url" id="app_url" name="app_url" value="{{ old('app_url', 'http://localhost:8000') }}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://dashboard.ihre-domain.de">
            </div>
        </div>

        <!-- Test Connection Button -->
        <div class="flex justify-between">
            <a href="{{ route('install.index') }}" class="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">
                Zurück
            </a>
            <div class="space-x-3">
                <button type="button" id="test-btn" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors" onclick="testConnection()">
                    Verbindung testen
                </button>
                <button type="submit" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                    Weiter
                </button>
            </div>
        </div>
    </form>

    <!-- Loading/Result Overlay -->
    <div id="test-result" class="hidden mt-4"></div>

    <script>
        function toggleDbFields() {
            const dbType = document.querySelector('input[name="db_type"]:checked').value;
            const sqlFields = document.getElementById('sql-fields');
            const supabaseFields = document.getElementById('supabase-fields');
            const sqliteInfo = document.getElementById('sqlite-info');
            const dbPort = document.getElementById('db_port');

            if (dbType === 'mysql') {
                sqlFields.classList.remove('hidden');
                supabaseFields.classList.add('hidden');
                sqliteInfo.classList.add('hidden');
                dbPort.value = '3306';
            } else if (dbType === 'postgresql') {
                sqlFields.classList.remove('hidden');
                supabaseFields.classList.add('hidden');
                sqliteInfo.classList.add('hidden');
                dbPort.value = '5432';
            } else if (dbType === 'sqlite') {
                sqlFields.classList.add('hidden');
                supabaseFields.classList.add('hidden');
                sqliteInfo.classList.remove('hidden');
            } else if (dbType === 'supabase') {
                sqlFields.classList.add('hidden');
                supabaseFields.classList.remove('hidden');
                sqliteInfo.classList.add('hidden');
            }
        }

        async function testConnection() {
            const testBtn = document.getElementById('test-btn');
            const resultDiv = document.getElementById('test-result');
            const dbType = document.querySelector('input[name="db_type"]:checked').value;

            testBtn.disabled = true;
            testBtn.textContent = 'Teste...';
            resultDiv.classList.remove('hidden');

            const formData = new FormData();
            formData.append('db_type', dbType);

            if (dbType === 'mysql' || dbType === 'postgresql') {
                formData.append('db_host', document.getElementById('db_host').value);
                formData.append('db_port', document.getElementById('db_port').value);
                formData.append('db_database', document.getElementById('db_database').value);
                formData.append('db_username', document.getElementById('db_username').value);
                formData.append('db_password', document.getElementById('db_password').value);
            }

            try {
                const response = await fetch('{{ route("install.testConnection") }}', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    resultDiv.innerHTML = `
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div class="flex items-center">
                                <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span class="text-green-800">${data.message}</span>
                            </div>
                        </div>
                    `;
                } else {
                    resultDiv.innerHTML = `
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div class="flex items-center">
                                <svg class="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                <span class="text-red-800">${data.message}</span>
                            </div>
                        </div>
                    `;
                }
            } catch (error) {
                resultDiv.innerHTML = `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            <span class="text-red-800">Fehler: ${error.message}</span>
                        </div>
                    </div>
                `;
            }

            testBtn.disabled = false;
            testBtn.textContent = 'Verbindung testen';
        }

        // Initialize
        toggleDbFields();
    </script>
@endsection
