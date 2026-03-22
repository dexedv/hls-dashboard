<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>403 - Zugriff verweigert</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; display: flex; align-items: center; justify-content: center; min-height: 100vh; color: #111827; }
        .container { text-align: center; padding: 2rem; max-width: 480px; }
        .code { font-size: 7rem; font-weight: 800; color: #e5e7eb; line-height: 1; margin-bottom: 0.5rem; }
        .icon { margin: 0 auto 1.5rem; width: 64px; height: 64px; }
        .icon svg { width: 100%; height: 100%; color: #ef4444; }
        h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
        p { color: #6b7280; font-size: 0.95rem; margin-bottom: 2rem; line-height: 1.6; }
        .btn { display: inline-block; padding: 0.75rem 1.5rem; background: #0284c7; color: #fff; text-decoration: none; border-radius: 0.5rem; font-weight: 500; font-size: 0.875rem; transition: background 0.2s; }
        .btn:hover { background: #0369a1; }
        .app-name { font-size: 0.75rem; color: #9ca3af; margin-top: 2rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="code">403</div>
        <div class="icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
        </div>
        <h1>Zugriff verweigert</h1>
        <p>Sie haben nicht die erforderlichen Berechtigungen, um auf diese Seite zuzugreifen. Kontaktieren Sie Ihren Administrator, falls Sie Zugang benötigen.</p>
        <a href="/dashboard" class="btn">Zurück zum Dashboard</a>
        <div class="app-name">{{ config('app.name', 'Dashboard') }}</div>
    </div>
</body>
</html>
