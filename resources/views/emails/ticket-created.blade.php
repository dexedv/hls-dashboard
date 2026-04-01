<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Neues Ticket</title>
    <style>
        body { font-family: -apple-system, sans-serif; background: #f9fafb; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; }
        h1 { font-size: 20px; color: #111827; margin: 0 0 8px; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
        .urgent { background: #fee2e2; color: #dc2626; }
        .high { background: #fef3c7; color: #d97706; }
        .medium { background: #dbeafe; color: #2563eb; }
        .low { background: #f3f4f6; color: #6b7280; }
        .meta { color: #6b7280; font-size: 14px; margin: 16px 0; }
        .description { background: #f9fafb; border-radius: 8px; padding: 16px; color: #374151; font-size: 14px; white-space: pre-wrap; }
        .btn { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-top: 24px; }
        .footer { color: #9ca3af; font-size: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="card">
        <h1>🎫 Neues Ticket erstellt</h1>
        <div class="meta">
            <strong>{{ $ticket->title }}</strong>
            <span class="badge {{ $ticket->priority }}">{{ ucfirst($ticket->priority) }}</span>
        </div>
        @if($ticket->customer)
            <p class="meta">Kunde: <strong>{{ $ticket->customer->name }}</strong></p>
        @endif
        @if($ticket->description)
            <div class="description">{{ $ticket->description }}</div>
        @endif
        @if($ticket->sla_hours)
            <p class="meta">⏱ SLA: {{ $ticket->sla_hours }} Stunden</p>
        @endif
        <a href="{{ route('tickets.show', $ticket->id) }}" class="btn">Ticket ansehen</a>
        <div class="footer">Diese E-Mail wurde automatisch von HLS Dashboard gesendet.</div>
    </div>
</body>
</html>
