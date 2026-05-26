import { NextResponse } from 'next/server';

const COOLIFY_API = process.env.COOLIFY_API_URL;
const COOLIFY_TOKEN = process.env.COOLIFY_API_TOKEN;
const CS2_SERVICE_UUID = process.env.CS2_SERVICE_UUID;
const PUBLIC_IP = process.env.PUBLIC_IP;

export async function GET() {
  try {
    let status = {
      status: 'stopped' as const,
      players: 0,
      maxPlayers: 14,
      map: 'de_dust2',
      uptime: '0m',
      ip: PUBLIC_IP || '',
      port: 27015
    };

    if (!COOLIFY_API || !COOLIFY_TOKEN || !CS2_SERVICE_UUID) {
      return NextResponse.json({
        ...status,
        status: 'error' as const,
        error: 'Coolify API not configured'
      });
    }

    const containerRes = await fetch(`${COOLIFY_API}/services/${CS2_SERVICE_UUID}`, {
      headers: { 'Authorization': `Bearer ${COOLIFY_TOKEN}` }
    }).catch(() => null);

    if (containerRes && containerRes.ok) {
      const container = await containerRes.json();
      const isRunning = container.status === 'running' || 
                       container.status === 'healthy' ||
                       container.state === 'running';

      if (isRunning) {
        status.status = 'running';
        status.uptime = container.uptime || '0m';
      }
    }

    return NextResponse.json(status);

  } catch (error) {
    return NextResponse.json({
      status: 'error' as const,
      players: 0,
      maxPlayers: 14,
      map: 'de_dust2',
      uptime: '0m',
      ip: PUBLIC_IP || '',
      port: 27015,
      error: String(error)
    });
  }
}
