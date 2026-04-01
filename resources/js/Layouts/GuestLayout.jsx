import { Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

function hexToHSL(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function generatePalette(hex) {
    const { h, s } = hexToHSL(hex);
    return {
        50: `hsl(${h}, ${Math.min(s + 20, 100)}%, 97%)`,
        100: `hsl(${h}, ${Math.min(s + 15, 100)}%, 93%)`,
        200: `hsl(${h}, ${Math.min(s + 10, 100)}%, 85%)`,
        300: `hsl(${h}, ${s}%, 72%)`,
        400: `hsl(${h}, ${s}%, 58%)`,
        500: `hsl(${h}, ${s}%, 48%)`,
        600: `hsl(${h}, ${s}%, 40%)`,
        700: `hsl(${h}, ${Math.max(s - 5, 0)}%, 33%)`,
        800: `hsl(${h}, ${Math.max(s - 10, 0)}%, 26%)`,
        900: `hsl(${h}, ${Math.max(s - 15, 0)}%, 20%)`,
    };
}

export default function GuestLayout({ children }) {
    const { branding = {} } = usePage().props;

    useEffect(() => {
        if (branding?.primary_color && branding.primary_color !== '#0284c7') {
            const palette = generatePalette(branding.primary_color);
            const root = document.documentElement;
            Object.entries(palette).forEach(([shade, color]) => {
                root.style.setProperty(`--color-primary-${shade}`, color);
            });
        }
    }, [branding?.primary_color]);

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 dark:bg-gray-900 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/" className="flex items-center gap-3">
                    {branding?.app_logo ? (
                        <img src={`/storage/${branding.app_logo}`} alt={branding.app_name || 'Dashboard'} className="h-16 w-16 object-contain" />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-600">
                            <span className="text-2xl font-bold text-white">{(branding?.app_name || 'D').charAt(0)}</span>
                        </div>
                    )}
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{branding?.app_name || 'Dashboard'}</span>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white dark:bg-gray-800 px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
