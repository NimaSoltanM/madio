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

### 4. Create Collections Manually in PocketBase

**Important:** You must create collections manually through the PocketBase UI.

📖 **See [`MANUAL_SETUP.md`](./MANUAL_SETUP.md) for detailed step-by-step instructions**

Quick summary:
1. Go to PocketBase Admin: `http://127.0.0.1:8090/_/`
2. Create 5 collections:
   - ✅ **categories**
   - ✅ **products**
   - ✅ **users** (add `name` and `role` fields)
   - ✅ **cart_items**
   - ✅ **orders**

3. For each collection, set up fields and API rules according to `MANUAL_SETUP.md`

### 5. Seed Demo Data

After creating collections manually, seed the data:

```bash
npm run pb:seed
```

This adds 5 categories and sample products.

### 6. Create User Account & Make Admin

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
npm run pb:seed               # Add demo data
npm run pb:set-admin <email>  # Make a user admin
npm run pb:list-users         # List all users
```

## Troubleshooting

### "PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD must be set" error

1. Make sure you created the `.env` file
2. Check that you added the correct credentials
3. Restart the terminal/command prompt

### Products or categories not showing

1. Make sure you created all collections according to `MANUAL_SETUP.md`
2. Check that all fields exist in each collection
3. Run `npm run pb:seed` again
4. Check PocketBase admin panel that data was seeded
5. Refresh the browser (F5)

### Admin panel not showing

1. Make sure you ran: `npm run pb:set-admin your@email.com`
2. Make sure the `role` field exists in the users collection
3. Logout and login again

---

**Note:** This is a demo project for learning purposes. For production use, additional security measures are required.
