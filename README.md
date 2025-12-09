Mind Mend App

A modern, responsive mental-health companion built using Vite, React, TypeScript, Tailwind CSS, and shadcn-ui.
This project supports features like mood tracking, journaling, AI-powered suggestions, and Supabase-based authentication + database.

🚀 Getting Started (Local Development)
Requirements

Node.js (LTS recommended)

npm or pnpm or yarn

Git

Steps
# 1. Clone the repository
git clone https://github.com/Harsha-v-r/Mind-Mend-App.git

# 2. Go into the project directory
cd Mind-Mend-App

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev


Your project will start on a local development server (e.g., http://localhost:5173/ depending on Vite settings).

🛠️ Technologies Used

This project is built with:

Vite – Fast build & dev server

React – Frontend UI

TypeScript – Type-safe development

Tailwind CSS – Utility-first styling

shadcn-ui – Modern UI components

Supabase – Authentication, database, edge functions

AI Integration – Gemini / LLM-powered emotional support suggestions

🌐 Deployment Guide

You can deploy this project using Vercel, Netlify, or any hosting service that supports Vite builds.

Deploy on Vercel

Go to https://vercel.com

Import your GitHub repo

Add all required environment variables:

VITE_SUPABASE_URL

VITE_SUPABASE_PUBLISHABLE_KEY

SUPABASE_SERVICE_ROLE_KEY

GEMINI_API_KEY

(any others used by your project)

Build command:

npm run build


Output directory:

dist


Deploy

🔑 Environment Variables

Create a .env.local file in the project root:

VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
GEMINI_API_KEY="your_gemini_key"


⚠️ Never commit .env.local to GitHub.

📂 Editing the Project

You can modify the app in any of the following ways:

✔ Using VS Code (recommended)

Clone the repo

Edit files

Commit & push changes

Vercel auto-deploys (if connected)

✔ Editing directly on GitHub

Open any file

Click the ✏️ "Edit" icon

Commit changes directly in the browser

✔ GitHub Codespaces

If you want to use a cloud-based VS Code environment:

Open the repo on GitHub

Click Code → Codespaces → Create New Codespace

Edit and commit normally

📡 Backend (Supabase)

This project uses:

Supabase Auth

Supabase Database (Postgres)

Supabase Edge Functions (TypeScript)

Make sure your tables, SQL schema, and edge functions are deployed correctly.

📝 License

This project is owned by Harsha-v-r.
Feel free to fork, improve, or contribute if allowed.
