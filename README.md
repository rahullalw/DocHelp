# Medical Report Analyzer MVP

This is a full-stack, production-ready MVP built with a React frontend and a Node.js/Express backend. It's structured as a monorepo using pnpm workspaces.

## 🚀 How to Run This Project

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/installation)

### 1. Setup Backend Environment

Navigate to the backend package and create an environment file:

```bash
cd packages/backend
cp .env.example .env
```

Open the newly created `.env` file and add your `GEMINI_API_KEY`. This is the only secret the application needs.

```
# .env in packages/backend
PORT=3001
GEMINI_API_KEY=[https://your-gemini-api-endpoint.com/api/analyze](https://your-gemini-api-endpoint.com/api/analyze)
```

### 2. Install Dependencies

From the **root directory** of the project, run the pnpm install command. This will install dependencies for both the frontend and backend packages.

```bash
pnpm install
```

### 3. Run the Application

Once again, from the **root directory**, run the development script:

```bash
pnpm dev
```

This command uses `concurrently` to start both the backend server and the frontend development server at the same time.

- The **backend** will be running on `http://localhost:3001`.
- The **frontend** will be running on `http://localhost:5173`.

Open your browser and navigate to `http://localhost:5173` to use the application.
