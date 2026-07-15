import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

export default function ChatApp() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = await getToken();
      if (!token) return;
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

  const clearChat = async () => {
    try {
      const token = await getToken();
      await fetch('/api/chat/history', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[80vh] flex flex-col bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
      <div className="p-4 border-b border-neutral-700 bg-neutral-800/50 backdrop-blur-sm flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-white">Chat with your Knowledge Base</h2>
          <p className="text-xs text-neutral-400">Ask questions and AI will answer using your notes.</p>
        </div>
        {messages.length > 0 && (
          <button 
            onClick={clearChat}
            className="text-xs px-3 py-1.5 rounded-md bg-neutral-700 hover:bg-red-900/50 hover:text-red-400 transition-colors text-neutral-300"
          >
            Clear Chat
          </button>
        )}
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
