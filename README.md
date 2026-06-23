# Edgewise - Stock Market Trading Platform

> **Done by Maneesh Chowdari**

Edgewise is a comprehensive, modern stock market platform built for serious traders. It provides a complete environment for backtesting ICT (Inner Circle Trader) strategies, tracking live market signals, analyzing equity curves, and studying trading course notes.

## 🚀 Features

- **Backtest Dashboard:** Analyze 2-year backtest data with detailed equity curves, IOF entries, and CISD confirmations.
- **Paper Trading:** Practice trading with virtual money using real-time prices before risking real capital.
- **Live Signals:** Receive real-time price updates and trade signals for indices (NIFTY, BANKNIFTY), stocks, commodities (XAUUSD), forex, and crypto.
- **Trade Log:** A detailed ledger of every entry the algorithm took, complete with setup reasons and Win/Loss Ratios.
- **Course Notes:** Access the complete Phase 4 trading course (Lectures 1 to 15) directly within the app.
- **AI Analysis Panel:** Get automated insights on your trading behavior and market trends.

## 🛠️ Technology Stack

This project was built using a cutting-edge, modern web development stack:

- **Frontend Framework:** React 19 + Vite
- **Routing:** TanStack Router & TanStack Start (for advanced file-based routing)
- **Styling:** TailwindCSS 4 + Radix UI Primitives
- **Data Fetching:** TanStack React Query
- **Database & Auth:** Supabase
- **Charts:** Lightweight Charts & Recharts
- **Icons:** Lucide React

## 💻 How to Run the Project Locally

Follow these instructions to run the Edgewise platform on your own computer:

### 1. Install Dependencies
Make sure you have [Node.js](https://nodejs.org/) installed on your computer. Open your terminal in the project folder and run:
```bash
npm install
```

### 2. Start the Development Server
Once the dependencies are installed, start the local server by running:
```bash
npm run dev
```

### 3. Open in Browser
The terminal will show you a local address (usually `http://localhost:8080/` or `http://localhost:5173/`). Open that link in your web browser.

---

## 🔐 Important Note on Local Authentication (Dev Mode)

When running the project locally, you might encounter issues logging in because Supabase requires email verification by default, which can be difficult to set up on a local machine.

**To solve this, a "Dev Mode Bypass" has been built into the project:**
When you click **Login / Sign up** and enter an email, the app will **simulate a successful login** and instantly grant you access to the Trading Dashboard. It will remember the email you typed and display it on the dashboard. You can also successfully use the **Logout** button.

*If you deploy this app to production, simply remove the local storage bypass in `src/routes/index.tsx` and `src/hooks/useAuth.tsx` to restore strict Supabase authentication.*

---

## 📁 Project Structure

- `/src/routes/` - Contains all the pages (Landing page, Dashboard, Paper Trading, etc.) managed by TanStack Router.
- `/src/components/` - Reusable UI components (StatsBar, PriceChart, TradeLog, etc.).
- `/src/hooks/` - Custom React hooks, including `useAuth.tsx` for managing user sessions.
- `/src/integrations/supabase/` - Supabase client configuration.

## 🤝 Contributing

This project is maintained by **Maneesh Chowdari**. Feel free to fork the repository, make improvements, and submit pull requests!
