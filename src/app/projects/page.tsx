"use client";

import { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button, EmptyState, Loading } from "@/components/ui";
import { ProjectForm } from "@/components/features/ProjectForm";
import { ProjectCard } from "@/components/features/ProjectCard";
import { fetchAPI } from "@/lib/api";
import { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<(Project & { _count?: { tasks: number; achievements: number } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const { data } = await fetchAPI<typeof projects>("/api/projects");
    if (data) setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    if (editingProject) {
      await fetchAPI(`/api/projects/${editingProject.id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
    } else {
      await fetchAPI("/api/projects", {
        method: "POST",
        body: JSON.stringify(formData),
      });
    }
    setFormOpen(false);
    setEditingProject(null);
    loadProjects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这个项目吗？关联的任务将解除关联。")) return;
    await fetchAPI(`/api/projects/${id}`, { method: "DELETE" });
    loadProjects();
  };

  return (
    <>
      <PageContainer
        title="项目管理"
        subtitle="重点项目跟进，关联任务和工作成果"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingProject(null);
              setFormOpen(true);
            }}
          >
            + 新建项目
          </Button>
        }
      >
        {loading ? (
          <Loading />
        ) : projects.length === 0 ? (
          <EmptyState
            title="还没有项目"
            description="创建第一个项目，开始跟进你的重点工作"
            action={
              <Button variant="primary" onClick={() => setFormOpen(true)}>
                + 新建项目
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => {
                  setEditingProject(p);
                  setFormOpen(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </PageContainer>

      <ProjectForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingProject}
      />
    </>
  );
}
