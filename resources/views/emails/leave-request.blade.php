<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Urlaubsantrag</title>
    <style>
        body { font-family: -apple-system, sans-serif; background: #f9fafb; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; }
        h1 { font-size: 20px; color: #111827; margin: 0 0 8px; }
        .meta { color: #6b7280; font-size: 14px; margin: 8px 0; }
        .status-approved { color: #16a34a; font-weight: 700; }
        .status-rejected { color: #dc2626; font-weight: 700; }
        .status-pending { color: #d97706; font-weight: 700; }
        .btn { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-top: 24px; }
        .footer { color: #9ca3af; font-size: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="card">
        <h1>🏖 Urlaubsantrag</h1>
        <p class="meta">Mitarbeiter: <strong>{{ $leaveRequest->user?->name }}</strong></p>
        <p class="meta">Zeitraum: <strong>{{ \Carbon\Carbon::parse($leaveRequest->start_date)->format('d.m.Y') }} – {{ \Carbon\Carbon::parse($leaveRequest->end_date)->format('d.m.Y') }}</strong></p>
        <p class="meta">Typ: {{ $leaveRequest->type ?? 'Urlaub' }}</p>
        @if($leaveRequest->notes)
            <p class="meta">Notizen: {{ $leaveRequest->notes }}</p>
        @endif
        <p class="meta">Status:
            <span class="status-{{ $leaveRequest->status }}">{{ ucfirst($leaveRequest->status) }}</span>
        </p>
        <a href="{{ route('leave-requests.index') }}" class="btn">Urlaubsanträge ansehen</a>
        <div class="footer">Diese E-Mail wurde automatisch von HLS Dashboard gesendet.</div>
    </div>
</body>
</html>
