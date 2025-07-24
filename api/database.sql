-- Create database
CREATE DATABASE IF NOT EXISTS project_manager;
USE project_manager;

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('planning', 'in-progress', 'completed', 'on-hold') DEFAULT 'planning',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    due_date DATE NULL,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO projects (name, description, status, priority, due_date, tags) VALUES
('Web Sitesi Yenileme', 'Şirket web sitesinin modern tasarımla yenilenmesi', 'in-progress', 'high', '2024-02-15', '["web", "tasarım", "frontend"]'),
('Mobil Uygulama', 'iOS ve Android için mobil uygulama geliştirme', 'planning', 'medium', '2024-03-01', '["mobil", "react-native", "app"]'),
('Veritabanı Optimizasyonu', 'Mevcut veritabanının performans optimizasyonu', 'completed', 'low', '2024-01-20', '["database", "optimization", "performance"]');
