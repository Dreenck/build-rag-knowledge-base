import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

export default function NotesApp() {
  const API_BASE = import.meta.env.VITE_API_URL || "";
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      await fetch(`${API_BASE}/api/sync-user`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await fetch(`${API_BASE}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotes(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchNotes();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const saveNote = async () => {
    if (!content.trim()) return;
    const token = await getToken();
    const url = editingId ? `${API_BASE}/api/notes/${editingId}` : `${API_BASE}/api/notes`;
    const method = editingId ? 'PUT' : 'POST';
    
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, content })
    });
    
    setTitle("Untitled");
    setContent("");
    setEditingId(null);
    fetchNotes();
  };

  const deleteNote = async (id: string) => {
    const token = await getToken();
    await fetch(`${API_BASE}/api/notes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchNotes();
  };

  const editNote = (n: any) => {
    setEditingId(n.id);
    setTitle(n.title);
    setContent(n.content);
  };

  if (loading) return <div className="text-neutral-500 animate-pulse">Loading notes...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 space-y-4 max-h-[80vh] overflow-y-auto pr-2">
        <h2 className="text-xl font-semibold text-white mb-4">Your Notes</h2>
        {notes.length === 0 && <p className="text-neutral-500 text-sm">No notes yet. Create one!</p>}
        {notes.map(n => (
          <div key={n.id} className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 hover:border-neutral-500 transition-colors group cursor-pointer" onClick={() => editNote(n)}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-white truncate pr-4">{n.title}</h3>
              <button onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }} className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-300 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
            <p className="text-neutral-400 text-sm line-clamp-3">{n.content}</p>
          </div>
        ))}
      </div>
      
      <div className="md:col-span-2 bg-neutral-800 rounded-xl p-6 border border-neutral-700 flex flex-col h-[80vh]">
        <input 
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="bg-transparent text-2xl font-bold text-white mb-4 outline-none border-b border-transparent focus:border-neutral-600 pb-2 transition-colors"
          placeholder="Note Title"
        />
        <textarea 
          value={content}
          onChange={e => setContent(e.target.value)}
          className="flex-1 bg-transparent text-neutral-300 outline-none resize-none"
          placeholder="Start typing your markdown note here..."
        />
        <div className="mt-4 flex justify-between items-center pt-4 border-t border-neutral-700">
          <span className="text-xs text-neutral-500">Markdown supported</span>
          <div className="space-x-3">
            {editingId && (
              <button onClick={() => { setEditingId(null); setTitle("Untitled"); setContent(""); }} className="text-neutral-400 hover:text-white px-4 py-2 transition-colors">
                Cancel
              </button>
            )}
            <button onClick={saveNote} disabled={!content.trim()} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20">
              {editingId ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
