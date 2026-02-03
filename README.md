# Photography Portfolio

This repository contains a simple Node/Express photography portfolio with an admin panel.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Configure admin credentials (run interactive setup):

```bash
npm run setup
```

3. Start the server:

```bash
npm start
```

4. Open in your browser:

- Gallery: http://localhost:3000/
- Admin: http://localhost:3000/admin.html

Notes for GitHub

- Do not commit `data/config.json` (contains secrets). A sample is provided as `data/config.example.json`.
- Uploads are ignored from the repo; placeholder `.gitkeep` files are included so directory structure is preserved.

Create a new GitHub repo and push these commands (example):

```bash
git init
git add .
git commit -m "Initial commit: photography portfolio"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

Deployment

This is a Node app (not static). Use services like Render, Railway, or Heroku to deploy. Ensure you set an environment variable or use the `setup.js` to create `data/config.json` on the host.
