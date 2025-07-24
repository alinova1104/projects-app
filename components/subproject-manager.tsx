"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Check, Clock, User, Calendar, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { projectsApi, type SubProject } from "@/lib/api"

interface SubProjectManagerProps {
  projectId: string
  subprojects: SubProject[]
  onSubprojectsChange: (subprojects: SubProject[]) => void
}

const statusColors = {
  todo: "bg-gray-100 text-gray-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
}

const statusLabels = {
  todo: "Yapılacak",
  "in-progress": "Devam Ediyor",
  completed: "Tamamlandı",
}

const statusIcons = {
  todo: <Clock className="h-3 w-3" />,
  "in-progress": <Clock className="h-3 w-3" />,
  completed: <Check className="h-3 w-3" />,
}

export function SubProjectManager({ projectId, subprojects, onSubprojectsChange }: SubProjectManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    status: "todo" as SubProject["status"],
    due_date: "",
    assignee: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      status: "todo",
      due_date: "",
      assignee: "",
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        const updated = await projectsApi.updateSubproject(editingId, {
          name: formData.name,
          status: formData.status,
          due_date: formData.due_date || undefined,
          assignee: formData.assignee || undefined,
        })
        onSubprojectsChange(subprojects.map((sp) => (sp.id === editingId ? updated : sp)))
      } else {
        const newSubproject = await projectsApi.addSubproject(projectId, {
          name: formData.name,
          status: formData.status,
          due_date: formData.due_date || undefined,
          assignee: formData.assignee || undefined,
        })
        onSubprojectsChange([...subprojects, newSubproject])
      }
      resetForm()
    } catch (error) {
      console.error("Alt proje kaydedilirken hata:", error)
    }
  }

  const handleEdit = (subproject: SubProject) => {
    setFormData({
      name: subproject.name,
      status: subproject.status,
      due_date: subproject.due_date || "",
      assignee: subproject.assignee || "",
    })
    setEditingId(subproject.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu alt projeyi silmek istediğinizden emin misiniz?")) return

    try {
      await projectsApi.deleteSubproject(id)
      onSubprojectsChange(subprojects.filter((sp) => sp.id !== id))
    } catch (error) {
      console.error("Alt proje silinirken hata:", error)
    }
  }

  const handleStatusChange = async (id: string, status: SubProject["status"]) => {
    try {
      const updated = await projectsApi.updateSubproject(id, { status })
      onSubprojectsChange(subprojects.map((sp) => (sp.id === id ? updated : sp)))
    } catch (error) {
      console.error("Durum güncellenirken hata:", error)
    }
  }

  const completedCount = subprojects.filter((sp) => sp.status === "completed").length
  const progressPercentage = subprojects.length > 0 ? (completedCount / subprojects.length) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Alt Projeler ({subprojects.length})</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {completedCount}/{subprojects.length} tamamlandı
              </span>
            </div>
          </div>
          <Button onClick={() => setIsAdding(true)} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Alt Proje Ekle
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded-lg bg-gray-50">
            <div className="space-y-3">
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Alt proje adı"
                required
              />
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={formData.status}
                  onValueChange={(value: SubProject["status"]) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Yapılacak</SelectItem>
                    <SelectItem value="in-progress">Devam Ediyor</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
                <Input
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="Atanan kişi"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  {editingId ? "Güncelle" : "Ekle"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                  İptal
                </Button>
              </div>
            </div>
          </form>
        )}

        {subprojects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Henüz alt proje eklenmemiş</p>
          </div>
        ) : (
          <div className="space-y-2">
            {subprojects.map((subproject) => (
              <div
                key={subproject.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Select
                    value={subproject.status}
                    onValueChange={(value: SubProject["status"]) => handleStatusChange(subproject.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Yapılacak</SelectItem>
                      <SelectItem value="in-progress">Devam Ediyor</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex-1">
                    <p className="font-medium">{subproject.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {subproject.assignee && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {subproject.assignee}
                        </div>
                      )}
                      {subproject.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(subproject.due_date).toLocaleDateString("tr-TR")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(subproject)} className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(subproject.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
