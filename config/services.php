<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'supabase' => [
        'url' => env('SUPABASE_URL', 'https://ebttwowzsltieychkldz.supabase.co'),
        'anon_key' => env('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVidHR3b3d6c2x0aWV5Y2hrbGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjczMDcsImV4cCI6MjA4ODg0MzMwN30.sT2Gh6t9aeMs-XJVX5fw6kFmT2OTEtcoANL19Ygb_Bo'),
        'service_key' => env('SUPABASE_SERVICE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVidHR3b3d6c2x0aWV5Y2hrbGR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI2NzMwNywiZXhwIjoyMDg4ODQzMzA3fQ.sYlUogfQ1SkaGBcc_5F0GffX5BqM8hSyHrGEq1J_uUY'),
    ],

    'lexware' => [
        'base_url' => env('LEXWARE_BASE_URL', 'https://api.lexware.io/v1'),
        'api_key' => env('LEXWARE_API_KEY', ''),
    ],

];
