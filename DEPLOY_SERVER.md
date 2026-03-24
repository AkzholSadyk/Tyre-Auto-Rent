# TYRE Backend Deployment

This project is ready to run on a VPS with Docker, PostgreSQL, FastAPI, and Nginx.

## 1. What you need on the server

- Ubuntu 22.04 or 24.04
- Domain pointed to the server IP
- Open ports:
  - `80`
  - `443`
  - optional `22` for SSH

## 2. Install Docker

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Re-login after adding your user to the docker group.

## 3. Copy the project

```bash
git clone <your-repo-url> tyre-platform
cd tyre-platform
```

Or upload the whole project manually to the server.

## 4. Prepare backend env

Create:

`backend/.env`

Example:

```env
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db:5432/tyre
SECRET_KEY=YOUR_LONG_RANDOM_SECRET
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ADMIN_PANEL_EMAIL=akzholsadyk@gmail.com
ADMIN_PANEL_PASSWORD=YOUR_ADMIN_PASSWORD
ADMIN_PANEL_TOKEN_EXPIRE_MINUTES=720
STRIPE_API_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
KASPI_MERCHANT_ID=
GOOGLE_MAPS_API_KEY=
```

## 5. Set database password for compose

Before running containers:

```bash
export POSTGRES_PASSWORD=YOUR_DB_PASSWORD
```

If you want, you can place it into a root `.env` file for Docker Compose later.

## 6. Set your domain in Nginx

Open:

`nginx/nginx.conf`

Replace:

```nginx
server_name your-domain.com www.your-domain.com;
```

with your real domain, for example:

```nginx
server_name api.tyreautorent.kz tyreautorent.kz www.tyreautorent.kz;
```

## 7. Frontend production API

Production frontend is configured to use the same domain:

`frontend/tyre-frontend/src/environments/environment.prod.ts`

So API requests will go to:

- `/api/v1/...`
- `/uploads/...`

through Nginx automatically.

## 8. Start the stack

```bash
docker compose up -d --build
```

Check:

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f nginx
```

## 9. Health check

Open:

- `http://YOUR_DOMAIN/health`
- `http://YOUR_DOMAIN/api/v1/cars`

If you want the health route to work through the domain root, add a separate Nginx location for `/health`.

At the moment:

- frontend is served from `/`
- API is served from `/api/`
- uploads are served from `/uploads/`

## 10. SSL with Certbot

Install:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Then:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

After SSL is installed, reload:

```bash
docker compose restart nginx
```

## 11. Important persistence

Media files are stored in:

- `backend/uploads/cars`
- `backend/uploads/home`
- `backend/uploads/documents`
- `backend/uploads/licenses`

These are mounted into the backend container, so files stay on the server after restarts.

PostgreSQL data is stored in Docker volume:

- `postgres_data`

## 12. Useful commands

Restart:

```bash
docker compose restart
```

Rebuild after code changes:

```bash
docker compose up -d --build
```

Stop:

```bash
docker compose down
```

See logs:

```bash
docker compose logs -f
```
