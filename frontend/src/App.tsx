import { SignedIn, SignedOut, SignIn, UserButton } from "@clerk/clerk-react";
import { useState, useEffect, lazy, Suspense } from "react";

const NotesApp = lazy(() => import("./NotesApp"));
const ChatApp = lazy(() => import("./ChatApp"));

function App() {
  const [activeTab, setActiveTab] = useState<'notes'|'chat'>(
    (localStorage.getItem('activeTab') as 'notes'|'chat') || 'notes'
  );

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">RAG Knowledge Base</h1>
        <div>
          <SignedOut>
            <div className="text-xl font-medium text-neutral-400">Welcome</div>
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
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-10">
            <div className="text-center md:text-left max-w-md">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">Welcome to your second brain</h2>
              <p className="text-neutral-400 text-lg mb-8">Sign in to start creating markdown notes, building your knowledge base, and querying it instantly using AI.</p>
              <div className="hidden md:block opacity-20">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
            </div>
            <div className="w-full max-w-md flex justify-center">
              <SignIn routing="hash" />
            </div>
          </div>
        </SignedOut>
        
        <SignedIn>
          <Suspense fallback={<div className="text-neutral-500 animate-pulse">Loading interface...</div>}>
            {activeTab === 'notes' ? <NotesApp /> : <ChatApp />}
          </Suspense>
        </SignedIn>
      </main>
    </div>
  );
}

export default App;
