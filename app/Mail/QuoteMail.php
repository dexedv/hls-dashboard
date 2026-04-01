<?php

namespace App\Mail;

use App\Models\Quote;
use App\Services\PdfService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class QuoteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Quote $quote)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Angebot ' . $this->quote->number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.quote',
        );
    }

    public function attachments(): array
    {
        $pdf = PdfService::generateQuotePdf($this->quote);

        return [
            \Illuminate\Mail\Mailables\Attachment::fromData(
                fn () => $pdf->output(),
                'Angebot_' . $this->quote->number . '.pdf'
            )->withMime('application/pdf'),
        ];
    }
}
