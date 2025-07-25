import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Proje Yöneticisi - Modern Proje Yönetimi",
    short_name: "Proje Yöneticisi",
    description: "Modern ve şık proje yönetimi uygulaması. Projelerinizi kolayca organize edin, takip edin ve yönetin.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    orientation: "portrait-primary",
    scope: "/",
    lang: "tr",
    categories: ["productivity", "business", "utilities"],
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any",
      },
    ],
    shortcuts: [
      {
        name: "Yeni Proje Ekle",
        short_name: "Yeni Proje",
        description: "Hızlıca yeni bir proje oluşturun",
        url: "/?action=new-project",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
      {
        name: "Aktif Projeler",
        short_name: "Aktif",
        description: "Devam eden projeleri görüntüleyin",
        url: "/?filter=in-progress",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
    ],
    screenshots: [
      {
        src: "/screenshots/desktop-1.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Ana sayfa görünümü",
      },
      {
        src: "/screenshots/mobile-1.png",
        sizes: "375x667",
        type: "image/png",
        form_factor: "narrow",
        label: "Mobil görünüm",
      },
    ],
  }
}
