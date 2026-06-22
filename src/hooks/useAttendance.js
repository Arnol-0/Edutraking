import { useState, useEffect, useMemo } from 'react';

const INITIAL_STUDENTS = [
  { id: '1', rut: '12.345.678-9', barcode: '123456789', full_name: 'Juan Pérez', representative_email: 'apoderado1@example.com', official_entry_time: '08:00' },
  { id: '2', rut: '23.456.789-0', barcode: '234567890', full_name: 'María García', representative_email: 'apoderado2@example.com', official_entry_time: '08:30' },
  { id: '3', rut: '11.111.111-1', barcode: '111111111', full_name: 'Pedro Soto', representative_email: 'apoderado3@example.com', official_entry_time: '08:00' },
  { id: '4', rut: '14.444.444-4', barcode: '444444444', full_name: 'Ana López', representative_email: 'apoderado4@example.com', official_entry_time: '08:00' },
  { id: '5', rut: '15.555.555-5', barcode: '555555555', full_name: 'Carlos Ruiz', representative_email: 'apoderado5@example.com', official_entry_time: '08:15' },
];

export const useAttendance = () => {
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('attendance_records');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error reading records from localStorage", e);
      return [];
    }
  });

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = Array.isArray(records) ? records.filter(r => r.date === today) : [];
    
    const presentIds = new Set(todayRecords.map(r => r.studentId));
    const absentCount = INITIAL_STUDENTS.length - presentIds.size;

    return {
      totalStudents: INITIAL_STUDENTS.length,
      present: presentIds.size,
      absent: absentCount,
      critico: todayRecords.filter(r => r.severity === 'CRÍTICO').length,
      mediano: todayRecords.filter(r => r.severity === 'MEDIANO').length,
      leve: todayRecords.filter(r => r.severity === 'LEVE').length,
      onTime: todayRecords.filter(r => r.severity === 'A TIEMPO').length
    };
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem('attendance_records', JSON.stringify(records));
    } catch (e) {
      console.error("Error updating localStorage", e);
    }
  }, [records]);

  const findStudent = (identifier) => {
    if (!identifier) return null;
    return INITIAL_STUDENTS.find(s => 
      s.barcode === identifier || 
      s.rut === identifier || 
      s.full_name.toLowerCase().includes(identifier.toLowerCase())
    );
  };

  const registerArrival = (student, manualData = null) => {
    if (!student) return { success: false, message: 'Invalid student' };
    
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    
    const existing = records.find(r => r.studentId === student.id && r.date === date);
    if (existing) return { success: false, message: 'Ya registrado hoy' };

    let arrivalTime, delayMinutes, severity, reason;

    if (manualData) {
      arrivalTime = manualData.arrivalTime;
      reason = manualData.reason;
      severity = manualData.severity;
      
      const [entryH, entryM] = student.official_entry_time.split(':').map(Number);
      const [arrivalH, arrivalM] = arrivalTime.split(':').map(Number);
      delayMinutes = (arrivalH * 60 + arrivalM) - (entryH * 60 + entryM);
    } else {
      arrivalTime = now.toTimeString().split(' ')[0].substring(0, 5);
      const [entryH, entryM] = student.official_entry_time.split(':').map(Number);
      const [arrivalH, arrivalM] = arrivalTime.split(':').map(Number);
      delayMinutes = (arrivalH * 60 + arrivalM) - (entryH * 60 + entryM);
      
      reason = delayMinutes > 0 ? 'Registro Automático' : 'Ingreso Normal';
      if (delayMinutes <= 0) severity = 'A TIEMPO';
      else if (delayMinutes <= 15) severity = 'LEVE';
      else if (delayMinutes <= 30) severity = 'MEDIANO';
      else severity = 'CRÍTICO';
    }

    const newRecord = {
      id: Math.random().toString(36).substring(7),
      studentId: student.id,
      studentName: student.full_name,
      rut: student.rut,
      date,
      arrivalTime,
      delayMinutes: Math.max(0, delayMinutes),
      severity,
      reason,
      notified: severity === 'CRÍTICO' || delayMinutes > 30
    };

    setRecords(prev => [newRecord, ...prev]);
    return { success: true, record: newRecord };
  };

  const getAbsentStudents = () => {
    const today = new Date().toISOString().split('T')[0];
    const presentIds = new Set(records.filter(r => r.date === today).map(r => r.studentId));
    return INITIAL_STUDENTS.filter(s => !presentIds.has(s.id));
  };

  return { 
    records: Array.isArray(records) ? records : [], 
    stats, 
    findStudent, 
    registerArrival, 
    getAbsentStudents,
    initialStudents: INITIAL_STUDENTS 
  };
};
