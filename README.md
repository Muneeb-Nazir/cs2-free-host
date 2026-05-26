# FSHOST CS2 - Free Counter-Strike 2 Server Hosting

A self-hosted CS2 server management platform built for Coolify.

## Quick Deploy

1. Get Steam GSLT Token: https://steamcommunity.com/dev/managegameservers (App ID: 730)
2. In Coolify: Create Resource -> Docker Compose -> Git Repository -> Paste this repo URL
3. Set environment variables from `.env.example`
4. Set CS2 service to Host Network Mode
5. Deploy

## Structure

```
cs2-free-host/
├── docker-compose.yml          # Main compose file
├── .env.example                # Environment variables template
├── dashboard/                  # Next.js web UI
│   ├── Dockerfile
│   ├── package.json
│   └── app/
└── cs2-server/                 # CS2 Dedicated Server
    ├── Dockerfile
    ├── entrypoint.sh
    └── server.cfg.template
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STEAM_GSLT` | Yes | Steam game server token |
| `COOLIFY_API_TOKEN` | Yes | Coolify API authentication |
| `COOLIFY_API_URL` | Yes | Coolify API endpoint |
| `CS2_SERVICE_UUID` | Yes | UUID of CS2 service in Coolify |
| `PUBLIC_IP` | Yes | Your public IP address |
| `AUTO_SHUTDOWN` | No | `true` or `false` |
| `IDLE_TIMEOUT` | No | Minutes before auto-shutdown |

## Ports

- Dashboard: TCP 3000
- CS2 Server: UDP 27015, TCP 27015 (RCON), UDP 27020 (SourceTV)
