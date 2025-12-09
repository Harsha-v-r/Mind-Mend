 #Mind Mend App

A modern mental-wellness companion built with React, TypeScript, Vite, Tailwind CSS, shadcn-ui, Supabase, and AI-powered mood analysis. [web:59][web:55]

---

## 🧠 Overview

Mind Mend helps users track their mood, journal their thoughts, and receive AI-generated insights to better understand their emotional patterns. [web:30]  
The app uses Supabase for authentication, data storage, and edge functions, combined with Gemini for AI-driven mood analysis. [web:59][web:60]

---

## 🛠 Tech Stack

- Vite  
- React + TypeScript  
- Tailwind CSS  
- shadcn-ui  
- Supabase (Auth, Database, Edge Functions)  
- Gemini / AI Integration [web:55][web:59][web:60]

---

## 🚀 Getting Started

### 1. Clone the repository

git clone https://github.com/Harsha-v-r/Mind-Mend-App.git
cd Mind-Mend-App

text

### 2. Install dependencies

npm install

text

### 3. Start the development server

npm run dev

text

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root and add:

VITE_SUPABASE_URL=""
VITE_SUPABASE_PUBLISHABLE_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
GEMINI_API_KEY=""

text

> ⚠️ Do **NOT** commit `.env.local` to GitHub. [web:59]

---

## 🌐 Deployment (Vercel)

1. Go to https://vercel.com  
2. Import this repository  
3. Add all required environment variables from `.env.local` in the Vercel dashboard  
4. Set **Build Command**:

npm run build

text

5. Set **Output Directory**:

dist

text

6. Deploy the project. [web:58][web:59]

---

## 📁 Core Features

- Mood tracking  
- Journaling  
- AI-generated mood suggestions  
- Supabase authentication  
- Mood history  
- Edge Function–based AI processing  
- Responsive UI for mobile and desktop [web:30][web:59]

---

## 🧩 Editing the Project

### Using VS Code / Local Git

git add .
git commit -m "your message"
git push

text

### Using GitHub Web

- Open any file  
- Click the ✏️ **Edit** icon  
- Commit your changes to the desired branch

### Using GitHub Codespaces

- Open the repo on GitHub  
- Click **Code → Codespaces → Create**  
- Edit, run, and debug directly in the browser

---

## 📂 Folder Structure (Simplified)

Mind-Mend-App/
│
├── src/
│ ├── components/
│ ├── pages/
│ ├── hooks/
│ ├── lib/
│ └── styles/
│
├── supabase/
│ ├── migrations/
│ └── functions/
│
├── public/
├── package.json
├── vite.config.ts
└── README.md

text

---

## 📝 License

This project is owned by **Harsha-v-r**.  
Please refer to the repository for licensing details or contact the owner for permissions. [web:51]
