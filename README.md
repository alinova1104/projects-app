# Proje Yöneticisi

Modern ve şık bir proje yönetimi uygulaması. Web uygulaması olarak çalışır ve PHP API ile veri alışverişi yapar.

## Özellikler

- ✅ Modern ve responsive tasarım
- ✅ PHP API ile veri yönetimi
- ✅ MySQL veritabanı desteği
- ✅ CRUD operasyonları (Oluştur, Oku, Güncelle, Sil)
- ✅ Proje durumu ve öncelik yönetimi
- ✅ Etiket sistemi
- ✅ Arama ve filtreleme
- ✅ Hata yönetimi ve loading durumları

## Kurulum

### 1. Veritabanı Kurulumu
\`\`\`sql
-- database.sql dosyasını MySQL'de çalıştırın
\`\`\`

### 2. PHP API Kurulumu
\`\`\`bash
# API dosyalarını web sunucunuzun root dizinine kopyalayın
# Örnek: /var/www/html/project-manager/api/
\`\`\`

### 3. API Yapılandırması
`api/config.php` dosyasında veritabanı bilgilerinizi güncelleyin:
\`\`\`php
$host = 'localhost';
$dbname = 'project_manager';
$username = 'your_username';
$password = 'your_password';
\`\`\`

### 4. Web Uygulaması
\`\`\`bash
npm install
npm run dev
\`\`\`

## Masaüstü Uygulaması İçin

Bu web uygulamasını masaüstü uygulamasına dönüştürmek için Electron kullanabilirsiniz:

### Electron Kurulumu
\`\`\`bash
npm install electron electron-builder --save-dev
\`\`\`

### package.json'a ekleyin:
\`\`\`json
{
  "main": "electron/main.js",
  "scripts": {
    "electron": "electron .",
    "electron-dev": "ELECTRON_IS_DEV=1 electron .",
    "build-electron": "electron-builder"
  }
}
\`\`\`

### electron/main.js oluşturun:
\`\`\`javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const isDev = process.env.ELECTRON_IS_DEV === '1';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('out/index.html');
  }
}

app.whenReady().then(createWindow);
\`\`\`

## API Endpoints

- `GET /api/projects.php` - Tüm projeleri getir
- `GET /api/projects.php?id=1` - Tek proje getir
- `POST /api/projects.php` - Yeni proje oluştur
- `PUT /api/projects.php?id=1` - Projeyi güncelle
- `DELETE /api/projects.php?id=1` - Projeyi sil

## Teknolojiler

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** PHP, MySQL
- **UI Kütüphanesi:** shadcn/ui
- **Masaüstü:** Electron (opsiyonel)
