import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CodeEditor from '../components/CodeEditor';
import ReviewPanel from '../components/ReviewPanel';
import LoadingSpinner from '../components/LoadingSpinner';

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'html', 'css', 'json', 'sql', 'bash'];

const Workspace = () => {
  const { projectId } = useParams();

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [snippets, setSnippets] = useState([]);
  const [activeSnippet, setActiveSnippet] = useState(null);
  const [code, setCode] = useState('// Write or paste your code here...\n');
  const [language, setLanguage] = useState('javascript');
  const [review, setReview] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingSnippets, setLoadingSnippets] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
      const current = data.find(p => p._id === projectId);
      if (current) setActiveProject(current);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  }, [projectId]);

  // Fetch snippets for active project
  const fetchSnippets = useCallback(async (pid) => {
    setLoadingSnippets(true);
    try {
      const { data } = await api.get(`/snippets/${pid}`);
      setSnippets(data);
    } catch (err) {
      console.error('Failed to fetch snippets:', err);
    } finally {
      setLoadingSnippets(false);
    }
  }, []);

  // Fetch reviews for a snippet
  const fetchReviews = async (snippetId) => {
    try {
      const { data } = await api.get(`/review/${snippetId}`);
      setReviewHistory(data);
      if (data.length > 0) setReview(data[0]);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (activeProject) fetchSnippets(activeProject._id);
  }, [activeProject, fetchSnippets]);

  // Handlers
  const handleSelectProject = (project) => {
    setActiveProject(project);
    setActiveSnippet(null);
    setCode('// Write or paste your code here...\n');
    setReview(null);
    setReviewHistory([]);
  };

  const handleSelectSnippet = (snippet) => {
    setActiveSnippet(snippet);
    setCode(snippet.code);
    setLanguage(snippet.language || 'javascript');
    setReview(null);
    fetchReviews(snippet._id);
  };

  const handleCreateProject = async (title) => {
    try {
      const { data } = await api.post('/projects', { title });
      setProjects(prev => [data, ...prev]);
      setActiveProject(data);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleEditProject = async (id, title) => {
    try {
      const { data } = await api.put(`/projects/${id}`, { title });
      setProjects(prev => prev.map(p => p._id === id ? data : p));
      if (activeProject?._id === id) setActiveProject(data);
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Delete project and all snippets?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
      if (activeProject?._id === id) {
        setActiveProject(null);
        setSnippets([]);
        setActiveSnippet(null);
        setCode('// Write or paste your code here...\n');
        setReview(null);
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleCreateSnippet = async () => {
    if (!activeProject) return;
    try {
      const { data } = await api.post('/snippets', {
        projectId: activeProject._id,
        code: code || '// New snippet\n',
        language
      });
      setSnippets(prev => [data, ...prev]);
      setActiveSnippet(data);
      setCode(data.code);
    } catch (err) {
      console.error('Failed to create snippet:', err);
    }
  };

  const handleDeleteSnippet = async (id) => {
    try {
      await api.delete(`/snippets/${id}`);
      setSnippets(prev => prev.filter(s => s._id !== id));
      if (activeSnippet?._id === id) {
        setActiveSnippet(null);
        setCode('// Write or paste your code here...\n');
        setReview(null);
        setReviewHistory([]);
      }
    } catch (err) {
      console.error('Failed to delete snippet:', err);
    }
  };

  const handleSaveSnippet = async () => {
    if (!activeSnippet) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/snippets/${activeSnippet._id}`, { code, language });
      setActiveSnippet(data);
      setSnippets(prev => prev.map(s => s._id === data._id ? data : s));
    } catch (err) {
      console.error('Failed to save snippet:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!activeSnippet) return;
    // Save first
    await handleSaveSnippet();
    setAnalyzing(true);
    setReview(null);
    try {
      const { data } = await api.post(`/review/${activeSnippet._id}`);
      setReview(data);
      setReviewHistory(prev => [data, ...prev]);
    } catch (err) {
      console.error('Failed to analyze code:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loadingProjects) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
          <LoadingSpinner text="Loading workspace..." />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-dark-900">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          projects={projects}
          snippets={snippets}
          activeProject={activeProject}
          activeSnippet={activeSnippet}
          onSelectProject={handleSelectProject}
          onSelectSnippet={handleSelectSnippet}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onEditProject={handleEditProject}
          onCreateSnippet={handleCreateSnippet}
          onDeleteSnippet={handleDeleteSnippet}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="h-12 bg-dark-800/60 backdrop-blur-sm border-b border-dark-400/15 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-medium bg-dark-700/60 border border-dark-400/20 rounded-lg text-gray-300 outline-none
                                 focus:border-accent/40 focus:ring-1 focus:ring-accent/10 cursor-pointer
                                 hover:border-dark-400/40 transition-all">
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              {activeProject && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-500 font-medium">{activeProject.title}</span>
                  {activeSnippet && (
                    <>
                      <span className="text-gray-600">/</span>
                      <span className="text-accent-light/60 font-mono">snippet</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeSnippet && (
                <button onClick={handleSaveSnippet} disabled={saving}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              )}
              <button onClick={handleAnalyze} disabled={!activeSnippet || analyzing}
                      className="btn-primary text-xs py-1.5 px-4 flex items-center gap-2">
                {analyzing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3" />
                    </svg>
                    Analyze Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor + Review Panel */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code Editor */}
            <div className="flex-1 min-w-0">
              <CodeEditor code={code} language={language} onChange={(val) => setCode(val || '')} />
            </div>

            {/* Review Panel */}
            <div className="w-[340px] border-l border-dark-400/15 bg-gradient-to-b from-dark-800/40 to-dark-800/20 flex flex-col shrink-0">
              <div className="px-4 py-3 border-b border-dark-400/15 flex items-center justify-between bg-dark-800/30">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                  Analysis Results
                </h3>
                {reviewHistory.length > 1 && (
                  <select onChange={(e) => setReview(reviewHistory[e.target.value])}
                          className="text-[10px] bg-dark-700/60 border border-dark-400/20 rounded-lg px-2 py-1 text-gray-400 outline-none
                                     focus:border-accent/40 cursor-pointer">
                    {reviewHistory.map((r, i) => (
                      <option key={r._id} value={i}>
                        {new Date(r.createdAt).toLocaleString()}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <ReviewPanel review={review} loading={analyzing} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
