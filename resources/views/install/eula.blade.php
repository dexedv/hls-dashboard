@extends('install.layout', ['step' => 2])

@section('content')
<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
    <div class="text-center mb-6">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Nutzungsbedingungen</h1>
        <p class="text-gray-600">Bitte lesen und akzeptieren Sie die Lizenzvereinbarung.</p>
    </div>

    <div class="border border-gray-200 rounded-lg p-6 mb-6 max-h-80 overflow-y-auto bg-gray-50 text-sm text-gray-700 leading-relaxed">
        @include('install.eula-content')
    </div>

    <form action="{{ route('install.eula.accept') }}" method="POST">
        @csrf
        <div class="mb-6">
            <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="accept_eula" id="accept_eula" required
                    class="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <span class="text-sm text-gray-700">
                    Ich habe die Endbenutzer-Lizenzvereinbarung gelesen und akzeptiere alle Bedingungen.
                </span>
            </label>
            @error('accept_eula')
                <p class="text-sm text-red-600 mt-1">{{ $message }}</p>
            @enderror
        </div>

        <div class="flex gap-3">
            <a href="{{ route('install.index') }}" class="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-center">
                Zurück
            </a>
            <button type="submit" class="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                Akzeptieren & Weiter
            </button>
        </div>
    </form>
</div>
@endsection
