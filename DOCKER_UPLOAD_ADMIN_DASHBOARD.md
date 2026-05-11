# Admin Dashboard Docker Deployment Guide

This guide is only for deploying `Mansoor-web-Admin-dashboard`.

## Prerequisites

- A Linux server with Docker installed
- Open port for dashboard (example: `8081`)
- Your backend API already reachable from browser

## 1) Copy project to server

Upload this folder to server:

`Mansoor-web-Admin-dashboard`

## 2) Login to server and go to project folder

```bash
cd /path/to/Mansoor-web-Admin-dashboard
```

## 3) Build Docker image

If your API URL is:
`https://web.rioassetmanagement.net/mansoor-api/api`

run:

```bash
docker build \
  --build-arg VITE_API_BASE_URL="https://web.rioassetmanagement.net/mansoor-api/api" \
  -t mansoor-admin-dashboard:latest .
```

## 4) Run container

```bash
docker run -d \
  --name mansoor-admin-dashboard \
  -p 8081:80 \
  --restart unless-stopped \
  mansoor-admin-dashboard:latest
```

## 5) Verify deployment

```bash
docker ps
docker logs --tail 100 mansoor-admin-dashboard
curl -I http://127.0.0.1:8081
```

If you use Nginx on host, reverse proxy your domain/path to `127.0.0.1:8081`.

---

## Update / Redeploy Steps

When code changes:

1. Upload new dashboard code to the same folder.
2. Rebuild image:

```bash
docker build \
  --build-arg VITE_API_BASE_URL="https://web.rioassetmanagement.net/mansoor-api/api" \
  -t mansoor-admin-dashboard:latest .
```

3. Replace running container:

```bash
docker stop mansoor-admin-dashboard
docker rm mansoor-admin-dashboard
docker run -d \
  --name mansoor-admin-dashboard \
  -p 8081:80 \
  --restart unless-stopped \
  mansoor-admin-dashboard:latest
```

4. Verify:

```bash
docker ps
docker logs --tail 100 mansoor-admin-dashboard
```

---

## Rollback (if needed)

If you keep previous image tag (example `:v1`), rollback is:

```bash
docker stop mansoor-admin-dashboard
docker rm mansoor-admin-dashboard
docker run -d \
  --name mansoor-admin-dashboard \
  -p 8081:80 \
  --restart unless-stopped \
  mansoor-admin-dashboard:v1
```

---

## Notes

- `VITE_API_BASE_URL` is build-time config for React/Vite.
- If API URL changes, rebuild image with new `--build-arg`.
- This image serves static dashboard files through Nginx with SPA routing support.
