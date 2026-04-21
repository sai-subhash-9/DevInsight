import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      await api.post('/projects', { title: title.trim(), description: description.trim() });
      setTitle('');
      setDescription('');
      setShowCreate(false);
      fetchProjects();
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its snippets?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Your Projects</h1>
            <p className="text-sm text-gray-400 mt-1">Manage your code review workspaces</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm">
            + New Project
          </button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <form onSubmit={handleCreate} className="card mb-6 animate-slide-up">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Create New Project</h3>
            <div className="space-y-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                     placeholder="Project title" required className="input-field text-sm" autoFocus />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description (optional)" rows={2}
                        className="input-field text-sm resize-none" />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary text-sm">
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-20">
            <LoadingSpinner text="Loading projects..." />
          </div>
        )}

        {/* Projects Grid */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div key={p._id} className="card group hover:border-accent/30 transition-all duration-200
                                          cursor-pointer hover:shadow-lg hover:shadow-accent-glow/10 animate-fade-in"
                   onClick={() => navigate(`/workspace/${p._id}`)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent/30 to-purple-500/30 rounded-lg
                                  flex items-center justify-center group-hover:from-accent/50 group-hover:to-purple-500/50 transition-all">
                    <span className="text-accent-light font-bold text-sm">{p.title.charAt(0).toUpperCase()}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all text-sm">
                    ✕
                  </button>
                </div>
                <h3 className="font-semibold text-gray-100 mb-1 truncate">{p.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description || 'No description'}</p>
                <div className="text-xs text-gray-600">
                  Updated {new Date(p.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 bg-dark-700/50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No projects yet</h3>
            <p className="text-sm text-gray-500 mb-5">Create your first project to start reviewing code</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
              + Create Your First Project
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
