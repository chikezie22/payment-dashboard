# 💸 Payment Dashboard (PWA Wallet)

A **Progressive Web App (PWA)** that simulates wallet operations such as **Deposit**, **Swap**, and **Send**. The application maintains a transaction history and wallet balances, and the use of live exchange rates ensures accurate **Swap** functionality.

A core feature is its **offline mode**, which allows users to view their past transactions and wallet history even when they aren't connected to the internet.

---

## ⚙️ Tech Stack

This project is built using a modern and efficient set of technologies.

| Tool                | Purpose                                                                  |
| :------------------ | :----------------------------------------------------------------------- |
| **React + Vite**    | Frontend framework and a fast, modern build tool                         |
| **TypeScript**      | Provides type safety for cleaner, structured, and more maintainable code |
| **Zustand**         | Lightweight and minimal global state management                          |
| **shadcn/ui**       | Prebuilt, accessible, and reusable UI components                         |
| **Vitest + RTL**    | Unit and integration testing setup using React Testing Library           |
| **vite-plugin-pwa** | Adds robust PWA features, including service workers for offline support  |

---

## 🧰 Setup Instructions

### 1️⃣ Clone the Project

````bash
git clone <your-repo-url>
cd payment-dashboard
pnpm install
VITE_API_KEY=your_exchange_rate_api_key
pnpm run dev
pnpm run build
pnpm run preview
pnpm run test
pnpm vitest run src/test/integration/wallet-flow.test.tsx
pnpm vitest
That's absolutely right! A README should provide all the necessary steps for a user to get the project up and running.

Here is the complete, ready-to-use Markdown file that includes the missing setup, testing, and design rationale sections.

Markdown

# 💸 Payment Dashboard (PWA Wallet)

A **Progressive Web App (PWA)** that simulates wallet operations such as **Deposit**, **Swap**, and **Send**. The application maintains a transaction history and wallet balances, and the use of live exchange rates ensures accurate **Swap** functionality.

A core feature is its **offline mode**, which allows users to view their past transactions and wallet history even when they aren't connected to the internet.

---

## ⚙️ Tech Stack

This project is built using a modern and efficient set of technologies.

| Tool | Purpose |
| :--- | :--- |
| **React + Vite** | Frontend framework and a fast, modern build tool |
| **TypeScript** | Provides type safety for cleaner, structured, and more maintainable code |
| **Zustand** | Lightweight and minimal global state management |
| **shadcn/ui** | Prebuilt, accessible, and reusable UI components |
| **Vitest + RTL** | Unit and integration testing setup using React Testing Library |
| **vite-plugin-pwa** | Adds robust PWA features, including service workers for offline support |

---

## 🧰 Setup Instructions

### 1️⃣ Clone the Project

```bash
git clone <your-repo-url>
cd payment-dashboard
2️⃣ Install Dependencies
Use pnpm to install the project dependencies.

Bash

pnpm install
3️⃣ Add Environment Variable
Create a file named .env in the root of the project and add your API key for the exchange rate service (e.g., from Fixer, Open Exchange Rates, or ExchangeRate-API).

Bash

VITE_API_KEY=your_exchange_rate_api_key
4️⃣ Start Development Server
Run the development server.

Bash

pnpm run dev
The app will be running at 👉 http://localhost:5173

5️⃣ Build for Production
To create a production build and preview it locally, use the following commands:

Bash

pnpm run build
pnpm run preview
🧪 Testing Instructions
The project uses Vitest for testing the application's logic and user flow.

Run All Tests
Bash

pnpm run test
Run Only Deposit Integration Test
Bash

pnpm vitest run src/test/integration/wallet-flow.test.tsx
Run Tests in Watch Mode
Bash

pnpm vitest
Key Testing Focus Areas:

Deposit: Verifying the wallet balance updates correctly after a successful deposit.

Swap: Confirming the currency conversion uses live exchange rates accurately.

Send: Ensuring the correct amount is deducted and the transaction is recorded with a timestamp.

Offline: Testing that transaction data loads correctly from localStorage when the app is offline.

🧱 Design Choices and Reasoning
🧩 Zustand for Global State
We chose Zustand for state management because it's simple and lightweight compared to alternatives like Redux. All core wallet operations (deposit, swap, send) are consolidated into a single walletSlice for easy testing and seamless synchronization with localStorage for offline access.

🔁 Async Behavior Simulation
To provide a more realistic user experience, setTimeout is used to simulate typical API delays when processing deposits or sending funds. This enables visible "Depositing..." and "Sending..." states in the UI.

📶 PWA Offline Mode
Offline support is implemented using vite-plugin-pwa and a Service Worker. Transaction data is persistently stored in localStorage. This ensures transactions remain accessible when the user is offline, with automatic data re-syncing when connectivity is restored.
💅 UI Design (shadcn/ui)
shadcn/ui was chosen for its clean, modern, and responsive design. It minimizes custom CSS and provides a unified styling system across all UI elements like dialogs, alerts, and buttons.
````
