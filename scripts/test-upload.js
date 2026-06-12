const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const vendorId = process.env.VENDOR_ID || '00000000-0000-0000-0000-000000000000';

async function run() {
  try {
    const form = new FormData();

    form.append('vendorId', vendorId);

    const base = __dirname + '/test-files';

    // Attach files if they exist
    const files = [
      ['pan_card', 'pan.pdf', 'application/pdf'],
      ['aadhaar_card', 'aadhaar.jpg', 'image/jpeg'],
      ['fssai_license', 'fssai.pdf', 'application/pdf'],
    ];

    for (const [field, name, contentType] of files) {
      const path = `${base}/${name}`;
      if (fs.existsSync(path)) {
        form.append(field, fs.createReadStream(path), { filename: name, contentType });
      } else {
        console.warn('Missing test file:', path);
      }
    }

    console.log('Posting to', `${BACKEND_URL}/api/vendor-documents/upload`);

    const res = await fetch(`${BACKEND_URL}/api/vendor-documents/upload`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
      timeout: 30000,
    });

    const text = await res.text();

    console.log('Status:', res.status);
    console.log('Response body:', text);

    if (!res.ok) process.exitCode = 2;
  } catch (err) {
    console.error('Test upload failed:', err);
    process.exitCode = 1;
  }
}

run();
