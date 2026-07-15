import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

function App() {
  const [activeTab, setActiveTab] = useState<'notes'|'chat'>('notes');
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">RAG Knowledge Base</h1>
        <div>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center space-x-6">
              <div className="flex bg-neutral-800 p-1 rounded-lg">
                <button onClick={() => setActiveTab('notes')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'notes' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'}`}>Notes</button>
                <button onClick={() => setActiveTab('chat')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'chat' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'}`}>AI Chat</button>
              </div>
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </header>

      <main>
        <SignedOut>
          <div className="text-center py-20">
            <h2 className="text-4xl font-bold mb-4 text-white">Welcome to your second brain</h2>
            <p className="text-neutral-400 text-lg mb-8 max-w-xl mx-auto">Sign in to start creating markdown notes and querying them using AI.</p>
          </div>
        </SignedOut>
        
        <SignedIn>
          {activeTab === 'notes' ? <NotesApp /> : <ChatApp />}
        </SignedIn>
      </main>
    </div>
  )
}

function NotesApp() {
  // ponytail: keeping everything in one file for maximum simplicity.
  const { getToken } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      const token = await getToken();
      await fetch('/api/sync-user', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await fetch('/api/notes', {
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
    fetchNotes();
  }, []);

  const saveNote = async () => {
    if (!content.trim()) return;
    const token = await getToken();
    const url = editingId ? `/api/notes/${editingId}` : '/api/notes';
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
    await fetch(`/api/notes/${id}`, {
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

function ChatApp() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = await getToken();
      const res = await fetch('/api/chat/history', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setMessages(await res.json());
      }
    };
    fetchHistory();
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const token = await getToken();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: userMsg })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[80vh] flex flex-col bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
      <div className="p-4 border-b border-neutral-700 bg-neutral-800/50 backdrop-blur-sm">
        <h2 className="font-semibold text-white">Chat with your Knowledge Base</h2>
        <p className="text-xs text-neutral-400">Ask questions and AI will answer using your notes.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-neutral-500">
            <p>No messages yet. Start a conversation!</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-neutral-700 text-neutral-200'}`}>
              <p className="whitespace-pre-wrap text-sm">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-neutral-700 text-neutral-400 rounded-2xl px-4 py-2 animate-pulse text-sm">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-neutral-800 border-t border-neutral-700">
        <div className="flex space-x-2">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask something about your notes..."
            className="flex-1 bg-neutral-900 border border-neutral-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-neutral-500 transition-colors"
          />
          <button type="submit" disabled={!input.trim() || loading} className="bg-white text-black font-medium px-4 py-2 rounded-lg hover:bg-neutral-200 disabled:opacity-50 transition-colors">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
