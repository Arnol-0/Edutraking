import { useState, useEffect } from 'react';

const INITIAL_USERS = [
  { id: '1', name: 'Decano Henderson', email: 'admin@institucion.edu', password: 'admin', role: 'admin' },
  { id: '2', name: 'Supervisor Turno', email: 'supervisor@institucion.edu', password: '123', role: 'supervisor' }
];

export function useAuth() {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('edutracking_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('edutracking_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('edutracking_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('edutracking_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('edutracking_current_user');
    }
  }, [currentUser]);

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const logout = () => setCurrentUser(null);

  const createUser = (newUser) => {
    setUsers([...users, { ...newUser, id: Date.now().toString() }]);
  };

  const deleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  }

  return { users, currentUser, login, logout, createUser, deleteUser };
}
