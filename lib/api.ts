const API_BASE_URL = "http://localhost/project-manager/api"

export interface Project {
  id: string
  name: string
  description: string
  status: "planning" | "in-progress" | "completed" | "on-hold"
  priority: "low" | "medium" | "high"
  type: "web-app" | "mobile-app" | "desktop-app" | "api" | "design" | "marketing" | "other"
  created_at: string
  updated_at: string
  due_date?: string
  tags: string[]
  subdomain?: string
  features: string[]
  files: ProjectFile[]
  subprojects: SubProject[]
  progress: number
  budget?: number
  client?: string
  repository_url?: string
  live_url?: string
  notes: string
}

export interface ProjectFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploaded_at: string
}

export interface SubProject {
  id: string
  name: string
  status: "todo" | "in-progress" | "completed"
  due_date?: string
  assignee?: string
}

export interface CreateProjectData {
  name: string
  description: string
  status: Project["status"]
  priority: Project["priority"]
  type: Project["type"]
  due_date?: string
  tags: string[]
  subdomain?: string
  features: string[]
  budget?: number
  client?: string
  repository_url?: string
  live_url?: string
  notes: string
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Network error" }))
    throw new ApiError(response.status, errorData.error || "An error occurred")
  }

  return response.json()
}

export const projectsApi = {
  // Get all projects
  getAll: (): Promise<Project[]> => {
    return apiRequest<Project[]>("/projects.php")
  },

  // Get single project
  getById: (id: string): Promise<Project> => {
    return apiRequest<Project>(`/projects.php?id=${id}`)
  },

  // Create new project
  create: (data: CreateProjectData): Promise<Project> => {
    return apiRequest<Project>("/projects.php", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // Update project
  update: (id: string, data: CreateProjectData): Promise<Project> => {
    return apiRequest<Project>(`/projects.php?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  // Delete project
  delete: (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/projects.php?id=${id}`, {
      method: "DELETE",
    })
  },

  // File operations
  uploadFile: (projectId: string, file: File): Promise<ProjectFile> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("project_id", projectId)

    return apiRequest<ProjectFile>("/upload.php", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
  },

  deleteFile: (fileId: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/files.php?id=${fileId}`, {
      method: "DELETE",
    })
  },

  // Subproject operations
  addSubproject: (projectId: string, subproject: Omit<SubProject, "id">): Promise<SubProject> => {
    return apiRequest<SubProject>("/subprojects.php", {
      method: "POST",
      body: JSON.stringify({ ...subproject, project_id: projectId }),
    })
  },

  updateSubproject: (id: string, data: Partial<SubProject>): Promise<SubProject> => {
    return apiRequest<SubProject>(`/subprojects.php?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  deleteSubproject: (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/subprojects.php?id=${id}`, {
      method: "DELETE",
    })
  },
}
