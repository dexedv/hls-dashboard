<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Installation - HLS Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen flex flex-col">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200">
            <div class="max-w-4xl mx-auto px-4 py-4">
                <div class="flex items-center justify-center">
                    <div class="flex items-center space-x-2">
                        <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <span class="text-xl font-bold text-gray-900">HLS Dashboard</span>
                    </div>
                </div>
            </div>
        </header>

        <!-- Progress Steps -->
        <div class="bg-white border-b border-gray-200">
            <div class="max-w-4xl mx-auto px-4 py-4">
                <nav aria-label="Progress">
                    <ol role="list" class="flex items-center justify-center space-x-8">
                        <li class="{{ $step >= 1 ? 'text-blue-600' : 'text-gray-400' }}">
                            <div class="flex items-center">
                                <span class="flex h-8 w-8 items-center justify-center rounded-full {{ $step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200' }} text-sm font-medium">1</span>
                                <span class="ml-3 text-sm font-medium">Willkommen</span>
                            </div>
                        </li>
                        <li class="{{ $step >= 2 ? 'text-blue-600' : 'text-gray-400' }}">
                            <div class="flex items-center">
                                <div class="flex h-8 w-8 items-center justify-center rounded-full {{ $step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200' }} text-sm font-medium">2</span>
                                <span class="ml-3 text-sm font-medium">Datenbank</span>
                            </div>
                        </li>
                        <li class="{{ $step >= 3 ? 'text-blue-600' : 'text-gray-400' }}">
                            <div class="flex items-center">
                                <span class="flex h-8 w-8 items-center justify-center rounded-full {{ $step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200' }} text-sm font-medium">3</span>
                                <span class="ml-3 text-sm font-medium">Admin</span>
                            </div>
                        </li>
                        <li class="{{ $step >= 4 ? 'text-blue-600' : 'text-gray-400' }}">
                            <div class="flex items-center">
                                <span class="flex h-8 w-8 items-center justify-center rounded-full {{ $step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200' }} text-sm font-medium">4</span>
                                <span class="ml-3 text-sm font-medium">Fertig</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>
        </div>

        <!-- Main Content -->
        <main class="flex-1 py-8">
            <div class="max-w-2xl mx-auto px-4">
                @yield('content')
            </div>
        </main>

        <!-- Footer -->
        <footer class="bg-white border-t border-gray-200 py-4">
            <div class="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
                &copy; {{ date('Y') }} HLS Dashboard. Alle Rechte vorbehalten.
            </div>
        </footer>
    </div>

    <!-- Error Toast -->
    @if(session('error'))
    <div id="error-toast" class="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
        <div class="flex items-start">
            <svg class="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="flex-1">
                <p class="text-sm text-red-800">{{ session('error') }}</p>
            </div>
            <button onclick="document.getElementById('error-toast').remove()" class="ml-3 text-red-500 hover:text-red-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    </div>
    @endif
</body>
</html>
