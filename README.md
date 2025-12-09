# 🧠 Mind Mend – AI Mental Wellness Companion

A full-stack mental wellness application that helps users **track moods**, **journal thoughts**, and receive **AI-powered emotional support**.  
Built with modern technologies like **React, Supabase, Tailwind, shadcn-ui**, and **Gemini AI**, the app provides personalized insights and a smooth user experience.

---

## 🚀 Project Purpose

Mind Mend is designed to support mental well-being by:

- Helping users **capture daily moods and thoughts**
- Providing **AI-generated suggestions** for emotional balance
- Allowing users to view their **mood history** & patterns
- Acting as a friendly, always-available personal companion

---

## 🌐 Live Demo

https://mindmend.ai.vercel.app

---

## 🧱 Tech Stack

### 🖥️ Frontend
- **React.js**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **shadcn-ui**

### 🧠 Backend / Cloud
- **Supabase** (Auth + Database + Edge Functions)
- **PostgreSQL** (Supabase managed)

### 🤖 AI Integration
- **Gemini API** (via custom Supabase Edge Functions)

---

## 📑 Features

### 👤 User Features
- Create account & login securely  
- Log daily mood with intensity  
- Write journal entries  
- Receive **AI suggestions** based on mood  
- View past moods & insights  
- Clean, responsive UI  

### 🛠️ System Features
- Supabase **authentication**
- Row-level data access per user
- AI processing through secure **Edge Functions**
- Real-time database interactions
- Fully mobile-responsive design

---

## 🖼️ Pages Overview

| Page            | Description |
|-----------------|-------------|
| `/` (Home)      | App intro & feature overview |
| `/login`        | User login |
| `/register`     | User signup |
| `/mood`         | Add today’s mood |
| `/journal`      | Write your journal entry |
| `/history`      | View past mood logs |
| `/profile`      | User account info |

---

## 🤖 AI Flow (Edge Functions)

Mind Mend uses **Supabase Edge Functions** to connect safely to Gemini:

- User submits mood + journal  
- Edge function validates user  
- Sends prompt → Gemini  
- Saves suggestion into DB  
- Returns a personalized emotional support message  

This ensures:
- No API keys exposed
- Secure server-side AI processing
- User-specific insights saved safely

---

## 🗂️ Folder Structure (Simplified)

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
│ ├── migrations/ # Database schema
│ └── functions/ # AI Edge Functions
│
├── public/
├── package.json
├── vite.config.ts
└── README.md


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Harsha-v-r/Mind-Mend-App.git
cd Mind-Mend-App

2️⃣ Install Dependencies
npm install

3️⃣ Create .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key


⚠️ Do NOT commit .env.local

4️⃣ Run Locally
npm run dev


Open:
http://localhost:5173

🧪 Future Enhancements

✅ Mood analytics dashboard (graphs & trends)
✅ Voice-based journaling
✅ Dark mode
✅ Chat-style emotional support
✅ App reminders & streak tracking
✅ Socially-anonymous community support (optional)

🤝 Contributing

Currently a solo project.
Contributions will be welcomed soon — feel free to fork and raise PRs for improvements!

📝 License

MIT License

📞 Contact

For collaboration or queries:
Email: 227r1a6222@gmail.com
