// lib/auth-client.ts

export function saveUser(userData: { 
  id: string; 
  username: string; 
  email: string; 
  role: string;
  fullName?: string; // TAMBAHKAN INI
}) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(userData));
  }
}

export function getUser(): {
  id: string;
  username: string;
  email: string;
  role: string;
  fullName?: string;
} | null {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}