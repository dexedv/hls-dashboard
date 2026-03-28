<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a56db;">Angebot {{ $quote->number }}</h2>

        <p>Sehr geehrte Damen und Herren,</p>

        <p>anbei erhalten Sie unser Angebot <strong>{{ $quote->number }}</strong>.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Angebotsnummer:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{{ $quote->number }}</td>
            </tr>
            @if($quote->valid_until)
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Gültig bis:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{{ \Carbon\Carbon::parse($quote->valid_until)->format('d.m.Y') }}</td>
            </tr>
            @endif
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Gesamtbetrag:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">{{ number_format($quote->total ?? 0, 2, ',', '.') }} EUR</td>
            </tr>
        </table>

        <p>Das Angebot finden Sie als PDF im Anhang dieser E-Mail.</p>

        <p>Mit freundlichen Grüßen</p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            Diese E-Mail wurde automatisch von HLS Dashboard erstellt.
        </div>
    </div>
</body>
</html>
