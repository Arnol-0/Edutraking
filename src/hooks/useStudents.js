import { useState, useEffect } from 'react';

const INITIAL_DIRECTORY = [];

export function useStudents() {
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('edutracking_students_v2');
    return saved ? JSON.parse(saved) : INITIAL_DIRECTORY;
  });

  useEffect(() => {
    localStorage.setItem('edutracking_students_v2', JSON.stringify(students));
  }, [students]);

  const addStudent = (newStudent) => {
    setStudents([...students, { 
      ...newStudent, 
      total: 0, 
      lastDelay: "Ninguno", 
      compliance: 100, 
      level: "A TIEMPO", 
      type: "none", 
      probation: "NINGUNO",
      history: []
    }]);
  };

  const updateStudent = (id, updatedData) => {
    setStudents(students.map(s => s.id === id ? { ...s, ...updatedData } : s));
  };

  return { students, addStudent, updateStudent };
}
