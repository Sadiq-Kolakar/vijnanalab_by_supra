<p align="center">
  <img src="https://img.shields.io/badge/Vijnana%20Lab-Virtual%20Labs-4285F4?style=for-the-badge&labelColor=1A1A1A" alt="Vijnana Lab" />
</p>

<h1 align="center">✦ Vijnana Lab (विज्ञान)</h1>

<p align="center">
  <em>Simulate the Science. Master the Practical.</em>
</p>

<p align="center">
  A premium online education platform bringing high school practical laboratories directly into the browser. From Vernier Calipers to Chemistry Titrations, Vijnana Lab provides interactive STEM simulations for higher primary and secondary students.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_API-8E75B2?style=flat-square&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/STEM-Education-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
</p>

---

## ✦ What is Vijnana Lab?

**Vijnana** (विज्ञान) in Sanskrit translates to *systematic knowledge* or *science*. 

We built **Vijnana Lab** to democratize practical science education. Many higher primary and secondary schools lack the funding for fully equipped physical laboratories, or students simply don't get enough hands-on time with instruments. 

Vijnana Lab solves this by providing a suite of **interactive virtual simulators**. Students can use a digital Vernier Caliper, perform a Chemistry Titration safely from their laptops, or visualize complex Math and Biology concepts. With the integration of the Google Gemini API, students even get a built-in AI tutor to explain theories and guide them through their experiments.

### The Problem vs. Our Solution

| The Problem | How Vijnana Lab Solves It |
|---------|----------|
| **Limited Lab Access** — Schools have limited equipment, restricting student practice time. | **24/7 Virtual Labs** — Students can access precise simulators from any browser, at any time. |
| **Safety Concerns** — Chemistry and physics experiments can involve dangerous materials. | **Zero-Risk Environment** — Safely simulate titrations, salt analysis, and circuit building. |
| **Abstract Concepts** — Theories in physics and math are often hard to visualize from textbooks. | **Interactive Visuals** — Hands-on STEM simulators and rich educational charts. |

---

## ✦ Key Features

### 🔬 The Experiment Modules
- 📐 **Physics Labs** — High-precision simulators for instruments like the Vernier Caliper, Micrometer Screw Gauge, Pendulums, and more.
- 🧪 **Chemistry Labs** — Interactive virtual environments for complex procedures like Titration and Salt Analysis.
- 🧬 **Expanded STEM Coverage** — Dedicated modules for Biology, Mathematics, and Computer Science experiments.
- 📊 **Educational Charts** — Rich, beautifully designed visual aids and reference charts to support the curriculum.
- 🤖 **AI Study Assistant** — Powered by the Google Gemini API to answer student questions and explain the science behind the simulations.

### 💻 For Developers (Under the Hood)
- 🧱 **Component-Driven** — Highly reusable React UI components mapping to physical lab instruments.
- 🔌 **Dedicated Service Layer** — Clean architecture supporting the Gemini API integration and experiment state management.
- 🛠️ **Fully Type-Safe** — Written in 96%+ TypeScript to handle complex math and physics simulation logic reliably.
- 🚀 **Proxy Server Logic** — A lightweight backend tailored for setting up fast endpoints, secure authentication, and API wrappers.

---

## ✦ Tech Stack

```text
┌─────────────────────────────────────────────┐
│  FRONTEND                                   │
│  React 18 · TypeScript · Vite · CSS         │
│  Physics/Math Simulation Components         │
├─────────────────────────────────────────────┤
│  AI INTEGRATION                             │
│  Google Gemini API (Virtual Lab Assistant)  │
├─────────────────────────────────────────────┤
│  BACKEND / SERVICES                         │
│  Node.js · Proxies · API Service Wrappers   │
├─────────────────────────────────────────────┤
│  TOOLING                                    │
│  npm/pnpm · autopush.py                     │
└─────────────────────────────────────────────┘
```

---

## ✦ Architecture Structure

```text
vijnanalab_by_supra/
├── components/         # Reusable UI blocks and interactive lab instruments
├── pages/              # Main application views (Physics Room, Chemistry Lab)
├── server/             # Backend logic for handling API proxies and helpers
├── services/           # Wrappers to talk with Google Gemini and other external APIs
├── public/             # Static lab graphics, charts, and assets
├── src/                # Core application source code
│   ├── App.tsx         # The root React component
│   └── ...
├── auth.html           # A dedicated authentication entry point for students
├── autopush.py         # Automation script for quick deployment and Git pushes
├── constants.ts        # Global science constants (Gravity, Avogadro's, etc.)
├── types.ts            # Shared TypeScript interfaces for simulation states
└── vite.config.ts      # Configuration for the Vite build engine
```

---

## ✦ Getting Started

### Prerequisites

- **Node.js** (version 18 or higher)
- **Google Gemini API Key** (To power the AI Tutor features — get one [here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository to your local machine
git clone https://github.com/mahi-2-ron/vijnanalab_by_supra.git
cd vijnanalab_by_supra

# Install all the necessary packages
npm install
```

### Environment Setup

Create a file named `.env.local` in the root folder of the project:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```
> **Note:** Never share or commit your `.env.local` to GitHub. The repository is already set up to ignore it.

### Run Development Server

```bash
# Start the local server
npm run dev
```

Open **http://localhost:5173** in your browser to enter the virtual lab! 🎉

---

## ✦ Connecting the AI Tutor

To enable the interactive Gemini tutoring assistant:
1. Navigate to the [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click the **Create new API key** button.
4. Copy the key and paste it into your `.env.local` file.

---

## ✦ Development Roadmap

- [x] Establish core React + Vite physics framework
- [x] Build out Vernier Caliper and Screw Gauge simulators
- [x] Successfully integrate Google Gemini API for student assistance
- [x] Complete Chemistry Titration & Salt Analysis modules
- [ ] Add extensive Biology and Math visual charts
- [ ] Implement classroom management (Teacher Dashboard)
- [ ] Connect a database for tracking student experiment scores

---

## ✦ Contributing

Contributions are completely welcome and highly appreciated! To help improve Vijnana Lab's simulations:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-physics-lab`)
3. Commit your changes (`git commit -m 'Add new physics lab'`)
4. Push to the branch (`git push origin feature/new-physics-lab`)
5. Open a Pull Request on GitHub

---

## ✦ License

This project is open source and licensed under the MIT License. Feel free to use and modify it!

---

<p align="center">
  <strong>Vijnana Lab</strong> — Empowering Students with 💡 in India by <strong>TeamSupra</strong>
  <br>
  Last major update: March 2026
</p>
