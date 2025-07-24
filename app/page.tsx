"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Edit,
  Trash2,
  FolderOpen,
  Loader2,
  AlertCircle,
  Eye,
  Globe,
  Github,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { projectsApi, type Project, type CreateProjectData } from "@/lib/api"
import { ProjectForm } from "@/components/project-form"
import { OfflineIndicator } from "@/components/offline-indicator"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import Link from "next/link"

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

const typeColors = {
  "web-app": "bg-purple-100 text-purple-800",
  "mobile-app": "bg-indigo-100 text-indigo-800",
  "desktop-app": "bg-cyan-100 text-cyan-800",
  api: "bg-orange-100 text-orange-800",
  design: "bg-pink-100 text-pink-800",
  marketing: "bg-emerald-100 text-emerald-800",
  other: "bg-gray-100 text-gray-800",
}

const statusLabels = {
  planning: "Planlama",
  "in-progress": "Devam Ediyor",
  completed: "Tamamlandı",
  "on-hold": "Beklemede",
}

const priorityLabels = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
}

const typeLabels = {
  "web-app": "Web App",
  "mobile-app": "Mobil App",
  "desktop-app": "Desktop App",
  api: "API",
  design: "Tasarım",
  marketing: "Pazarlama",
  other: "Diğer",
}

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Load projects from API on component mount
  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await projectsApi.getAll()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Projeler yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: CreateProjectData) => {
    try {
      setSubmitting(true)
      setError(null)

      if (editingProject) {
        const updatedProject = await projectsApi.update(editingProject.id, data)
        setProjects(projects.map((p) => (p.id === editingProject.id ? updatedProject : p)))
      } else {
        const newProject = await projectsApi.create(data)
        setProjects([newProject, ...projects])
      }

      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Proje kaydedilirken hata oluştu")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setEditingProject(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu projeyi silmek istediğinizden emin misiniz?")) {
      return
    }

    try {
      await projectsApi.delete(id)
      setProjects(projects.filter((p) => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Proje silinirken hata oluştu")
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = filterStatus === "all" || project.status === filterStatus
    const matchesType = filterType === "all" || project.type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR")
  }

  const calculateProgress = (project: Project) => {
    if (project.subprojects.length === 0) return 0
    const completed = project.subprojects.filter((sp) => sp.status === "completed").length
    return (completed / project.subprojects.length) * 100
  }

  // Statistics
  const stats = {
    total: projects.length,
    planning: projects.filter((p) => p.status === "planning").length,
    inProgress: projects.filter((p) => p.status === "in-progress").length,
    completed: projects.filter((p) => p.status === "completed").length,
    onHold: projects.filter((p) => p.status === "on-hold").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Projeler yükleniyor...</p>
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
            <div className="flex items-center gap-3">
              <FolderOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">Proje Yöneticisi</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={loadProjects}
                disabled={loading}
                className="hidden sm:flex bg-transparent"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yenile"}
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Proje
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProject ? "Projeyi Düzenle" : "Yeni Proje Ekle"}</DialogTitle>
                    <DialogDescription>Proje bilgilerini doldurun ve kaydedin.</DialogDescription>
                  </DialogHeader>
                  <ProjectForm project={editingProject} onSubmit={handleSubmit} submitting={submitting} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <OfflineIndicator />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <Button variant="link" className="p-0 h-auto ml-2 text-red-600 underline" onClick={() => setError(null)}>
                Kapat
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-sm text-slate-600">Toplam</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.planning}</div>
              <div className="text-sm text-slate-600">Planlama</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className="text-sm text-slate-600">Devam Ediyor</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-slate-600">Tamamlandı</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.onHold}</div>
              <div className="text-sm text-slate-600">Beklemede</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Projelerde ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="planning">Planlama</SelectItem>
              <SelectItem value="in-progress">Devam Ediyor</SelectItem>
              <SelectItem value="completed">Tamamlandı</SelectItem>
              <SelectItem value="on-hold">Beklemede</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              <SelectItem value="web-app">Web Uygulaması</SelectItem>
              <SelectItem value="mobile-app">Mobil Uygulama</SelectItem>
              <SelectItem value="desktop-app">Masaüstü Uygulaması</SelectItem>
              <SelectItem value="api">API/Backend</SelectItem>
              <SelectItem value="design">Tasarım</SelectItem>
              <SelectItem value="marketing">Pazarlama</SelectItem>
              <SelectItem value="other">Diğer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {projects.length === 0 ? "Henüz proje yok" : "Proje bulunamadı"}
            </h3>
            <p className="text-slate-500 mb-6">
              {projects.length === 0 ? "İlk projenizi ekleyerek başlayın" : "Arama kriterlerinizi değiştirmeyi deneyin"}
            </p>
            {projects.length === 0 && (
              <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                İlk Projeyi Ekle
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200 border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs ${typeColors[project.type]}`}>{typeLabels[project.type]}</Badge>
                        {project.client && (
                          <Badge variant="outline" className="text-xs">
                            {project.client}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg font-semibold text-slate-900 mb-1">{project.name}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs ${statusColors[project.status]}`}>
                          {statusLabels[project.status]}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${priorityColors[project.priority]}`}>
                          {priorityLabels[project.priority]}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Menüyü aç</span>
                          <div className="h-4 w-4 flex flex-col justify-center items-center">
                            <div className="w-1 h-1 bg-slate-400 rounded-full mb-0.5"></div>
                            <div className="w-1 h-1 bg-slate-400 rounded-full mb-0.5"></div>
                            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/project/${project.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Görüntüle
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(project)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(project.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-slate-600 mb-4 line-clamp-2">
                    {project.description || "Açıklama yok"}
                  </CardDescription>

                  {/* Progress Bar */}
                  {project.subprojects.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>İlerleme</span>
                        <span>{Math.round(calculateProgress(project))}%</span>
                      </div>
                      <Progress value={calculateProgress(project)} className="h-2" />
                    </div>
                  )}

                  {/* Links */}
                  {(project.subdomain || project.repository_url || project.live_url) && (
                    <div className="flex gap-1 mb-4">
                      {project.subdomain && (
                        <Button variant="outline" size="sm" asChild className="h-7 px-2 bg-transparent">
                          <a href={`https://${project.subdomain}`} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                      {project.repository_url && (
                        <Button variant="outline" size="sm" asChild className="h-7 px-2 bg-transparent">
                          <a href={project.repository_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                      {project.live_url && (
                        <Button variant="outline" size="sm" asChild className="h-7 px-2 bg-transparent">
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Features */}
                  {project.features.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {project.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {project.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{project.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(project.created_at)}</span>
                      </div>
                      {project.files.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {project.files.length} dosya
                        </Badge>
                      )}
                    </div>
                    {project.due_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Bitiş: {formatDate(project.due_date)}</span>
                      </div>
                    )}
                    {project.budget && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-medium">{project.budget.toLocaleString("tr-TR")} ₺</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <PWAInstallPrompt />
      </main>
    </div>
  )
}
