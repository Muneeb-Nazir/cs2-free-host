import { NextResponse } from 'next/server';
const COOLIFY_API = process.env.COOLIFY_API_URL;
const COOLIFY_TOKEN = process.env.COOLIFY_API_TOKEN;
const CS2_SERVICE_UUID = process.env.CS2_SERVICE_UUID;

export async function POST() {
  try {
    if (!COOLIFY_API || !COOLIFY_TOKEN || !CS2_SERVICE_UUID) {
      return NextResponse.json({ success: false, error: 'Coolify API not configured' }, { status: 500 });
    }
    const stopRes = await fetch(`${COOLIFY_API}/services/${CS2_SERVICE_UUID}/stop`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${COOLIFY_TOKEN}` }
    });
    if (!stopRes.ok) throw new Error(await stopRes.text());
    return NextResponse.json({ success: true, message: 'Server stopping' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
