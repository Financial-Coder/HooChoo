# Railway Deployment Configuration

## Current Setup

This project uses a **monorepo structure** with the backend in the `/backend` directory.

## Railway Configuration Files

- **`/railway.json`**: Main Railway configuration at project root
- **`/backend/nixpacks.toml`**: Nixpacks configuration for the backend service

## Deployment Options

### Option 1: Using Root Directory Setting (Recommended)

**Railway Dashboard Settings:**
- Set **Root Directory** to: `backend`
- The `nixpacks.toml` in the backend folder will be used
- Build command: Automatic (defined in nixpacks.toml)
- Start command: Automatic (defined in nixpacks.toml)

### Option 2: NO Root Directory Setting

If Root Directory is NOT set in Railway:
- Railway will use `/railway.json` at the project root
- This file contains `cd backend && ...` commands
- Less recommended, but works

## Current Configuration

### `/backend/nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ['nodejs_20', 'openssl']

[phases.install]
cmds = ['npm ci']

[phases.build]
cmds = ['npx prisma generate', 'npm run build']

[start]
cmd = 'npx prisma db push --accept-data-loss && node dist/main'
```

## Required Environment Variables

Make sure these are set in Railway:

- `DATABASE_URL` - PostgreSQL database connection string
- `JWT_SECRET` - Secret key for JWT authentication
- `PORT` - (Auto-set by Railway, usually unnecessary to set manually)

## Troubleshooting

### 404 Error
- Check Railway logs for build/start errors
- Verify Root Directory is set to `backend`
- Ensure DATABASE_URL is correctly configured

### 502 Error
- Check if Prisma migration failed
- Verify database is accessible
- Check Railway logs for application crash

### "Hello World" Instead of API
- Backend service is not starting properly
- Check for Node.js/NestJS errors in logs
- Verify build completed successfully

## Manual Steps After Code Push

1. **Verify Root Directory**: Railway Dashboard → Service Settings → Root Directory = `backend`
2. **Check Environment Variables**: Ensure all required vars are set
3. **Monitor Deployment**: Watch build logs for any errors
4. **Test Endpoints**: After deployment, test https://hoochoo-production.up.railway.app/

## Testing Deployment

```bash
# Test root endpoint
curl https://hoochoo-production.up.railway.app/

# Test auth endpoint (should return 400 or method not allowed, not 404)
curl https://hoochoo-production.up.railway.app/auth/login
```
