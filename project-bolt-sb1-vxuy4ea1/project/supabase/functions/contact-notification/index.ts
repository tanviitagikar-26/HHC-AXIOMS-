declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Inquiry = {
  full_name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
};

function isValidInquiry(value: unknown): value is Inquiry {
  if (!value || typeof value !== 'object') return false;
  const inquiry = value as Record<string, unknown>;
  return typeof inquiry.full_name === 'string'
    && inquiry.full_name.trim().length >= 2
    && inquiry.full_name.length <= 120
    && typeof inquiry.company === 'string'
    && inquiry.company.trim().length >= 2
    && inquiry.company.length <= 160
    && typeof inquiry.email === 'string'
    && inquiry.email.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)
    && typeof inquiry.phone === 'string'
    && inquiry.phone.length >= 7
    && inquiry.phone.length <= 40
    && /^[+0-9().\s-]+$/.test(inquiry.phone)
    && typeof inquiry.message === 'string'
    && inquiry.message.trim().length >= 10
    && inquiry.message.length <= 4000;
}

function jsonResponse(body: Record<string, string>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }
  if (!isValidInquiry(payload)) return jsonResponse({ error: 'Please provide valid inquiry details.' }, 400);

  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('CONTACT_EMAIL_FROM');
  const to = Deno.env.get('CONTACT_EMAIL_TO') ?? 'info@hhcaxioms.com';
  if (!apiKey || !from) {
    console.error('contact notification email is not configured');
    return jsonResponse({ error: 'Email notifications are not configured.' }, 503);
  }

  const message = [
    `1. Full name: ${payload.full_name.trim()}`,
    `2. Company: ${payload.company.trim()}`,
    `3. Work email: ${payload.email.trim()}`,
    `4. Phone: ${payload.phone.trim()}`,
    `5. Tell us about your brief: ${payload.message.trim()}`,
  ].join('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: payload.email.trim(),
        subject: `Website inquiry from ${payload.full_name.trim()}`,
        text: message,
      }),
    });
    if (!response.ok) {
      console.error('Resend rejected the contact notification', response.status, await response.text());
      return jsonResponse({ error: 'The email notification could not be sent.' }, 502);
    }
    return jsonResponse({ message: 'Inquiry email sent.' }, 200);
  } catch (error) {
    console.error('contact notification request failed', error);
    return jsonResponse({ error: 'The email notification could not be sent.' }, 502);
  }
});
