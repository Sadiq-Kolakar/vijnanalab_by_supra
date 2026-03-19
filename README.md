# Vijnana Lab

**Vijnana Lab** 
is a modern web application that serves as an interactive experimentation platform / AI-powered workspace.  
It integrates **Google Gemini API** for intelligent features and provides a clean, component-based React frontend with supporting backend/service logic.

---
## ✨ Features
- Clean, modular React + TypeScript frontend
- Page-based routing structure
- Reusable UI components
- Google Gemini AI integration (chat / generation / analysis capabilities)
- Authentication flow
- Dedicated services layer for API clients & external integrations
- Lightweight server-side logic folder (proxy, helpers, or custom endpoints)
---
## 🛠️ Tech Stack
| Layer          | Technology                     |
|----------------|--------------------------------|
| Frontend       | React, TypeScript, Vite        |
| Styling        | CSS (or Tailwind / others*)    |
| Build Tool     | Vite                           |
| AI Integration | Google Gemini API              |
| Authentication | Custom / provider-based        |
| Language       | TypeScript (96%+), HTML,       |
| Package Manager| npm / pnpm                     |
*Note: Check `components/` and `pages/` for actual styling approach.
---
## 🚀 Quick Start (Run Locally)
### Prerequisites
- Node.js ≥ 18
- A Google Gemini API key [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
### Steps
1. **Clone the repository**
   ```bash
   git clone https://github.com/mahi-2-ron/vijnanalab_by_supra.git
   cd vijnanalab_by_supra
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Create `.env.local` in the root and add your key:**
   ```env
   GEMINI_API_KEY=your-gemini-api-key-here
   ```
   > **Important:** Never commit `.env.local` — it's already in `.gitignore`
4. **Start the development server**
   ```bash
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) (or the port Vite shows)
---
## 📁 Project Structure
```text
vijnanalab_by_supra/
├── components/         # Reusable UI components
├── pages/              # Route/page level components
├── server/             # Backend logic, proxies, helpers
├── services/           # API clients, external service wrappers
├── public/             # (if exists) static assets
├── src/                # (if using src/ layout)
│   ├── App.tsx
│   └── ...
├── auth.html           # Authentication entry / helper
├── autopush.py         # Deployment / git automation script
├── constants.ts
├── types.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .env.local          (create yourself – do NOT commit)
└── README.md
```
---
## 🔑 Getting a Gemini API Key
1. Go to → [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Create new API key
4. Copy and paste into `.env.local`
> Rate limits and safety settings apply — refer to official Gemini documentation.
---
## 🤝 Contributing
Contributions are welcome!
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-thing`)
3. Commit changes (`git commit -m 'Add amazing thing'`)
4. Push (`git push origin feature/amazing-thing`)
5. Open a Pull Request
---
## 📜 License
MIT License 
---
## 🙏 Acknowledgments
Everyone who has contributed commits & ideas
---
Made with 💡 in India by TeamSupra
Last major update: March 2026


