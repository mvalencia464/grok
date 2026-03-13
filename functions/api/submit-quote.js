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

  const contentType = request.headers.get('content-type') || '';
  let data = {};
  let photoFile = null;

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      photoFile = formData.get('photo');
      for (const [key, value] of formData.entries()) {
        if (key !== 'photo') data[key] = value;
      }
    } else {
      data = await request.json();
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request body', debug: String(err) }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const name = String(data.name || '').trim();
  const email = String(data.email || '').trim();
  const phone = String(data.phone || '').trim();
  const serviceType = String(data.serviceType || '').trim();
  let projectDescription = String(data.projectDescription || '').trim();
  const neighborhood = String(data.neighborhood || '').trim();

  // Handle Photo Upload (R2)
  if (photoFile && photoFile.name && photoFile.size > 0 && env.IMG_BUCKET) {
    const ext = photoFile.name.split('.').pop() || 'jpg';
    
    // Generate a unique filename using crypto or fallback to timestamp
    let uuid;
    try {
      uuid = crypto.randomUUID();
    } catch {
      uuid = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    }
    
    const filename = `deckmasters/${uuid}.${ext}`;
    
    try {
      // Passing the File object directly to .put() is often more robust than .stream()
      await env.IMG_BUCKET.put(filename, photoFile, {
        httpMetadata: { contentType: photoFile.type || 'application/octet-stream' },
      });
      
      const fileUrl = `https://pub-199d68b182e5418180128341149a9402.r2.dev/${filename}`;
      projectDescription += `\n\nUploaded Photo: ${fileUrl}`;
      console.log(`R2 Success: ${filename}`);
    } catch (err) {
      console.error('R2 Upload Failed:', err);
      // We don't crash the whole submission, but we note it for debugging
      projectDescription += `\n\n(Photo upload failed: ${String(err)})`;
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

  const basePayload = {
    locationId,
    firstName,
    lastName,
    email,
    phone,
    source: 'Website Quote Form',
    tags,
  };

  const projectDescriptionFieldId = env.HIGHLEVEL_CUSTOM_FIELD_PROJECT_DESCRIPTION;
  if (projectDescriptionFieldId && projectDescription) {
    basePayload.customFields = [
      { id: projectDescriptionFieldId, value: projectDescription },
    ];
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };

  const postToGHL = async (payload) => {
    const res = await fetch(`${GHL_BASE}/contacts/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const result = await res.json().catch(() => ({}));
    return { res, data: result };
  };

  try {
    let { res, data: ghlData } = await postToGHL(basePayload);

    // Fallback if custom field ID is wrong (common source of 400s)
    if (!res.ok && basePayload.customFields) {
      const fallbackPayload = { ...basePayload };
      delete fallbackPayload.customFields;
      const retry = await postToGHL(fallbackPayload);
      res = retry.res;
      ghlData = retry.data;
    }

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: ghlData.message || ghlData.error || `GHL API Error (${res.status})`,
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
      JSON.stringify({ success: false, error: 'Submission failed. Please try again.', debug: String(err) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

