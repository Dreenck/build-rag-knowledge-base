import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => {
  return {
    SignedIn: ({ children }: any) => <>{children}</>,
    SignedOut: ({ children }: any) => <>{children}</>,
    SignInButton: ({ children }: any) => <>{children}</>,
    UserButton: () => <div>User</div>,
    useAuth: () => ({
      getToken: vi.fn(() => Promise.resolve('mock-token')),
    }),
  };
});

describe('App Component', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn((url) => {
      if (url === '/api/notes' || url === '/api/chat/history') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      }
      if (url === '/api/sync-user') {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as any;
  });

  it('renders welcome message (simulating both states due to mock simplicity)', () => {
    render(<App />);
    expect(screen.getByText('RAG Knowledge Base')).toBeInTheDocument();
    expect(screen.getByText('Welcome to your second brain')).toBeInTheDocument();
  });

  it('renders notes app by default', async () => {
    render(<App />);
    expect(await screen.findByText('Your Notes')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Note Title')).toBeInTheDocument();
  });

  it('can switch to chat app', async () => {
    render(<App />);
    const chatTabBtn = screen.getByText('AI Chat');
    fireEvent.click(chatTabBtn);
    
    expect(await screen.findByText('Chat with your Knowledge Base')).toBeInTheDocument();
    expect(screen.getByText('No messages yet. Start a conversation!')).toBeInTheDocument();
  });
});
