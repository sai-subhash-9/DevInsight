import { useState } from 'react';

const Sidebar = ({
  projects, snippets, activeProject, activeSnippet,
  onSelectProject, onSelectSnippet, onCreateProject, onDeleteProject,
  onEditProject, onCreateSnippet, onDeleteSnippet
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    onCreateProject(newTitle.trim());
    setNewTitle('');
    setShowNewProject(false);
  };

  const handleEdit = (id) => {
    if (!editTitle.trim()) return;
    onEditProject(id, editTitle.trim());
    setEditingId(null);
  };

  return (
    <aside className="w-64 h-full bg-dark-800/60 border-r border-dark-400/20 flex flex-col overflow-hidden">
      {/* Projects Header */}
      <div className="p-3 border-b border-dark-400/20">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projects</h2>
          <button onClick={() => setShowNewProject(!showNewProject)}
                  className="w-6 h-6 flex items-center justify-center rounded-md bg-accent/20 text-accent-light
                             hover:bg-accent/30 transition-colors text-sm">
            +
          </button>
        </div>

        {showNewProject && (
          <div className="flex gap-1.5 animate-slide-up">
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                   placeholder="Project name..." autoFocus
                   className="flex-1 px-2 py-1 text-sm bg-dark-700 border border-dark-400/30 rounded-md text-gray-200
                              placeholder-gray-500 outline-none focus:border-accent/50" />
            <button onClick={handleCreate} className="px-2 py-1 text-xs bg-accent rounded-md text-white hover:bg-accent-dark transition-colors">
              Add
            </button>
          </div>
        )}
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-1">
          {projects.map((p) => (
            <div key={p._id} className={`group px-3 py-2 cursor-pointer border-l-2 transition-all duration-150 ${
              activeProject?._id === p._id
                ? 'bg-accent/10 border-accent text-gray-100'
                : 'border-transparent hover:bg-dark-700/50 text-gray-400 hover:text-gray-200'
            }`}>
              {editingId === p._id ? (
                <div className="flex gap-1">
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleEdit(p._id)}
                         autoFocus className="flex-1 px-1.5 py-0.5 text-sm bg-dark-700 border border-dark-400/30 rounded text-gray-200 outline-none" />
                  <button onClick={() => handleEdit(p._id)} className="text-xs text-accent-light hover:text-accent">✓</button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 hover:text-gray-300">✗</button>
                </div>
              ) : (
                <div className="flex items-center justify-between" onClick={() => onSelectProject(p)}>
                  <span className="text-sm font-medium truncate">{p.title}</span>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditingId(p._id); setEditTitle(p.title); }}
                            className="text-xs text-gray-500 hover:text-accent-light">✎</button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteProject(p._id); }}
                            className="text-xs text-gray-500 hover:text-red-400">✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {projects.length === 0 && (
            <p className="px-3 py-4 text-xs text-gray-500 text-center">No projects yet. Create one!</p>
          )}
        </div>
      </div>

      {/* Snippets Section */}
      {activeProject && (
        <div className="border-t border-dark-400/20 flex flex-col max-h-[40%]">
          <div className="p-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Snippets</h2>
            <button onClick={onCreateSnippet}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-green-500/20 text-green-400
                               hover:bg-green-500/30 transition-colors text-sm">
              +
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pb-2">
            {snippets.map((s) => (
              <div key={s._id} onClick={() => onSelectSnippet(s)}
                   className={`group px-3 py-1.5 cursor-pointer flex items-center justify-between transition-all duration-150 ${
                     activeSnippet?._id === s._id
                       ? 'bg-green-500/10 text-gray-200'
                       : 'text-gray-400 hover:bg-dark-700/50 hover:text-gray-300'
                   }`}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-dark-600 text-gray-400 font-mono shrink-0">{s.language}</span>
                  <span className="text-xs truncate">{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDeleteSnippet(s._id); }}
                        className="hidden group-hover:block text-xs text-gray-500 hover:text-red-400 shrink-0">✕</button>
              </div>
            ))}
            {snippets.length === 0 && (
              <p className="px-3 py-3 text-xs text-gray-500 text-center">No snippets yet</p>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
