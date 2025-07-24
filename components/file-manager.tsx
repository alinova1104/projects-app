"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, File, Trash2, Download, Eye, FileText, ImageIcon, Archive, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { projectsApi, type ProjectFile } from "@/lib/api"

interface FileManagerProps {
  projectId: string
  files: ProjectFile[]
  onFilesChange: (files: ProjectFile[]) => void
}

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
  if (type.startsWith("video/")) return <Video className="h-4 w-4" />
  if (type.includes("pdf")) return <FileText className="h-4 w-4" />
  if (type.includes("zip") || type.includes("rar")) return <Archive className="h-4 w-4" />
  return <File className="h-4 w-4" />
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function FileManager({ projectId, files, onFilesChange }: FileManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)
    setError(null)

    try {
      const uploadPromises = Array.from(selectedFiles).map((file) => projectsApi.uploadFile(projectId, file))

      const uploadedFiles = await Promise.all(uploadPromises)
      onFilesChange([...files, ...uploadedFiles])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dosya yüklenirken hata oluştu")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleFileDelete = async (fileId: string) => {
    if (!confirm("Bu dosyayı silmek istediğinizden emin misiniz?")) return

    try {
      await projectsApi.deleteFile(fileId)
      onFilesChange(files.filter((f) => f.id !== fileId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dosya silinirken hata oluştu")
    }
  }

  const handleFileView = (file: ProjectFile) => {
    window.open(file.url, "_blank")
  }

  const handleFileDownload = (file: ProjectFile) => {
    const link = document.createElement("a")
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Dosyalar ({files.length})</CardTitle>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Yükleniyor..." : "Dosya Yükle"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
              <Button variant="link" className="p-0 h-auto ml-2 text-red-600 underline" onClick={() => setError(null)}>
                Kapat
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Henüz dosya yüklenmemiş</p>
            <p className="text-sm">Dosya yüklemek için yukarıdaki butonu kullanın</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3 flex-1">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <Badge variant="outline" className="text-xs">
                        {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                      </Badge>
                      <span>{new Date(file.uploaded_at).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleFileView(file)} className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleFileDownload(file)} className="h-8 w-8 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileDelete(file.id)}
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
