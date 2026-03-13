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

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid form data' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const serviceType = String(formData.get('serviceType') || '').trim();
  let projectDescription = String(formData.get('projectDescription') || '').trim();
  const neighborhood = String(formData.get('neighborhood') || '').trim();
  const photo = formData.get('photo');

  if (photo && photo.name && photo.size > 0) {
    if (env.IMG_BUCKET) {
      const ext = photo.name.split('.').pop() || 'jpg';
      const filename = `quote-uploads/${crypto.randomUUID()}.${ext}`;
      try {
        await env.IMG_BUCKET.put(filename, photo.stream(), {
          httpMetadata: { contentType: photo.type || 'application/octet-stream' },
        });
        const fileUrl = `https://pub-199d68b182e5418180128341149a9402.r2.dev/${filename}`;
        projectDescription += `\n\nUploaded Photo: ${fileUrl}`;
      } catch (err) {
        console.error('Failed to upload photo to R2:', err);
      }
    }
  }

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
      JSON.stringify({ success: true, message: "Thank you! We'll be in touch soon." }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Submission failed. Please try again or call us.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
