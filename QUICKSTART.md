# Quick Start Guide (English)

This is a step-by-step guide to set up the Madio e-commerce demo project.

## Prerequisites

- Node.js (version 18+)
- PocketBase ([Download here](https://pocketbase.io/docs/))

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PocketBase

1. Download PocketBase from the official website
2. Extract the zip file
3. Run PocketBase:
   ```bash
   # Windows
   ./pocketbase.exe serve

   # Mac/Linux
   ./pocketbase serve
   ```
4. Open `http://127.0.0.1:8090/_/` in your browser
5. Create an admin account (save the email and password!)

### 3. Configure Environment Variables

1. Copy the example file:
   ```bash
   # Windows (Command Prompt)
   copy .env.example .env

   # Windows (PowerShell)
   Copy-Item .env.example .env

   # Mac/Linux
   cp .env.example .env
   ```

2. Edit `.env` file and add your PocketBase admin credentials:
   ```env
   PB_ADMIN_EMAIL=your-admin@email.com
   PB_ADMIN_PASSWORD=your-admin-password
   VITE_POCKETBASE_URL=http://127.0.0.1:8090
   ```

### 4. Complete Database Setup (One Command!)

Run **one command** to do everything:

```bash
npm run pb:setup-all
```

This automatically:
- ✅ Creates all collections
- ✅ Sets up user fields
- ✅ Configures API access rules
- ✅ Seeds demo data (5 categories + products)

**OR** if you prefer step-by-step:

```bash
npm run pb:setup       # Create collections
npm run pb:fix-rules   # Fix permissions
npm run pb:seed        # Add demo data
```

### 5. Create User Account & Make Admin

1. Start the app:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000` in your browser

3. Click "Sign Up" and create a user account

4. Make the user an admin:
   ```bash
   npm run pb:set-admin your-user@email.com
   ```
   (Replace with the email you used to sign up)

5. Logout and login again

6. You should now see the "Admin Panel" link!

## Common Commands

```bash
npm run dev                   # Start development server
npm run build                 # Build for production
npm run pb:setup-all          # Complete setup (recommended!)
npm run pb:setup              # Just create collections
npm run pb:seed               # Just add demo data
npm run pb:fix-rules          # Just fix permissions
npm run pb:set-admin <email>  # Make a user admin
npm run pb:list-users         # List all users
```

## Troubleshooting

### "only admins can perform this action" error

1. Make sure PocketBase is running
2. Run `npm run pb:fix-rules`
3. Logout and login again

### "PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD must be set" error

1. Make sure you created the `.env` file
2. Check that you added the correct credentials
3. Restart the terminal/command prompt

### Products or categories not showing

1. Run `npm run pb:setup-all` again (or `npm run pb:seed` + `npm run pb:fix-rules`)
2. Refresh the browser (F5)

### Admin panel not showing

1. Make sure you ran: `npm run pb:set-admin your@email.com`
2. Logout and login again

---

**Note:** This is a demo project for learning purposes. For production use, additional security measures are required.
