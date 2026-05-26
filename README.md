# FSHOST CS2 - Free Counter-Strike 2 Server Hosting

A self-hosted CS2 server management platform built for Coolify, inspired by FSHOST.me.

## Features

- One-click CS2 server deployment
- All official maps supported
- Up to 14 players (configurable)
- Optional auto-shutdown to save resources
- Password protection & RCON admin access
- Web dashboard for management

## Prerequisites

- Coolify instance (v4+)
- Ubuntu 22.04 VM with:
  - 6GB+ RAM
  - 4 CPU cores
  - 60GB+ disk space
  - Public IP with UDP port 27015 forwarded
- Steam account with CS2 (for GSLT token)

## Quick Deploy

1. **Get Steam GSLT Token**
   - Visit: https://steamcommunity.com/dev/managegameservers
   - Create a new token for App ID 730
   - Save the token

2. **Configure Coolify**
   - Create new Resource -> Docker Compose -> Git Repository
   - Paste your repo URL
   - Fill environment variables from `.env.example`
   - Set CS2 service to **Host Network Mode**

3. **Port Forwarding**
   - Forward UDP 27015 to your VM IP
   - Forward TCP 27015 for RCON

4. **Deploy**
   - Click Deploy in Coolify
   - Access dashboard at `http://your-ip:3000`

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

## Architecture

```
Browser -> Dashboard (Next.js) -> Coolify API -> CS2 Server (Docker, UDP 27015)
```

## Troubleshooting

**Server not visible in browser?**
- Check UDP port forwarding
- Verify GSLT token is valid
- Check Coolify service logs

**Out of memory?**
- Lower `CS2_MAXPLAYERS` to 10
- Reduce `CS2_TICKRATE` to 64
- Add swap space

## License

MIT - Free for personal use.