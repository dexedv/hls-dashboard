import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { DashboardSkeleton } from '@/Components/Skeleton';

// Icon Components (Heroicons)
const Icons = {
    customers: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    projects: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
    ),
    tasks: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    leads: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    // Quick action icons
    newCustomer: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
    ),
    newProject: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    newTask: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    ),
    newLead: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    timeTrack: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    newTicket: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
    ),
};

// ─── Time Widget ────────────────────────────────────────────────────────────
function TimeWidget() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    const weekdays = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
    const months   = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
    return (
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-sm p-6 text-white flex flex-col justify-between min-h-[130px]">
            <div className="text-xs font-medium uppercase tracking-wider opacity-75">Aktuelle Zeit</div>
            <div>
                <div className="text-4xl font-bold tabular-nums tracking-tight">
                    {time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-sm opacity-80 mt-1">
                    {weekdays[time.getDay()]}, {time.getDate()}. {months[time.getMonth()]} {time.getFullYear()}
                </div>
            </div>
        </div>
    );
}

// ─── Weather Widget ──────────────────────────────────────────────────────────
const WMO_CODES = {
    0: { label: 'Klarer Himmel', icon: '☀️' },
    1: { label: 'Überwiegend klar', icon: '🌤️' },
    2: { label: 'Teilweise bewölkt', icon: '⛅' },
    3: { label: 'Bewölkt', icon: '☁️' },
    45: { label: 'Nebel', icon: '🌫️' }, 48: { label: 'Gefrierender Nebel', icon: '🌫️' },
    51: { label: 'Leichter Niesel', icon: '🌦️' }, 53: { label: 'Nieselregen', icon: '🌦️' }, 55: { label: 'Starker Niesel', icon: '🌦️' },
    61: { label: 'Leichter Regen', icon: '🌧️' }, 63: { label: 'Regen', icon: '🌧️' }, 65: { label: 'Starker Regen', icon: '🌧️' },
    71: { label: 'Leichter Schnee', icon: '❄️' }, 73: { label: 'Schnee', icon: '❄️' }, 75: { label: 'Starker Schnee', icon: '❄️' },
    80: { label: 'Regenschauer', icon: '🌦️' }, 81: { label: 'Regenschauer', icon: '🌦️' }, 82: { label: 'Starke Schauer', icon: '⛈️' },
    95: { label: 'Gewitter', icon: '⛈️' }, 96: { label: 'Gewitter mit Hagel', icon: '⛈️' }, 99: { label: 'Gewitter mit Hagel', icon: '⛈️' },
};
function getWeatherInfo(code) {
    return WMO_CODES[code] || { label: 'Unbekannt', icon: '🌡️' };
}

async function fetchWeatherByCoords(lat, lon) {
    const r = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,weather_code,wind_speed_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&wind_speed_unit=kmh&timezone=auto&forecast_days=4`
    );
    const d = await r.json();
    return { current: d.current, daily: d.daily };
}

async function geocodeCity(name) {
    const r = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=de&format=json`
    );
    const d = await r.json();
    if (!d.results || d.results.length === 0) throw new Error('Stadt nicht gefunden');
    return d.results[0];
}

const WEEKDAYS_SHORT = ['So','Mo','Di','Mi','Do','Fr','Sa'];

function WeatherWidget() {
    const [data, setData]         = useState(null);
    const [cityName, setCityName] = useState(() => localStorage.getItem('weather_city') || '');
    const [loading, setLoading]   = useState(true);
    const [cityInput, setCityInput] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [error, setError]       = useState(null);
    const [geoLoading, setGeoLoading] = useState(false);
    const fetched = useRef(false);

    const loadWeather = async (lat, lon, name) => {
        setLoading(true);
        setError(null);
        try {
            const w = await fetchWeatherByCoords(lat, lon);
            setData(w);
            if (name !== null) {
                setCityName(name);
                localStorage.setItem('weather_city', name);
                localStorage.setItem('weather_lat', String(lat));
                localStorage.setItem('weather_lon', String(lon));
            }
        } catch {
            setError('Wetterdaten nicht verfügbar');
        }
        setLoading(false);
    };

    const loadByIpGeolocation = async () => {
        try {
            const r = await fetch('https://ipapi.co/json/');
            const d = await r.json();
            if (d.latitude && d.longitude) {
                await loadWeather(d.latitude, d.longitude, d.city || '');
                return true;
            }
        } catch {}
        return false;
    };

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;
        const savedLat = localStorage.getItem('weather_lat');
        const savedLon = localStorage.getItem('weather_lon');
        if (savedLat && savedLon) { loadWeather(savedLat, savedLon, null); return; }

        const tryGps = () => new Promise((resolve) => {
            if (!navigator.geolocation) { resolve(false); return; }
            navigator.geolocation.getCurrentPosition(
                async ({ coords }) => {
                    try {
                        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`);
                        const d = await r.json();
                        const name = d.address?.city || d.address?.town || d.address?.village || '';
                        await loadWeather(coords.latitude, coords.longitude, name);
                    } catch { await loadWeather(coords.latitude, coords.longitude, ''); }
                    resolve(true);
                },
                () => resolve(false),
                { timeout: 5000 }
            );
        });

        (async () => {
            const gpsOk = await tryGps();
            if (!gpsOk) {
                const ipOk = await loadByIpGeolocation();
                if (!ipOk) { setLoading(false); setShowInput(true); }
            }
        })();
    }, []);

    const handleCitySearch = async (e) => {
        e.preventDefault();
        if (!cityInput.trim()) return;
        setLoading(true); setError(null);
        try {
            const geo = await geocodeCity(cityInput.trim());
            await loadWeather(geo.latitude, geo.longitude, geo.name);
            setShowInput(false); setCityInput('');
        } catch { setError('Stadt nicht gefunden'); setLoading(false); }
    };

    const handleGeolocate = async () => {
        setGeoLoading(true); setError(null);

        const tryGps = () => new Promise((resolve) => {
            if (!navigator.geolocation) { resolve(false); return; }
            navigator.geolocation.getCurrentPosition(
                async ({ coords }) => {
                    try {
                        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`);
                        const d = await r.json();
                        const name = d.address?.city || d.address?.town || d.address?.village || '';
                        await loadWeather(coords.latitude, coords.longitude, name);
                    } catch { await loadWeather(coords.latitude, coords.longitude, ''); }
                    resolve(true);
                },
                () => resolve(false),
                { timeout: 5000 }
            );
        });

        const gpsOk = await tryGps();
        if (gpsOk) {
            setShowInput(false); setCityInput('');
        } else {
            const ipOk = await loadByIpGeolocation();
            if (ipOk) {
                setShowInput(false); setCityInput('');
            } else {
                setError('Standort konnte nicht ermittelt werden');
            }
        }
        setGeoLoading(false);
    };

    const current = data?.current;
    const daily   = data?.daily;
    const info    = current ? getWeatherInfo(current.weather_code) : null;

    // Build 3 forecast days (index 1,2,3 = tomorrow, day after, day+3)
    const forecastDays = daily ? [1, 2, 3].map(i => ({
        date:    new Date(daily.time[i]),
        icon:    getWeatherInfo(daily.weather_code[i]).icon,
        max:     Math.round(daily.temperature_2m_max[i]),
        min:     Math.round(daily.temperature_2m_min[i]),
        rain:    daily.precipitation_probability_max[i],
    })) : [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 col-span-1">
            {/* Header row */}
            <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Wetter{cityName ? ` · ${cityName}` : ''}
                </div>
                <button onClick={() => setShowInput(v => !v)}
                    className="text-xs text-gray-400 hover:text-primary-600 transition-colors px-1 py-0.5 rounded hover:bg-gray-100"
                    title="Stadt ändern">✎
                </button>
            </div>

            {/* City Input */}
            {showInput && (
                <div className="mb-2 space-y-1.5">
                    <form onSubmit={handleCitySearch} className="flex gap-1.5">
                        <input type="text" value={cityInput} onChange={e => setCityInput(e.target.value)}
                            placeholder="Stadt..." autoFocus
                            className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary-500 focus:border-transparent" />
                        <button type="submit"
                            className="px-2 py-1 bg-primary-600 text-white rounded text-xs hover:bg-primary-700">OK</button>
                    </form>
                    <button
                        type="button"
                        onClick={handleGeolocate}
                        disabled={geoLoading}
                        className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {geoLoading ? (
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                        ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                        {geoLoading ? 'Wird ermittelt…' : 'Aktuellen Standort verwenden'}
                    </button>
                </div>
            )}

            {loading ? (
                <div className="animate-pulse flex items-center gap-3 h-10">
                    <div className="h-8 w-8 bg-gray-200 rounded-full" />
                    <div className="h-5 bg-gray-200 rounded w-16"/>
                    <div className="ml-auto flex gap-2">
                        {[0,1,2].map(i => <div key={i} className="h-8 w-10 bg-gray-100 rounded"/>)}
                    </div>
                </div>
            ) : error ? (
                <div className="text-xs text-red-400">{error}</div>
            ) : current ? (
                <div className="flex items-center gap-3">
                    {/* Current */}
                    <span className="text-3xl leading-none flex-shrink-0">{info.icon}</span>
                    <div className="flex-shrink-0">
                        <div className="text-xl font-bold text-gray-900 tabular-nums leading-tight">{Math.round(current.temperature_2m)}°C</div>
                        <div className="text-xs text-gray-400 leading-tight">{info.label} · {Math.round(current.wind_speed_10m)} km/h</div>
                    </div>
                    {/* Forecast */}
                    {forecastDays.length > 0 && (
                        <div className="ml-auto flex gap-1.5">
                            {forecastDays.map((day, i) => (
                                <div key={i} className="flex flex-col items-center bg-gray-50 rounded-lg px-2 py-1 min-w-[44px]">
                                    <div className="text-xs font-medium text-gray-400">{WEEKDAYS_SHORT[day.date.getDay()]}</div>
                                    <div className="text-base leading-tight">{day.icon}</div>
                                    <div className="text-xs font-semibold text-gray-700">{day.max}°</div>
                                    <div className="text-xs text-gray-400">{day.min}°</div>
                                    {day.rain > 0 && <div className="text-xs text-blue-500">💧{day.rain}%</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-xs text-gray-400">Stadt eingeben um Wetter zu laden</div>
            )}
        </div>
    );
}

// ─── Upcoming Events Widget ──────────────────────────────────────────────────
const EVENT_TYPE_LABELS = {
    meeting: 'Meeting', deadline: 'Deadline', call: 'Anruf',
    delivery: 'Lieferung', pickup: 'Abholung', reminder: 'Erinnerung', other: 'Sonstiges',
};
const EVENT_TYPE_COLORS = {
    meeting: 'bg-blue-100 text-blue-700', deadline: 'bg-red-100 text-red-700',
    call: 'bg-green-100 text-green-700', delivery: 'bg-orange-100 text-orange-700',
    pickup: 'bg-purple-100 text-purple-700', reminder: 'bg-yellow-100 text-yellow-700',
    other: 'bg-gray-100 text-gray-700',
};

function UpcomingEventsWidget({ events, currentUserId }) {
    const [showAll, setShowAll] = useState(false);
    const visible = showAll ? events : (events || []).slice(0, 4);
    const hiddenCount = (events?.length || 0) - 4;

    if (!events || events.length === 0) return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-900">Kommende Termine</h2>
                </div>
            </div>
            <div className="px-6 py-8 text-center text-sm text-gray-400">Keine Termine in den nächsten 14 Tagen</div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-gray-900">Kommende Termine</h2>
                    <span className="ml-auto text-xs bg-gray-200 text-gray-600 font-semibold px-2 py-0.5 rounded-full">{events.length}</span>
                </div>
            </div>
            <div className="divide-y divide-gray-50">
                {visible.map(ev => {
                    const d = new Date(ev.start);
                    const isToday = d.toDateString() === new Date().toDateString();
                    const timeLabel = ev.all_day ? 'Ganztägig' : d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                    const isMine = currentUserId && ev.assignees?.some(a => a.id === currentUserId);

                    return (
                        <Link key={ev.id} href={route('calendar.show', ev.id)}
                            className={`flex items-start gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors group ${isMine ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''}`}>
                            {/* Date block */}
                            <div className={`flex-shrink-0 text-center w-12 rounded-lg py-1 ${isToday ? 'bg-primary-600 text-white' : isMine ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}>
                                <div className="text-xs font-medium">{d.toLocaleDateString('de-DE', { weekday: 'short' })}</div>
                                <div className="text-lg font-bold leading-tight">{d.getDate()}</div>
                            </div>
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">{ev.title}</p>
                                    {isMine && <span className="text-xs px-1.5 py-0.5 bg-primary-600 text-white rounded font-medium flex-shrink-0">Ich</span>}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className="text-xs text-gray-500">{timeLabel}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${EVENT_TYPE_COLORS[ev.event_type] || 'bg-gray-100 text-gray-700'}`}>
                                        {EVENT_TYPE_LABELS[ev.event_type] || ev.event_type}
                                    </span>
                                    {ev.tags && ev.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-xs px-1.5 py-0.5 bg-primary-50 text-primary-600 rounded font-medium">{tag}</span>
                                    ))}
                                </div>
                                {(ev.project_name || ev.customer_name) && (
                                    <p className="text-xs text-gray-400 mt-0.5 truncate flex items-center gap-1 flex-wrap">
                                        {ev.project_name && (
                                            <span className="inline-flex items-center gap-0.5">
                                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                {ev.project_name}
                                            </span>
                                        )}
                                        {ev.project_name && ev.customer_name && <span>·</span>}
                                        {ev.customer_name && (
                                            <span className="inline-flex items-center gap-0.5">
                                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                {ev.customer_name}
                                            </span>
                                        )}
                                    </p>
                                )}
                            </div>
                            {/* Assignees */}
                            {ev.assignees && ev.assignees.length > 0 && (
                                <div className="flex-shrink-0 flex -space-x-1">
                                    {ev.assignees.slice(0, 3).map(a => {
                                        const isMe = a.id === currentUserId;
                                        return (
                                            <span key={a.id} title={isMe ? 'Ich' : a.name}
                                                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white ${isMe ? 'bg-primary-600 text-white' : 'bg-primary-200 text-primary-800'}`}>
                                                {a.name?.[0]?.toUpperCase()}
                                            </span>
                                        );
                                    })}
                                    {ev.assignees.length > 3 && (
                                        <span className="h-6 w-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold border-2 border-white">
                                            +{ev.assignees.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>
            {hiddenCount > 0 && (
                <button onClick={() => setShowAll(v => !v)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-2.5 text-sm text-gray-500 hover:text-primary-600 hover:bg-gray-50 transition-colors border-t border-gray-100">
                    <svg className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {showAll ? 'Weniger anzeigen' : `${hiddenCount} weitere Termine`}
                </button>
            )}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                <Link href={route('calendar.index')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Alle Termine anzeigen →
                </Link>
            </div>
        </div>
    );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
const DEFAULT_WIDGETS = {
    quickActions: true,
    timeWeather: true,
    upcomingEvents: true,
    recentTasks: true,
    recentLeads: true,
    activityFeed: true,
};

export default function Dashboard() {
    const { stats, recentTasks, recentLeads, activityFeed, myAssignments, upcomingEvents, lowStockItems, auth } = usePage().props;
    const criticalStock = lowStockItems?.filter(i => i.current_stock < 10) ?? [];
    const isAdmin = ['admin', 'owner'].includes(auth?.user?.role);
    const [isLoading, setIsLoading] = useState(!stats);
    const [showAllActivities, setShowAllActivities] = useState(false);
    const [showCustomize, setShowCustomize] = useState(false);
    const [widgets, setWidgets] = useState(() => {
        try {
            const saved = localStorage.getItem('dashboard_widgets');
            return saved ? { ...DEFAULT_WIDGETS, ...JSON.parse(saved) } : DEFAULT_WIDGETS;
        } catch { return DEFAULT_WIDGETS; }
    });

    const toggleWidget = (key) => {
        setWidgets(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem('dashboard_widgets', JSON.stringify(next));
            return next;
        });
    };

    useEffect(() => {
        if (stats) setIsLoading(false);
    }, [stats]);

    if (isLoading) {
        return (
            <DashboardLayout title="Dashboard">
                <Head title="Dashboard" />
                <DashboardSkeleton />
            </DashboardLayout>
        );
    }

    const formatRelativeTime = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'gerade eben';
        if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min`;
        if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std`;
        if (diff < 604800) return `vor ${Math.floor(diff / 86400)} Tagen`;
        return date.toLocaleDateString('de-DE');
    };

    const getActionPart = (action) => action?.includes('.') ? action.split('.').pop() : action;

    const getActionIcon = (action) => {
        const part = getActionPart(action);
        if (part === 'created') return { icon: '+', bg: 'bg-green-100', text: 'text-green-600' };
        if (part === 'updated') return { icon: '~', bg: 'bg-blue-100', text: 'text-blue-600' };
        if (part === 'deleted') return { icon: '×', bg: 'bg-red-100', text: 'text-red-600' };
        return { icon: '•', bg: 'bg-gray-100', text: 'text-gray-600' };
    };

    const getActionLabel = (action) => {
        const part = getActionPart(action);
        if (part === 'created') return 'erstellt';
        if (part === 'updated') return 'bearbeitet';
        if (part === 'deleted') return 'gelöscht';
        return part;
    };

    const statCards = [
        {
            name: 'Kunden',
            value: stats?.customers || 0,
            change: stats?.customers_change ?? '+0',
            changeType: stats?.customers_change_type ?? 'increase',
            icon: Icons.customers,
            bgColor: 'bg-primary-500',
            gradient: 'from-primary-500 to-primary-600',
        },
        {
            name: 'Aktive Projekte',
            value: stats?.projects || 0,
            change: stats?.projects_change ?? '+0',
            changeType: stats?.projects_change_type ?? 'increase',
            icon: Icons.projects,
            bgColor: 'bg-indigo-500',
            gradient: 'from-indigo-500 to-indigo-600',
        },
        {
            name: 'Offene Aufgaben',
            value: stats?.tasks || 0,
            change: stats?.tasks_change ?? '+0',
            changeType: stats?.tasks_change_type ?? 'increase',
            icon: Icons.tasks,
            bgColor: 'bg-amber-500',
            gradient: 'from-amber-500 to-amber-600',
        },
        {
            name: 'Neue Leads',
            value: stats?.leads || 0,
            change: stats?.leads_change ?? '+0',
            changeType: stats?.leads_change_type ?? 'increase',
            icon: Icons.leads,
            bgColor: 'bg-emerald-500',
            gradient: 'from-emerald-500 to-emerald-600',
        },
        {
            name: 'Offene Tickets',
            value: stats?.tickets || 0,
            change: stats?.tickets_change ?? '+0',
            changeType: stats?.tickets_change_type ?? 'neutral',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
            ),
            bgColor: 'bg-rose-500',
            gradient: 'from-rose-500 to-rose-600',
        },
        {
            name: 'Umsatz Monat',
            value: stats?.monthly_revenue
                ? `${parseFloat(stats.monthly_revenue).toLocaleString('de-DE', { minimumFractionDigits: 0 })} €`
                : '0 €',
            change: stats?.revenue_change ?? '+0%',
            changeType: stats?.revenue_change_type ?? 'increase',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            bgColor: 'bg-violet-500',
            gradient: 'from-violet-500 to-violet-600',
        },
    ];

    const quickActions = [
        { name: 'Neuer Kunde',  href: '/customers/create',  icon: Icons.newCustomer, bg: 'bg-violet-100', text: 'text-violet-600', hoverBg: 'group-hover:bg-violet-600', border: 'hover:border-violet-300' },
        { name: 'Neues Projekt',href: '/projects/create',   icon: Icons.newProject,  bg: 'bg-blue-100',   text: 'text-blue-600',   hoverBg: 'group-hover:bg-blue-600',   border: 'hover:border-blue-300' },
        { name: 'Neue Aufgabe', href: '/tasks/create',      icon: Icons.newTask,     bg: 'bg-amber-100',  text: 'text-amber-600',  hoverBg: 'group-hover:bg-amber-600',  border: 'hover:border-amber-300' },
        { name: 'Neuer Lead',   href: '/leads/create',      icon: Icons.newLead,     bg: 'bg-emerald-100',text: 'text-emerald-600',hoverBg: 'group-hover:bg-emerald-600',border: 'hover:border-emerald-300' },
        { name: 'Zeit erfassen',href: '/time-tracking',     icon: Icons.timeTrack,   bg: 'bg-teal-100',   text: 'text-teal-600',   hoverBg: 'group-hover:bg-teal-600',   border: 'hover:border-teal-300' },
        { name: 'Neues Ticket', href: '/tickets/create',    icon: Icons.newTicket,   bg: 'bg-rose-100',   text: 'text-rose-600',   hoverBg: 'group-hover:bg-rose-600',   border: 'hover:border-rose-300' },
    ];

    const getStatusColor = (status) => {
        const colors = {
            new: 'bg-blue-100 text-blue-700 border-blue-200',
            contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            qualified: 'bg-purple-100 text-purple-700 border-purple-200',
            proposal: 'bg-orange-100 text-orange-700 border-orange-200',
            won: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            lost: 'bg-red-100 text-red-700 border-red-200',
            todo: 'bg-gray-100 text-gray-700 border-gray-200',
            in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
            review: 'bg-amber-100 text-amber-700 border-amber-200',
            done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getPriorityStyles = (priority) => {
        const styles = {
            low: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Niedrig' },
            medium: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', label: 'Mittel' },
            high: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500', label: 'Hoch' },
            urgent: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', label: 'Dringend' },
        };
        return styles[priority] || styles.low;
    };

    return (
        <DashboardLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Low Stock Alert Strip */}
            {criticalStock.length > 0 && (
                <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>
                        <span className="font-semibold">{criticalStock.length} Artikel kritisch niedrig:</span>
                        {' '}{criticalStock.slice(0, 3).map(i => i.name).join(', ')}
                        {criticalStock.length > 3 && ` und ${criticalStock.length - 3} weitere`}
                    </span>
                    <Link href="/inventory" className="ml-auto text-red-700 underline font-medium hover:text-red-800 flex-shrink-0">
                        Lager ansehen →
                    </Link>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
                {statCards.map((card) => (
                    <div
                        key={card.name}
                        className="relative overflow-hidden rounded-xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 group"
                    >
                        {/* Gradient accent line */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />

                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{card.name}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-0.5 tabular-nums">{card.value}</p>
                            </div>
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bgColor} shadow-sm group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                                <div className="text-white">
                                    {card.icon}
                                </div>
                            </div>
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-medium pt-2.5 border-t border-gray-50 ${
                            card.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                            {card.changeType === 'increase' ? (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            )}
                            <span>{card.change}</span>
                            <span className="text-gray-400 font-normal text-xs ml-0.5">ggü. Vormonat</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Customize Panel */}
            <div className="flex justify-end mb-4">
                <button onClick={() => setShowCustomize(v => !v)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 border border-gray-200 hover:border-primary-300 px-3 py-1.5 rounded-lg transition-colors bg-white">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Dashboard anpassen
                </button>
            </div>
            {showCustomize && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Widgets anzeigen/ausblenden</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                            ['quickActions', 'Schnellzugriff'],
                            ['timeWeather', 'Zeit & Wetter'],
                            ['upcomingEvents', 'Termine & Aufgaben'],
                            ['recentTasks', 'Letzte Aufgaben'],
                            ['recentLeads', 'Letzte Leads'],
                            ['activityFeed', 'Aktivitäts-Feed'],
                        ].map(([key, label]) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer select-none p-2 hover:bg-gray-50 rounded-lg">
                                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${widgets[key] ? 'bg-primary-600' : 'bg-gray-300'}`}
                                    onClick={() => toggleWidget(key)}>
                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${widgets[key] ? 'translate-x-4' : 'translate-x-1'}`} />
                                </div>
                                <span className="text-sm text-gray-700">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            {widgets.quickActions && <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellzugriff</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.name}
                            href={action.href}
                            className={`group flex flex-col items-center justify-center p-5 bg-white rounded-xl border border-gray-200 ${action.border} hover:shadow-lg transition-all duration-200`}
                        >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.bg} ${action.text} ${action.hoverBg} group-hover:text-white transition-all duration-200 group-hover:scale-110`}>
                                {action.icon}
                            </div>
                            <span className="mt-3 text-sm font-medium text-gray-700 group-hover:text-gray-900 text-center">
                                {action.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>}

            {/* Time & Weather */}
            {widgets.timeWeather && <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <TimeWidget />
                <WeatherWidget />
            </div>}

            {/* Upcoming Events + My Assignments */}
            {widgets.upcomingEvents && <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                <div className={myAssignments && myAssignments.length > 0 ? 'lg:col-span-3' : 'lg:col-span-5'}>
                    <UpcomingEventsWidget events={upcomingEvents} currentUserId={auth?.user?.id} />
                </div>

            {myAssignments && myAssignments.length > 0 && (
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-primary-50/50">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Meine Zuweisungen</h2>
                            <span className="ml-auto text-xs bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-full">
                                {myAssignments.length}
                            </span>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {myAssignments.map((item) => {
                            const typeConfig = {
                                task:    { label: 'Aufgabe',  bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500' },
                                project: { label: 'Projekt',  bg: 'bg-indigo-100',  text: 'text-indigo-700',  dot: 'bg-indigo-500' },
                                ticket:  { label: 'Ticket',   bg: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-500' },
                            }[item.type] || { label: item.type, bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };

                            const priorityDot = {
                                urgent: 'bg-red-500',
                                high:   'bg-orange-500',
                                medium: 'bg-yellow-500',
                                low:    'bg-gray-400',
                            }[item.priority] || 'bg-gray-400';

                            const typeBorder = {
                                task:    'border-l-amber-400',
                                project: 'border-l-indigo-400',
                                ticket:  'border-l-rose-400',
                            }[item.type] ?? 'border-l-gray-200';

                            const statusLabel = {
                                todo: 'Offen', in_progress: 'In Bearbeitung', review: 'Überprüfung',
                                planning: 'Planung', active: 'Aktiv',
                                open: 'Offen', pending: 'Wartend',
                            }[item.status] || item.status;

                            return (
                                <Link
                                    key={`${item.type}-${item.id}`}
                                    href={item.url}
                                    className={`flex items-center gap-4 px-6 py-3 hover:bg-primary-50/40 transition-colors group border-l-4 ${typeBorder}`}
                                >
                                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${priorityDot}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                                            {item.title}
                                        </p>
                                        {item.subtitle && (
                                            <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeConfig.bg} ${typeConfig.text}`}>
                                            {typeConfig.label}
                                        </span>
                                        <span className="text-xs text-gray-500 hidden sm:block">{statusLabel}</span>
                                        {item.due_date && (() => {
                                            const today = new Date(); today.setHours(0,0,0,0);
                                            const due = new Date(item.due_date); due.setHours(0,0,0,0);
                                            const days = Math.round((due - today) / 86400000);
                                            const label = days < 0 ? `${Math.abs(days)}T überfällig` : days === 0 ? 'Heute fällig' : days === 1 ? 'Morgen fällig' : `${days} Tage`;
                                            const cls = days < 0 ? 'bg-red-100 text-red-700' : days <= 1 ? 'bg-orange-100 text-orange-700' : days <= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500';
                                            return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
                                        })()}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
            </div>}

            {/* Activity Feed — Admin only */}
            {widgets.activityFeed && isAdmin && activityFeed && activityFeed.length > 0 && (
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-lg font-semibold text-gray-900">Letzte Aktivitäten</h2>
                            <span className="ml-1 text-xs bg-gray-200 text-gray-600 font-semibold px-2 py-0.5 rounded-full">Admin</span>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute left-[41px] top-0 bottom-0 w-0.5 bg-gray-100 z-0" />
                        <div className="divide-y divide-gray-50">
                        {(showAllActivities ? activityFeed : activityFeed.slice(0, 15)).map((entry) => {
                            const actionPart = getActionPart(entry.action);
                            const actionConfig = {
                                created: { label: 'erstellt',   bg: 'bg-emerald-500', ring: 'ring-emerald-100' },
                                updated: { label: 'bearbeitet', bg: 'bg-blue-500',    ring: 'ring-blue-100' },
                                deleted: { label: 'gelöscht',   bg: 'bg-red-500',     ring: 'ring-red-100' },
                            }[actionPart] || { label: actionPart, bg: 'bg-gray-400', ring: 'ring-gray-100' };

                            const date = new Date(entry.created_at);
                            const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                            const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

                            return (
                                <div key={entry.id} className="relative flex items-start gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                                    {/* User Avatar */}
                                    <div className={`relative z-10 flex-shrink-0 h-9 w-9 rounded-full ${actionConfig.bg} ring-4 ${actionConfig.ring} flex items-center justify-center text-white font-bold text-sm`}>
                                        {entry.user_initial}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900 leading-snug">
                                            <span className="font-semibold text-gray-900">{entry.user_name}</span>
                                            <span className="text-gray-500"> hat </span>
                                            <span className="font-medium text-gray-700">{entry.model_label}</span>
                                            {entry.model_id && (
                                                <span className="text-gray-400"> #{entry.model_id}</span>
                                            )}
                                            <span className={`ml-1 inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${
                                                actionPart === 'created' ? 'bg-emerald-100 text-emerald-700' :
                                                actionPart === 'updated' ? 'bg-blue-100 text-blue-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>{actionConfig.label}</span>
                                        </p>
                                        {entry.description && (
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">{entry.description}</p>
                                        )}
                                        {entry.changed_fields && entry.changed_fields.length > 0 && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Geändert: {entry.changed_fields.join(', ')}
                                            </p>
                                        )}
                                    </div>

                                    {/* Timestamp */}
                                    <div className="flex-shrink-0 text-right">
                                        <p className="text-xs font-medium text-gray-700">{timeStr} Uhr</p>
                                        <p className="text-xs text-gray-400">{dateStr}</p>
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                    </div>
                    {activityFeed.length > 15 && (
                        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => setShowAllActivities(v => !v)}
                                className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                            >
                                <svg className={`w-4 h-4 transition-transform duration-200 ${showAllActivities ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                {showAllActivities
                                    ? 'Weniger anzeigen'
                                    : `${activityFeed.length - 15} weitere Aktivitäten anzeigen`}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}
