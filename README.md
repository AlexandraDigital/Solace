# Solace — Mental Health Support Platform

Built on **Cloudflare Pages + D1 + Workers**.

---

## Project structure

```
solace/
├── public/
│   └── index.html          # Full frontend (user + advisor)
├── functions/
│   └── api/
│       ├── _auth.js        # Shared session/hash helpers
│       ├── me.js           # GET  /api/me
│       ├── login.js        # POST /api/login
│       ├── logout.js       # POST /api/logout
│       ├── questions.js    # GET/POST /api/questions
│       ├── answer.js       # POST /api/answer
│       ├── dismiss.js      # POST /api/dismiss
│       └── setup.js        # POST /api/setup  (one-time)
├── schema/
│   └── schema.sql
└── wrangler.toml
```

---

## Deploy in 5 steps

### 1. Install Wrangler
```bash
npm install -g wrangler
wrangler login
```

### 2. Create your D1 database
```bash
wrangler d1 create solace-db
```
Copy the `database_id` it outputs and paste it into `wrangler.toml`.

### 3. Run the schema
```bash
wrangler d1 execute solace-db --file=schema/schema.sql
```

### 4. Deploy to Cloudflare Pages
```bash
# From the project root:
wrangler pages deploy public --project-name=solace
```
The first deploy creates the project. After that, the `functions/` folder is
automatically picked up by Cloudflare Pages Functions.

> **Tip:** Link the D1 binding in the Cloudflare dashboard:
> Pages → solace → Settings → Functions → D1 database bindings → add `DB` → select `solace-db`

### 5. Create your advisor account (one-time)
Once deployed, hit the setup endpoint **once** to create your account:
```bash
curl -X POST https://your-site.pages.dev/api/setup \
  -H "Content-Type: application/json" \
  -d '{"name":"Your Name","email":"you@email.com","password":"yourpassword"}'
```
This endpoint **automatically disables itself** after the first advisor is created.

---

## Environment variables

Set these in the Cloudflare Pages dashboard (Settings → Environment variables):

| Variable | Description |
|---|---|
| `SESSION_SECRET` | Long random string for session signing |

---

## Local development

```bash
# Install deps (none needed — no npm packages used)
wrangler pages dev public --d1=DB=solace-db
```

---

## How it works

| Route | Auth | Purpose |
|---|---|---|
| `GET /api/me` | — | Check if session is valid |
| `POST /api/login` | — | Advisor sign in, sets HttpOnly cookie |
| `POST /api/logout` | — | Clear session |
| `POST /api/questions` | — | Public: submit a question |
| `GET /api/questions` | Advisor | List new questions |
| `POST /api/answer` | Advisor | Post a response + mark answered |
| `POST /api/dismiss` | Advisor | Mark question as dismissed |
| `POST /api/setup` | — | One-time advisor account creation |

Sessions are stored in D1, expire after 7 days, and use `HttpOnly; Secure; SameSite=Lax` cookies.
Passwords are hashed with SHA-256 via the Web Crypto API (no npm dependencies needed).

---

## Adding more advisors

After your first account is set up, log in and use the D1 console or Wrangler to insert more:

```bash
# Generate a hash first
node -e "
const crypto = require('crypto');
console.log(crypto.createHash('sha256').update('newpassword').digest('hex'));
"

# Then insert via wrangler
wrangler d1 execute solace-db --command \
  "INSERT INTO advisors (name, email, password_hash) VALUES ('Name', 'email@x.com', 'HASH_HERE')"
```
