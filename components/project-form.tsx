"use client"

import type React from "react"

import { useState } from "react"
import { Plus, X, Globe, Github, ExternalLink, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Project, CreateProjectData } from "@/lib/api"

interface ProjectFormProps {
  project?: Project | null
  onSubmit: (data: CreateProjectData) => Promise<void>
  submitting: boolean
}

const projectTypes = {
  "web-app": "Web Uygulaması",
  "mobile-app": "Mobil Uygulama",
  "desktop-app": "Masaüstü Uygulaması",
  api: "API/Backend",
  design: "Tasarım",
  marketing: "Pazarlama",
  other: "Diğer",
}

const predefinedFeatures = {
  "web-app": [
    "Responsive tasarım",
    "Kullanıcı girişi",
    "Admin paneli",
    "API entegrasyonu",
    "Veritabanı",
    "SEO optimizasyonu",
    "PWA desteği",
    "Çoklu dil",
    "Ödeme sistemi",
    "Bildirim sistemi",
  ],
  "mobile-app": [
    "iOS uyumluluğu",
    "Android uyumluluğu",
    "Push notification",
    "Offline çalışma",
    "Kamera entegrasyonu",
    "GPS/Konum",
    "Sosyal medya paylaşımı",
    "In-app satın alma",
    "Biometric auth",
    "Dark mode",
  ],
  design: [
    "Logo tasarımı",
    "UI/UX tasarımı",
    "Branding",
    "İllüstrasyon",
    "İkon seti",
    "Mockup",
    "Prototype",
    "Style guide",
    "Responsive design",
    "Animation",
  ],
}

export function ProjectForm({ project, onSubmit, submitting }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: project?.name || "",
    description: project?.description || "",
    status: project?.status || ("planning" as Project["status"]),
    priority: project?.priority || ("medium" as Project["priority"]),
    type: project?.type || ("web-app" as Project["type"]),
    due_date: project?.due_date || "",
    tags: project?.tags.join(", ") || "",
    subdomain: project?.subdomain || "",
    features: project?.features || [],
    budget: project?.budget?.toString() || "",
    client: project?.client || "",
    repository_url: project?.repository_url || "",
    live_url: project?.live_url || "",
    notes: project?.notes || "",
  })

  const [newFeature, setNewFeature] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const projectData: CreateProjectData = {
      name: formData.name,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      type: formData.type,
      due_date: formData.due_date || undefined,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
      subdomain: formData.subdomain || undefined,
      features: formData.features,
      budget: formData.budget ? Number.parseFloat(formData.budget) : undefined,
      client: formData.client || undefined,
      repository_url: formData.repository_url || undefined,
      live_url: formData.live_url || undefined,
      notes: formData.notes,
    }

    await onSubmit(projectData)
  }

  const addFeature = (feature: string) => {
    if (feature && !formData.features.includes(feature)) {
      setFormData({ ...formData, features: [...formData.features, feature] })
    }
    setNewFeature("")
  }

  const removeFeature = (feature: string) => {
    setFormData({
      ...formData,
      features: formData.features.filter((f) => f !== feature),
    })
  }

  const addPredefinedFeature = (feature: string) => {
    addFeature(feature)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Temel Bilgiler */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Temel Bilgiler</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Proje Adı *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Proje adını girin"
              required
              disabled={submitting}
            />
          </div>
          <div>
            <Label htmlFor="type">Proje Türü</Label>
            <Select
              value={formData.type}
              onValueChange={(value: Project["type"]) => setFormData({ ...formData, type: value })}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(projectTypes).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Açıklama</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Proje açıklaması"
            rows={3}
            disabled={submitting}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="status">Durum</Label>
            <Select
              value={formData.status}
              onValueChange={(value: Project["status"]) => setFormData({ ...formData, status: value })}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planlama</SelectItem>
                <SelectItem value="in-progress">Devam Ediyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="on-hold">Beklemede</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Öncelik</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: Project["priority"]) => setFormData({ ...formData, priority: value })}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Düşük</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="due_date">Bitiş Tarihi</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              disabled={submitting}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Proje Detayları */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Proje Detayları</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="client">Müşteri/Şirket</Label>
            <Input
              id="client"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              placeholder="Müşteri adı"
              disabled={submitting}
            />
          </div>
          <div>
            <Label htmlFor="budget">Bütçe (₺)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="0"
                className="pl-10"
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="subdomain">Alt Domain</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="subdomain"
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                placeholder="app.siten.com"
                className="pl-10"
                disabled={submitting}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="repository_url">Repository URL</Label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="repository_url"
                value={formData.repository_url}
                onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
                placeholder="https://github.com/..."
                className="pl-10"
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="live_url">Canlı URL</Label>
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="live_url"
              value={formData.live_url}
              onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
              placeholder="https://..."
              className="pl-10"
              disabled={submitting}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Özellikler */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Özellikler</h3>

        {/* Hazır özellikler */}
        {predefinedFeatures[formData.type] && (
          <div>
            <Label className="text-sm text-gray-600">Önerilen Özellikler:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {predefinedFeatures[formData.type].map((feature) => (
                <Button
                  key={feature}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addPredefinedFeature(feature)}
                  disabled={formData.features.includes(feature) || submitting}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {feature}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Özel özellik ekleme */}
        <div className="flex gap-2">
          <Input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Yeni özellik ekle"
            disabled={submitting}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addFeature(newFeature)
              }
            }}
          />
          <Button type="button" onClick={() => addFeature(newFeature)} disabled={!newFeature || submitting}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Seçili özellikler */}
        {formData.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature) => (
              <Badge key={feature} variant="secondary" className="text-sm">
                {feature}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFeature(feature)}
                  className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                  disabled={submitting}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Etiketler ve Notlar */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="tags">Etiketler</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Etiketleri virgülle ayırın"
            disabled={submitting}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notlar</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Proje hakkında notlarınız..."
            rows={4}
            disabled={submitting}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
          {submitting ? "Kaydediliyor..." : project ? "Güncelle" : "Kaydet"}
        </Button>
      </div>
    </form>
  )
}
