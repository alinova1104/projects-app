"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2, ExternalLink, Github, Globe, DollarSign, Calendar, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { projectsApi, type Project } from "@/lib/api"
import { ProjectForm } from "@/components/project-form"
import { FileManager } from "@/components/file-manager"
import { SubProjectManager } from "@/components/subproject-manager"

const statusColors = {
  planning: "bg-blue-100 text-blue-800 border-blue-200",
  "in-progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  "on-hold": "bg-gray-100 text-gray-800 border-gray-200",
}

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
}

const typeLabels = {
  "web-app": "Web Uygulaması",
  "mobile-app": "Mobil Uygulama",
  "desktop-app": "Masaüstü Uygulaması",
  api: "API/Backend",
  design: "Tasarım",
  marketing: "Pazarlama",
  other: "Diğer",
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadProject(params.id as string)
    }
  }, [params.id])

  const loadProject = async (id: string) => {
    try {
      setLoading(true)
      const data = await projectsApi.getById(id)
      setProject(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Proje yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (data: any) => {
    if (!project) return

    try {
      setSubmitting(true)
      const updatedProject = await projectsApi.update(project.id, data)
      setProject(updatedProject)
      setIsEditDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Proje güncellenirken hata oluştu")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!project || !confirm("Bu projeyi silmek istediğinizden emin misiniz?")) return

    try {
      await projectsApi.delete(project.id)
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Proje silinirken hata oluştu")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Proje yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Proje bulunamadı"}</p>
          <Button onClick={() => router.push("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/")} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
                <p className="text-sm text-slate-600">{typeLabels[project.type]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon - Ana Bilgiler */}
          <div className="lg:col-span-2 space-y-6">
            {/* Proje Bilgileri */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{project.name}</CardTitle>
                    <CardDescription className="mt-2">{project.description || "Açıklama yok"}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${statusColors[project.status]}`}>
                      {project.status === "planning" && "Planlama"}
                      {project.status === "in-progress" && "Devam Ediyor"}
                      {project.status === "completed" && "Tamamlandı"}
                      {project.status === "on-hold" && "Beklemede"}
                    </Badge>
                    <Badge variant="outline" className={`${priorityColors[project.priority]}`}>
                      {project.priority === "low" && "Düşük"}
                      {project.priority === "medium" && "Orta"}
                      {project.priority === "high" && "Yüksek"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Oluşturuldu: {new Date(project.created_at).toLocaleDateString("tr-TR")}</span>
                  </div>
                  {project.due_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Bitiş: {new Date(project.due_date).toLocaleDateString("tr-TR")}</span>
                    </div>
                  )}
                  {project.client && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>Müşteri: {project.client}</span>
                    </div>
                  )}
                  {project.budget && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>Bütçe: {project.budget.toLocaleString("tr-TR")} ₺</span>
                    </div>
                  )}
                </div>

                {/* Linkler */}
                {(project.subdomain || project.repository_url || project.live_url) && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.subdomain && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://${project.subdomain}`} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          {project.subdomain}
                        </a>
                      </Button>
                    )}
                    {project.repository_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.repository_url} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          Repository
                        </a>
                      </Button>
                    )}
                    {project.live_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Canlı Site
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {/* Özellikler */}
                {project.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Özellikler</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Etiketler */}
                {project.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Etiketler</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notlar */}
                {project.notes && (
                  <div>
                    <h3 className="font-semibold mb-3">Notlar</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{project.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alt Projeler */}
            <SubProjectManager
              projectId={project.id}
              subprojects={project.subprojects}
              onSubprojectsChange={(subprojects) => setProject({ ...project, subprojects })}
            />
          </div>

          {/* Sağ Kolon - Dosyalar */}
          <div className="space-y-6">
            <FileManager
              projectId={project.id}
              files={project.files}
              onFilesChange={(files) => setProject({ ...project, files })}
            />
          </div>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Projeyi Düzenle</DialogTitle>
          </DialogHeader>
          <ProjectForm project={project} onSubmit={handleUpdate} submitting={submitting} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
