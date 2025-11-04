# Manual PocketBase Setup (Quick Method)

Since this is a demo project, the fastest way is to create collections manually through the PocketBase UI.

## Step 1: Access PocketBase Admin

Visit: http://127.0.0.1:8090/_/

## Step 2: Create Collections

### Collection 1: users (Auth Collection)

1. Click "New collection" → Select "Auth collection"
2. Name: `users`
3. Add fields:
   - `name` (Plain text, optional)
   - `role` (Select, single, required, values: `user`, `admin`)
4. API Rules → Set all to `"` (empty string = public) for now

### Collection 2: categories

1. Click "New collection" → Select "Base collection"
2. Name: `categories`
3. Add fields:
   - `name` (Plain text, required)
   - `description` (Plain text, optional)
   - `icon` (Plain text, required)
   - `image` (File, optional, max 1 file, images only)
4. API Rules:
   - List: `""` (empty = public)
   - View: `""` (empty = public)
   - Others: leave null (admin only)

### Collection 3: products

1. Click "New collection" → Select "Base collection"
2. Name: `products`
3. Add fields:
   - `name` (Plain text, required)
   - `description` (Plain text, required)
   - `price` (Number, required)
   - `image` (File, optional, max 1 file, images only)
   - `category` (Relation, single, required, → categories collection)
   - `stock` (Number, required)
   - `featured` (Bool, optional)
4. API Rules:
   - List: `""` (public)
   - View: `""` (public)
   - Others: leave null (admin only)

### Collection 4: cart_items

1. Click "New collection" → Select "Base collection"
2. Name: `cart_items`
3. Add fields:
   - `user` (Relation, single, required, → users collection)
   - `product` (Relation, single, required, → products collection)
   - `quantity` (Number, required)
4. API Rules - leave ALL null for now, we'll set them later

### Collection 5: orders

1. Click "New collection" → Select "Base collection"
2. Name: `orders`
3. Add fields:
   - `user` (Relation, single, required, → users collection)
   - `items` (JSON, required)
   - `total` (Number, required)
   - `status` (Select, single, required, values: `pending`, `processing`, `shipped`, `delivered`, `cancelled`)
4. API Rules - leave ALL null for now

## Step 3: Seed Demo Data

Once all collections are created, run:

```bash
npm run pb:seed
```

This will add sample categories and products.

## That's it!

Your PocketBase is now ready. The collections are created and you can start building the frontend.
