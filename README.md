# 🚀 UAT Pract Backend — Node.js

## 📘 Overview

Project ini merupakan replikasi backend dari sistem **UAT CMLABS**, dikembangkan menggunakan **Node.js**, **Prisma ORM**, dan **Express.js**.
Boilerplate utama disediakan oleh tim CMLABS untuk standarisasi struktur backend.

---

## 📦 Requirements

Pastikan environment kamu sudah memiliki:

* **Node.js** `>= 20.x`
* **npm** `>= 10.x` *(sudah termasuk dalam Node.js)*
* **MySQL**

---

## ⚙️ Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/SyafrizalWdMahendra/uat-pract.git
cd uat-pract
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env` di root project.
Kamu bisa menyalin dari contoh berikut atau dari `.env.sample` jika tersedia:

```bash
cp .env.sample .env
```

Sesuaikan nilai variabel sesuai konfigurasi lokal kamu (contoh: `DATABASE_URL`, `PORT`, dsb).

---

## 🧩 Prisma Setup

1. Pastikan sudah menambahkan konfigurasi schema di `prisma/schema.prisma`
2. Generate Prisma Client:

```bash
npx prisma generate
```

3. (Opsional) Jika ingin menginisialisasi database:

```bash
npx prisma migrate dev
```

---

## 🧠 API Documentation (Swagger)

Project ini sudah dilengkapi dokumentasi API menggunakan **Swagger**.
Setelah server berjalan, buka dokumentasi di:

```
https://app.swaggerhub.com/apis/ptcmlabsindonesiadig/uat-pract2/1.0.0
```

---

## 🧑‍💻 Run Development Server

Jalankan server dengan perintah berikut:

```bash
npm run dev
```

Server akan otomatis reload jika ada perubahan kode.

---

## 🗂 Project Structure (Ringkasan)

```
├── node_modules/
├── prisma/
│   ├── schema.prisma
├── src/
│   ├── modules/
│   ├── prisma/
│   ├── routes/
│   ├── types/
│   └── utils/
│   └── index.ts
├── uploads/
├── .env.sample
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
└── tsconfig.json
```

---

## 🧾 License

Project ini dikembangkan untuk keperluan internal dan pembelajaran di bawah supervisi **CMLABS**.
Tidak untuk distribusi publik tanpa izin resmi.

---

Apakah kamu ingin saya tambahkan juga **section "Contributing Guide" dan "Common Troubleshooting"** biar lebih lengkap seperti README standar tim developer CMLABS?
