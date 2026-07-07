import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const ProjectContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const STORAGE_KEY = 'currentProject';

// Attach / detach the X-Project-Id header globally so every admin API call is scoped
const applyProjectHeader = (projectId) => {
  if (projectId) {
    axios.defaults.headers.common['X-Project-Id'] = projectId;
  } else {
    delete axios.defaults.headers.common['X-Project-Id'];
  }
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProjectState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const p = JSON.parse(stored);
        applyProjectHeader(p?.id);
        return p;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/projects`);
      setProjects(res.data || []);
      return res.data || [];
    } catch (e) {
      console.error('Failed to fetch projects', e);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const setCurrentProject = useCallback((project) => {
    setCurrentProjectState(project);
    if (project) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      applyProjectHeader(project.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      applyProjectHeader(null);
    }
  }, []);

  const createProject = useCallback(async (data) => {
    const res = await axios.post(`${API}/admin/projects`, data);
    await fetchProjects();
    return res.data;
  }, [fetchProjects]);

  const updateProject = useCallback(async (id, data) => {
    const res = await axios.put(`${API}/admin/projects/${id}`, data);
    await fetchProjects();
    return res.data;
  }, [fetchProjects]);

  const deleteProject = useCallback(async (id) => {
    await axios.delete(`${API}/admin/projects/${id}`);
    await fetchProjects();
  }, [fetchProjects]);

  const clearProject = useCallback(() => {
    setCurrentProjectState(null);
    localStorage.removeItem(STORAGE_KEY);
    applyProjectHeader(null);
  }, []);

  // Keep header in sync on mount
  useEffect(() => {
    applyProjectHeader(currentProject?.id);
  }, [currentProject]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        loading,
        fetchProjects,
        setCurrentProject,
        createProject,
        updateProject,
        deleteProject,
        clearProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};
