<?php

namespace App\Mail;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LeaveRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public LeaveRequest $leaveRequest, public string $eventType = 'created') {}

    public function envelope(): Envelope
    {
        $subjects = [
            'created'  => 'Neuer Urlaubsantrag von ' . $this->leaveRequest->user?->name,
            'approved' => 'Urlaubsantrag genehmigt',
            'rejected' => 'Urlaubsantrag abgelehnt',
        ];
        return new Envelope(subject: $subjects[$this->eventType] ?? 'Urlaubsantrag aktualisiert');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.leave-request');
    }
}
