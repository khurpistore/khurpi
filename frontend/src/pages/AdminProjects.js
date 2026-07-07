import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Building2, Plus, LogOut, Leaf, ArrowRight, Loader2, Trash2 } from 'lucide-react';

const COLORS = ['#16a34a', '#2563eb', '#db2777', '#ea580c', '#7c3aed', '#0891b2', '#ca8a04', '#dc2626'];

const AdminProjects = () => {
  const { projects, fetchProjects, setCurrentProject, createProject, deleteProject, loading } = useProject();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0] });

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSelect = (project) => {
    setCurrentProject(project);
    toast.success(`Switched to ${project.name}`);
    navigate('/admin/dashboard');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const project = await createProject(form);
      toast.success(`Project "${form.name}" created`);
      setDialogOpen(false);
      setForm({ name: '', description: '', color: COLORS[0] });
      handleSelect(project);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, project) => {
    e.stopPropagation();
    if (project.is_default) {
      toast.error('The default project cannot be deleted');
      return;
    }
    if (!window.confirm(`Delete "${project.name}" and ALL its data? This cannot be undone.`)) return;
    try {
      await deleteProject(project.id);
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete project');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white" data-testid="admin-projects-page">
      {/* Top bar */}
      <div className="border-b border-white/10 px-6 sm:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-green-400" />
          <span className="text-lg font-bold tracking-tight">Khurpi Admin</span>
        </div>
        <Button
          data-testid="projects-logout-button"
          onClick={handleLogout}
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        <div className="mb-10">
          <p className="text-green-400 text-sm font-medium tracking-wide uppercase mb-2">Super Admin</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Select a project</h1>
          <p className="text-white/50 mt-3 text-base max-w-xl">
            Choose a store to manage, or spin up a brand-new one. Each project keeps its own products,
            orders, categories and settings — fully isolated.
          </p>
        </div>

        {loading && projects.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-green-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <button
                key={project.id}
                data-testid={`project-card-${project.id}`}
                onClick={() => handleSelect(project)}
                className="group relative text-left rounded-2xl p-6 bg-white/[0.04] border border-white/10 hover:border-white/30 hover:bg-white/[0.07] transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${project.color || '#16a34a'}22`, color: project.color || '#16a34a' }}
                >
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{project.name}</h3>
                  {project.is_default && (
                    <span className="text-[10px] uppercase tracking-wide bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Default</span>
                  )}
                </div>
                <p className="text-white/50 text-sm mt-1 min-h-[20px] line-clamp-2">{project.description || 'No description'}</p>
                <div className="flex items-center justify-between mt-6">
                  <span className="text-sm text-green-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ArrowRight className="w-4 h-4" />
                  </span>
                  {!project.is_default && (
                    <span
                      role="button"
                      data-testid={`delete-project-${project.id}`}
                      onClick={(e) => handleDelete(e, project)}
                      className="text-white/30 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </button>
            ))}

            {/* Add project card */}
            <button
              data-testid="add-project-card"
              onClick={() => setDialogOpen(true)}
              className="rounded-2xl p-6 border-2 border-dashed border-white/15 hover:border-green-400/60 hover:bg-green-400/5 transition-all duration-300 flex flex-col items-center justify-center min-h-[190px] text-white/60 hover:text-green-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-medium">Add Project</span>
              <span className="text-xs text-white/40 mt-1">Start a new store from scratch</span>
            </button>
          </div>
        )}
      </div>

      {/* Add project dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create a new project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                data-testid="project-name-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Fresh Greens Mumbai"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="project-desc">Description</Label>
              <Textarea
                id="project-desc"
                data-testid="project-description-input"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description of this store"
                className="mt-1 min-h-[70px]"
              />
            </div>
            <div>
              <Label>Accent Color</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-8 h-8 rounded-full transition-transform ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                    aria-label={`color ${c}`}
                  />
                ))}
              </div>
            </div>
            <Button
              type="submit"
              data-testid="create-project-submit"
              className="w-full rounded-full bg-green-600 hover:bg-green-700"
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create & Open'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjects;
