@extends('install.layout', ['step' => 6])

@section('content')
<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
    <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Firmendaten</h1>
        <p class="text-gray-600 max-w-md mx-auto">
            Konfigurieren Sie Ihre Firmendaten. Diese werden fuer Rechnungen, Angebote und im Dashboard verwendet.
        </p>
    </div>

    <form action="{{ route('install.company.save') }}" method="POST" enctype="multipart/form-data">
        @csrf
        <div class="space-y-6">
            <!-- Company Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                    <label for="company_name" class="block text-sm font-medium text-gray-700 mb-1">Firmenname *</label>
                    <input type="text" id="company_name" name="company_name" value="{{ old('company_name') }}" required
                        class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div class="md:col-span-2">
                    <label for="company_address" class="block text-sm font-medium text-gray-700 mb-1">Strasse</label>
                    <input type="text" id="company_address" name="company_address" value="{{ old('company_address') }}"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                    <label for="company_zip" class="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
                    <input type="text" id="company_zip" name="company_zip" value="{{ old('company_zip') }}"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                    <label for="company_city" class="block text-sm font-medium text-gray-700 mb-1">Ort</label>
                    <input type="text" id="company_city" name="company_city" value="{{ old('company_city') }}"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                    <label for="company_country" class="block text-sm font-medium text-gray-700 mb-1">Land</label>
                    <input type="text" id="company_country" name="company_country" value="{{ old('company_country', 'Deutschland') }}"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
            </div>

            <!-- Contact -->
            <div class="border-t border-gray-200 pt-4">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Kontakt</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="company_phone" class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                        <input type="text" id="company_phone" name="company_phone" value="{{ old('company_phone') }}"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label for="company_email" class="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                        <input type="email" id="company_email" name="company_email" value="{{ old('company_email') }}"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div class="md:col-span-2">
                        <label for="company_website" class="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <input type="url" id="company_website" name="company_website" value="{{ old('company_website') }}"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
            </div>

            <!-- Tax & Currency -->
            <div class="border-t border-gray-200 pt-4">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Steuern & Waehrung</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="company_tax_id" class="block text-sm font-medium text-gray-700 mb-1">Steuer-ID</label>
                        <input type="text" id="company_tax_id" name="company_tax_id" value="{{ old('company_tax_id') }}"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label for="company_vat_id" class="block text-sm font-medium text-gray-700 mb-1">USt-IdNr.</label>
                        <input type="text" id="company_vat_id" name="company_vat_id" value="{{ old('company_vat_id') }}"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label for="tax_rate" class="block text-sm font-medium text-gray-700 mb-1">Steuersatz (%)</label>
                        <input type="number" step="0.1" id="tax_rate" name="tax_rate" value="{{ old('tax_rate', '19') }}"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label for="currency" class="block text-sm font-medium text-gray-700 mb-1">Waehrung</label>
                        <select id="currency" name="currency"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="EUR" selected>EUR - Euro</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="GBP">GBP - Britisches Pfund</option>
                            <option value="CHF">CHF - Schweizer Franken</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Branding -->
            <div class="border-t border-gray-200 pt-4">
                <h3 class="text-sm font-semibold text-gray-900 mb-3">Erscheinungsbild</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="app_name" class="block text-sm font-medium text-gray-700 mb-1">App-Name</label>
                        <input type="text" id="app_name" name="app_name" value="{{ old('app_name', 'Dashboard') }}"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label for="primary_color" class="block text-sm font-medium text-gray-700 mb-1">Primaerfarbe</label>
                        <div class="flex gap-2">
                            <input type="color" id="primary_color" name="primary_color" value="{{ old('primary_color', '#0284c7') }}"
                                class="h-10 w-14 border border-gray-300 rounded-lg cursor-pointer">
                            <input type="text" id="primary_color_hex" value="{{ old('primary_color', '#0284c7') }}" readonly
                                class="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-gray-50">
                        </div>
                    </div>
                    <div class="md:col-span-2">
                        <label for="app_logo" class="block text-sm font-medium text-gray-700 mb-1">Logo (optional)</label>
                        <input type="file" id="app_logo" name="app_logo" accept="image/png,image/jpeg,image/svg+xml"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <p class="text-xs text-gray-500 mt-1">PNG, JPG oder SVG. Max. 2MB.</p>
                    </div>
                </div>
            </div>

            <div class="flex gap-3">
                <a href="{{ route('install.admin') }}" class="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-center">
                    Zurueck
                </a>
                <button type="submit" class="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                    Weiter
                </button>
            </div>
        </div>
    </form>
</div>

<script>
    document.getElementById('primary_color').addEventListener('input', function() {
        document.getElementById('primary_color_hex').value = this.value;
    });
</script>
@endsection
