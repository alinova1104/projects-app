"use client"

import { WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
            <WifiOff className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-xl text-slate-900">İnternet Bağlantısı Yok</CardTitle>
          <CardDescription className="text-slate-600">
            Uygulamayı kullanmak için internet bağlantısına ihtiyacınız var.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.</p>
            <Button onClick={() => window.location.reload()} className="w-full bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
