# PocketBase Quick Reference

## Collections
- **Base**: Default collection type for any data (products, categories, orders)
- **Auth**: User management with email, password, verified, tokenKey fields
- **View**: Read-only, SQL-based collections for aggregations

## Authentication

```typescript
// Login with password
const authData = await pb.collection('users').authWithPassword(email, password);

// Access auth data
console.log(pb.authStore.isValid);
console.log(pb.authStore.token);
console.log(pb.authStore.record.id);

// Logout
pb.authStore.clear();
```

## CRUD Operations

```typescript
// Create
const record = await pb.collection('products').create({ name: 'Test', price: 100 });

// Get one
const record = await pb.collection('products').getOne('RECORD_ID');

// Get list (paginated)
const records = await pb.collection('products').getList(1, 20, {
  filter: 'status = "active"',
  sort: '-created'
});

// Update
await pb.collection('products').update('RECORD_ID', { name: 'Updated' });

// Delete
await pb.collection('products').delete('RECORD_ID');
```

## Relations

```typescript
// Create with relations
await pb.collection('products').create({
  name: 'Product',
  category: 'CATEGORY_ID', // single relation
  tags: ['TAG_ID1', 'TAG_ID2'] // multiple relation
});

// Expand relations
const records = await pb.collection('products').getList(1, 20, {
  expand: 'category,tags'
});

// Append to multiple relation
await pb.collection('products').update('ID', { 'tags+': ['TAG_ID3'] });

// Remove from multiple relation
await pb.collection('products').update('ID', { 'tags-': ['TAG_ID1'] });
```

## API Rules
Common patterns:
- `@request.auth.id != ""` - Only authenticated users
- `@request.auth.role = "admin"` - Role-based access
- `author = @request.auth.id` - Ownership check
- `""` - Public access
- `null` - Superuser only

## File Upload

```typescript
const formData = new FormData();
formData.append('title', 'Product');
formData.append('image', fileInput.files[0]);

const record = await pb.collection('products').create(formData);

// Get file URL
const url = pb.files.getURL(record, record.image);
```
