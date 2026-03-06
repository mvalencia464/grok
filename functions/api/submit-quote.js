/**
 * Cloudflare Pages Function: POST /api/submit-quote
 * Receives quote form JSON and creates a contact in GoHighLevel (GHL).
 * Env vars (set in Cloudflare Pages): HIGHLEVEL_TOKEN, HIGHLEVEL_LOCATION_ID
 */
const GHL_BASE = 'https://services.leadconnectorhq.com';

export async function onRequestPost(context) {
  const { request, env } = context;
  const token = env.HIGHLEVEL_TOKEN;
  const locationId = env.HIGHLEVEL_LOCATION_ID;

  if (!token || !locationId) {
    return new Response(
      JSON.stringify({ success: false, error: 'Server configuration error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const serviceType = String(body.serviceType || '').trim();
  const projectDescription = String(body.projectDescription || '').trim();
  const neighborhood = String(body.neighborhood || '').trim();

  if (!name || !email || !phone) {
    return new Response(
      JSON.stringify({ success: false, error: 'Name, email, and phone are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const nameParts = name.split(/\s+/);
  const firstName = nameParts[0] || name;
  const lastName = nameParts.slice(1).join(' ') || '';

  const tags = ['quote', 'website'];
  if (serviceType) tags.push(serviceType);
  if (neighborhood) tags.push(neighborhood);

  const contactPayload = {
    locationId,
    firstName,
    lastName,
    email,
    phone,
    source: 'Website Quote Form',
    tags,
  };

  const projectDescriptionFieldId = env.HIGHLEVEL_CUSTOM_FIELD_PROJECT_DESCRIPTION;
  if (projectDescriptionFieldId && projectDescription.trim()) {
    contactPayload.customFields = [
      { id: projectDescriptionFieldId, value: projectDescription.trim() },
    ];
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };

  try {
    const res = await fetch(`${GHL_BASE}/contacts/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(contactPayload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: data.message || data.error || `GHL API error (${res.status})`,
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Thank you! We’ll be in touch soon.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Submission failed. Please try again or call us.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
