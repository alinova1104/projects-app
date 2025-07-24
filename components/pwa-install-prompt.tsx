"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Kullanıcı daha önce reddetmişse gösterme
      const hasDeclined = localStorage.getItem("pwa-install-declined")
      if (!hasDeclined) {
        setTimeout(() => setShowPrompt(true), 3000) // 3 saniye sonra göster
      }
    }

    const handleAppInstalled = () => {
      setShowPrompt(false)
      setDeferredPrompt(null)
      localStorage.removeItem("pwa-install-declined")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        setShowPrompt(false)
      }

      setDeferredPrompt(null)
    }
  }

  const handleDecline = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-install-declined", "true")
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg text-blue-900">Uygulamayı Yükle</CardTitle>
              <CardDescription className="text-blue-700">
                Masaüstünüze yükleyerek daha hızlı erişim sağlayın
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDecline}
              className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button onClick={handleInstall} className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Yükle
            </Button>
            <Button
              variant="outline"
              onClick={handleDecline}
              size="sm"
              className="border-blue-200 text-blue-700 hover:bg-blue-100 bg-transparent"
            >
              Şimdi Değil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
