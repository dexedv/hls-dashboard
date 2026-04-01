import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';

export default function TwoFactorChallenge() {
    const [useRecovery, setUseRecovery] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('two-factor.verify'));
    };

    return (
        <GuestLayout>
            <Head title="Zwei-Faktor-Authentifizierung" />

            <div className="mb-4 text-sm text-gray-600">
                {useRecovery
                    ? 'Bitte geben Sie einen Ihrer Wiederherstellungscodes ein.'
                    : 'Bitte geben Sie den Code aus Ihrer Authenticator-App ein.'}
            </div>

            <form onSubmit={submit}>
                <div>
                    <InputLabel
                        htmlFor="code"
                        value={useRecovery ? 'Wiederherstellungscode' : 'Authentifizierungscode'}
                    />
                    <TextInput
                        id="code"
                        type="text"
                        name="code"
                        value={data.code}
                        className="mt-1 block w-full"
                        autoComplete="one-time-code"
                        isFocused={true}
                        onChange={(e) => setData('code', e.target.value)}
                        placeholder={useRecovery ? 'Wiederherstellungscode' : '6-stelliger Code'}
                    />
                    <InputError message={errors.code} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <button
                        type="button"
                        className="text-sm text-gray-600 underline hover:text-gray-900"
                        onClick={() => {
                            setUseRecovery(!useRecovery);
                            setData('code', '');
                        }}
                    >
                        {useRecovery ? 'Authenticator-Code verwenden' : 'Wiederherstellungscode verwenden'}
                    </button>

                    <PrimaryButton disabled={processing}>
                        Bestätigen
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
