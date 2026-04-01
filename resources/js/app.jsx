import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);

        // Apply dynamic progress bar color from branding
        const primaryColor = props.initialPage?.props?.branding?.primary_color;
        if (primaryColor) {
            document.documentElement.style.setProperty('--progress-bar-color', primaryColor);
        }
    },
    progress: {
        color: 'var(--progress-bar-color, #0284c7)',
    },
});
