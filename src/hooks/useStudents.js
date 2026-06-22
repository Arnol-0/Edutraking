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
    // Add default metrics when creating student
    setStudents([...students, { 
      ...newStudent, 
      total: 0, 
      lastDelay: "0 este mes", 
      compliance: 100, 
      level: "A TIEMPO", 
      type: "low", 
      probation: "NINGUNO" 
    }]);
  };

  return { students, addStudent };
}
