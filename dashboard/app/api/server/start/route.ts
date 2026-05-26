import { NextResponse } from 'next/server';
const COOLIFY_API = process.env.COOLIFY_API_URL;
const COOLIFY_TOKEN = process.env.COOLIFY_API_TOKEN;
const CS2_SERVICE_UUID = process.env.CS2_SERVICE_UUID;

export async function POST(request: Request) {
  try {
    if (!COOLIFY_API || !COOLIFY_TOKEN || !CS2_SERVICE_UUID) {
      return NextResponse.json({ success: false, error: 'Coolify API not configured' }, { status: 500 });
    }
    const config = await request.json();
    const modeMap: Record<string, { mode: number; type: number }> = {
      casual: { mode: 0, type: 0 }, competitive: { mode: 1, type: 0 },
      deathmatch: { mode: 2, type: 1 }, wingman: { mode: 2, type: 0 },
      armsrace: { mode: 0, type: 1 }, demolition: { mode: 1, type: 1 }
    };
    const gameConfig = modeMap[config.gameMode] || modeMap.casual;
    const envVars = [
      { key: 'CS2_SERVERNAME', value: config.name },
      { key: 'CS2_MAXPLAYERS', value: String(config.maxPlayers) },
      { key: 'CS2_MAP', value: config.map },
      { key: 'CS2_GAMEMODE', value: String(gameConfig.mode) },
      { key: 'CS2_GAMETYPE', value: String(gameConfig.type) },
      { key: 'CS2_PW', value: config.password || '' },
      { key: 'CS2_RCONPW', value: config.rconPassword || 'changeme' },
      { key: 'AUTO_SHUTDOWN', value: String(config.autoShutdown) },
      { key: 'IDLE_TIMEOUT', value: String(config.idleTimeout) }
    ];
    for (const env of envVars) {
      await fetch(`${COOLIFY_API}/services/${CS2_SERVICE_UUID}/envs`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${COOLIFY_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(env)
      });
    }
    const startRes = await fetch(`${COOLIFY_API}/services/${CS2_SERVICE_UUID}/start`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${COOLIFY_TOKEN}` }
    });
    if (!startRes.ok) throw new Error(await startRes.text());
    return NextResponse.json({ success: true, message: 'Server starting', config: { ...config, ...gameConfig } });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
