// Types
export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  createdAt: number;
}

export interface Picture {
  id: string;
  name: string;
  base64Data: string;
  uploadedAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Storing plain text as requested for this simple app
  createdAt: number;
}

// Auth
export const getUsers = (): User[] => {
  const data = localStorage.getItem('codenest_users');
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: Omit<User, 'id' | 'createdAt'>) => {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  localStorage.setItem('codenest_users', JSON.stringify([...users, newUser]));
};

export const isLoggedIn = (): boolean => {
  return localStorage.getItem('codenest_auth') === 'true';
};

export const setLoggedIn = (status: boolean) => {
  if (status) {
    localStorage.setItem('codenest_auth', 'true');
  } else {
    localStorage.removeItem('codenest_auth');
  }
};

// Snippets
export const getSnippets = (): CodeSnippet[] => {
  const data = localStorage.getItem('codenest_snippets');
  return data ? JSON.parse(data) : [];
};

export const saveSnippet = (snippet: Omit<CodeSnippet, 'id' | 'createdAt'>) => {
  const snippets = getSnippets();
  const newSnippet: CodeSnippet = {
    ...snippet,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  localStorage.setItem('codenest_snippets', JSON.stringify([newSnippet, ...snippets]));
};

export const deleteSnippet = (id: string) => {
  const snippets = getSnippets();
  const filtered = snippets.filter(s => s.id !== id);
  localStorage.setItem('codenest_snippets', JSON.stringify(filtered));
};

// Pictures - now handled in Firebase Realtime Database, not localStorage
// These functions are kept for reference but not used
