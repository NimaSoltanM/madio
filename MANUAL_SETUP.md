# راهنمای راه‌اندازی دستی / Manual Setup Guide

این راهنما به شما کمک می‌کند تا Collections را به صورت دستی در PocketBase ایجاد کنید.

---

## مرحله 1: ساخت Admin و اجرای PocketBase

1. PocketBase را دانلود و اجرا کنید:
   ```bash
   ./pocketbase.exe serve
   ```

2. به آدرس `http://127.0.0.1:8090/_/` بروید

3. یک اکانت Admin بسازید و ایمیل و پسورد را یادداشت کنید

---

## مرحله 2: ایجاد Collections

در پنل Admin PocketBase، هر Collection را به ترتیب ایجاد کنید:

---

### 1️⃣ Collection: **categories** (دسته‌بندی‌ها)

**Type:** Base Collection

**Schema (فیلدها):**

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| `name` | Text | ✅ Yes | - |
| `description` | Text | ❌ No | - |
| `icon` | Text | ✅ Yes | - |
| `image` | File | ❌ No | Max: 1 file, Size: 5MB, Types: jpeg, png, webp |

**API Rules:**
```
List rule:     (leave empty - public)
View rule:     (leave empty - public)
Create rule:   @request.auth.id != "" && @request.auth.role = "admin"
Update rule:   @request.auth.id != "" && @request.auth.role = "admin"
Delete rule:   @request.auth.id != "" && @request.auth.role = "admin"
```

---

### 2️⃣ Collection: **products** (محصولات)

**Type:** Base Collection

**Schema (فیلدها):**

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| `name` | Text | ✅ Yes | - |
| `description` | Text | ✅ Yes | - |
| `price` | Number | ✅ Yes | - |
| `stock` | Number | ✅ Yes | - |
| `featured` | Bool | ❌ No | - |
| `image` | File | ❌ No | Max: 1 file, Size: 5MB, Types: jpeg, png, webp |
| `category` | Relation | ✅ Yes | Collection: categories, Single, Display: name |

**API Rules:**
```
List rule:     (leave empty - public)
View rule:     (leave empty - public)
Create rule:   @request.auth.id != "" && @request.auth.role = "admin"
Update rule:   @request.auth.id != "" && @request.auth.role = "admin"
Delete rule:   @request.auth.id != "" && @request.auth.role = "admin"
```

---

### 3️⃣ Collection: **users** (کاربران)

**Type:** Auth Collection (این collection به صورت پیش‌فرض وجود دارد)

**اضافه کردن فیلدهای جدید:**

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| `name` | Text | ❌ No | - |
| `role` | Select | ✅ Yes | Values: user, admin (Single select) |

**API Rules:**
```
List rule:     @request.auth.id != "" && @request.auth.role = "admin"
View rule:     @request.auth.id != "" && (@request.auth.role = "admin" || @request.auth.id = id)
Create rule:   (leave empty - public registration)
Update rule:   @request.auth.id != "" && (@request.auth.role = "admin" || @request.auth.id = id)
Delete rule:   @request.auth.id != "" && @request.auth.role = "admin"
```

**Auth Options:**
- ✅ Email/Password authentication enabled
- ✅ Require email
- ❌ Disable username
- ❌ Disable OAuth2

---

### 4️⃣ Collection: **cart_items** (سبد خرید)

**Type:** Base Collection

**Schema (فیلدها):**

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| `user` | Relation | ✅ Yes | Collection: users, Single, Display: email, Cascade delete |
| `product` | Relation | ✅ Yes | Collection: products, Single, Display: name |
| `quantity` | Number | ✅ Yes | - |

**API Rules:**
```
List rule:     user = @request.auth.id
View rule:     user = @request.auth.id
Create rule:   @request.auth.id != ""
Update rule:   user = @request.auth.id
Delete rule:   user = @request.auth.id
```

---

### 5️⃣ Collection: **orders** (سفارشات)

**Type:** Base Collection

**Schema (فیلدها):**

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| `user` | Relation | ✅ Yes | Collection: users, Single, Display: email |
| `items` | JSON | ✅ Yes | - |
| `total` | Number | ✅ Yes | - |
| `status` | Select | ✅ Yes | Values: pending, processing, shipped, delivered, cancelled (Single) |
| `shippingInfo` | JSON | ✅ Yes | - |
| `paymentMethod` | Select | ✅ Yes | Values: cash, card, online (Single) |

**API Rules:**
```
List rule:     user = @request.auth.id || @request.auth.role = "admin"
View rule:     user = @request.auth.id || @request.auth.role = "admin"
Create rule:   @request.auth.id != ""
Update rule:   @request.auth.role = "admin"
Delete rule:   @request.auth.role = "admin"
```

---

## مرحله 3: راه‌اندازی پروژه

حالا که Collections را ساختید، به ترمینال بروید:

### 1. ساخت فایل .env

```bash
# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# Mac/Linux
cp .env.example .env
```

ویرایش `.env` و وارد کردن اطلاعات:
```env
PB_ADMIN_EMAIL=your-admin@email.com
PB_ADMIN_PASSWORD=your-admin-password
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

### 2. وارد کردن داده‌های نمونه

```bash
npm run pb:seed
```

این دستور 5 دسته‌بندی و چند محصول نمونه اضافه می‌کند.

### 3. اجرای برنامه

```bash
npm run dev
```

به `http://localhost:3000` بروید و یک اکانت کاربری بسازید.

### 4. تبدیل کاربر به Admin

```bash
npm run pb:set-admin your-user@email.com
```

از اکانت خارج شوید و دوباره وارد شوید. حالا باید پنل مدیریت را ببینید!

---

## نکات مهم

### ✅ چک کردن Collections

برای اطمینان از اینکه همه چیز درست است:
1. به PocketBase Admin (`http://127.0.0.1:8090/_/`) بروید
2. هر Collection را باز کنید
3. بررسی کنید که تمام فیلدها وجود دارند
4. API Rules را چک کنید

### ✅ دستورات کمکی

```bash
npm run pb:seed          # وارد کردن داده‌های نمونه
npm run pb:set-admin <email>  # تبدیل کاربر به ادمین
npm run pb:list-users    # نمایش لیست کاربران
```

### ⚠️ حل مشکلات

**اگر محصولات نمایش داده نشد:**
1. چک کنید که Collection "categories" وجود دارد
2. چک کنید که Collection "products" وجود دارد و فیلد category از نوع Relation است
3. دستور `npm run pb:seed` را دوباره اجرا کنید

**اگر پنل ادمین نمایش داده نشد:**
1. مطمئن شوید فیلد `role` در users collection وجود دارد
2. دستور `npm run pb:set-admin` را با ایمیل صحیح اجرا کنید
3. خارج شوید و دوباره وارد شوید

---

## گام‌های راه‌اندازی (خلاصه)

1. ✅ اجرای PocketBase و ساخت Admin
2. ✅ ساخت 5 Collection به صورت دستی (از این راهنما استفاده کنید)
3. ✅ ساخت `.env` با اطلاعات admin
4. ✅ اجرای `npm run pb:seed`
5. ✅ اجرای `npm run dev`
6. ✅ ساخت اکانت کاربری
7. ✅ اجرای `npm run pb:set-admin`
8. ✅ لاگین مجدد و استفاده از پنل ادمین

---

**موفق باشید!** 🎉
