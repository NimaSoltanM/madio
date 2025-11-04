# PocketBase Setup Guide

## Prerequisites

1. **PocketBase must be running** at `http://127.0.0.1:8090`
2. **Admin account created** via PocketBase UI

## First Time Setup

### Step 1: Create Admin Account

1. Visit http://127.0.0.1:8090/_/
2. Create your first admin account
3. Use these credentials (or set them as environment variables):
   - Email: `admin@madio.com`
   - Password: `admin123456`

### Step 2: Create Collections

Run the setup script to create all required collections:

```bash
npm run pb:setup
```

This creates:
- `categories` - Product categories
- `products` - Products with relations to categories
- `users` - Auth collection with role field (user/admin)
- `cart_items` - Shopping cart items
- `orders` - Order records

### Step 3: Seed Demo Data

Add sample categories and products:

```bash
npm run pb:seed
```

This adds:
- 5 categories (لوازم آرایشی, پوشاک, لوازم جانبی, عطر و ادکلن, جواهرات)
- 15+ products across all categories

## Environment Variables (Optional)

You can set custom admin credentials:

```bash
# Windows
set PB_ADMIN_EMAIL=your@email.com
set PB_ADMIN_PASSWORD=yourpassword

# Linux/Mac
export PB_ADMIN_EMAIL=your@email.com
export PB_ADMIN_PASSWORD=yourpassword
```

## Verify Setup

Visit http://127.0.0.1:8090/_/ and check:
- All collections are created
- Demo data is populated
- API rules are configured

## Collections Schema

### Categories
- `name` (text, required)
- `description` (text)
- `icon` (text, required) - emoji
- `image` (file)

### Products
- `name` (text, required)
- `description` (text, required)
- `price` (number, required)
- `image` (file)
- `category` (relation to categories, required)
- `stock` (number, required)
- `featured` (bool)

### Cart Items
- `user` (relation to users, required)
- `product` (relation to products, required)
- `quantity` (number, required)

### Orders
- `user` (relation to users, required)
- `items` (JSON, required)
- `total` (number, required)
- `status` (select: pending/processing/shipped/delivered/cancelled, required)

## API Rules Summary

**Public Access:**
- Categories: List, View
- Products: List, View

**Authenticated Users:**
- Cart Items: Full CRUD (own items only)
- Orders: Create, View own orders

**Admin Only:**
- Categories: Create, Update, Delete
- Products: Create, Update, Delete
- Orders: Update, Delete, View all
