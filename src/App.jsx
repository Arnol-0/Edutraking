import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, Search, Bell, HelpCircle, Clock, Settings, Users, BarChart3, 
  ChevronDown, Filter, Download, Calendar, AlertTriangle, Mail, MoreVertical, 
  LayoutDashboard, Plus, Radio, FileText, CheckCircle2, UserCheck, Activity, BarChart as BarChartIcon,
  Menu, X, LogOut, QrCode, Scan, Camera
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from 'recharts';
import logoImg from './assets/logo.png';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { useStudents } from './hooks/useStudents';
import { Scanner } from '@yudiel/react-qr-scanner';

// --- MOCK DATA ---

const SecureQR = ({ studentId, onExpire }) => {
  const [qrToken] = useState(`${studentId}-${Date.now()}`);
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [studentId, onExpire]);

  return (
    <div className="flex flex-col items-center bg-white p-8 rounded-3xl border border-blue-100 shadow-xl shadow-blue-900/5 animate-in zoom-in-95 duration-300 w-fit">
      <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-100">
        <QRCodeSVG value={`ENTRY:${qrToken}`} size={220} level="M" />
      </div>
      <div className="mt-6 flex items-center gap-3 w-full min-w-[200px]">
        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#4338ca]"
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / 20) * 100}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
        <span className="text-[12px] font-bold text-slate-500 w-5 text-right">{timeLeft}s</span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3 text-center leading-tight">
        QR Dinámico de Seguridad<br/>Expira en {timeLeft}s
      </p>
    </div>
  );
};


const CHRONOLOGY = [
  { id: 1, title: "Diseño Estructural II", recordedBy: "Prof. Helena Vance", date: "22 OCT 2023", time: "08:42 AM", level: "ALTO RETRASO (27M)", note: "Se informó de una interrupción del transporte público.", type: 'critical', icon: Clock },
  { id: 2, title: "Historia del Urbanismo", recordedBy: "Dr. Marcus Flint", date: "18 OCT 2023", time: "10:08 AM", level: "RETRASO MEDIO (08M)", note: "El estudiante citó el exceso de tiempo en una cita médica.", type: 'medium', icon: Clock },
  { id: 3, title: "Taller de Estudio IV", recordedBy: "Entrada Automatizada", date: "14 OCT 2023", time: "01:04 PM", level: "BAJO RETRASO (04M)", note: "Clima inclemente.", type: 'low', icon: Calendar }
];

const RECENT_ACTIVITY = [
  { time: "08:14 AM", text: "registró un atraso de 15 min. Motivo: Problemas de tráfico.", name: "Jordan Smith", type: 'medium' },
  { time: "07:55 AM", text: "registró un atraso de 45 min. Protocolo: Reflexión Obligatoria.", name: "Sia Patel", type: 'critical' }
];

const REPORT_DATA = [
  { name: 'Lun', atrasos: 41 },
  { name: 'Mar', atrasos: 28 },
  { name: 'Mie', atrasos: 15 },
  { name: 'Jue', atrasos: 12 },
  { name: 'Vie', atrasos: 38 },
];

/**
 * Componente principal (App)
 * Gestiona la interfaz, navegación interactiva y animaciones de página (Framer).
 */
export default function App() {
  const { students, addStudent } = useStudents();
  const studentsRef = useRef(students);
  useEffect(() => { studentsRef.current = students; }, [students]);
  const { currentUser, login, logout, users, createUser, deleteUser } = useAuth();
  
  const [activeView, setActiveView] = useState('welcome');
  const [selectedStudent, setSelectedStudent] = useState(() => students.length > 0 ? students[0] : null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // States for Reception View
  const [receptionSearch, setReceptionSearch] = useState('');
  const [isScanningQR, setIsScanningQR] = useState(false);
  const [foundStudent, setFoundStudent] = useState(null);
  const [keepSession, setKeepSession] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [arrivalTime, setArrivalTime] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });

  const calculateDelay = (timeStr) => {
    if (!timeStr) return { type: 'none', level: 'A TIEMPO', diff: 0 };
    const parts = timeStr.split(':');
    if (parts.length !== 2) return { type: 'none', level: 'A TIEMPO', diff: 0 };
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return { type: 'none', level: 'A TIEMPO', diff: 0 };
    const arrivalMinutes = hours * 60 + minutes;
    const expectedMinutes = 8 * 60; // 8:00 AM
    
    if (arrivalMinutes <= expectedMinutes) {
      return { type: 'none', level: 'A TIEMPO', diff: 0 };
    }
    
    const diff = arrivalMinutes - expectedMinutes;
    if (diff <= 15) return { type: 'low', level: 'LEVE', diff };
    if (diff <= 60) return { type: 'medium', level: 'MEDIO', diff };
    return { type: 'critical', level: 'GRAVE', diff };
  };

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentData, setNewStudentData] = useState({ name: '', id: '', grade: 'Grado 9', department: 'Artes', email: '', password: '' });
  const [showSecureQR, setShowSecureQR] = useState(false);
  
  const [isClockInOpen, setIsClockInOpen] = useState(false);
  const [clockInStudent, setClockInStudent] = useState(null);
  const [clockInTime, setClockInTime] = useState('08:00');

  const handleClockIn = () => {
    const timeParts = clockInTime.split(':');
    const hour = parseInt(timeParts[0]);
    const min = parseInt(timeParts[1]);
    if (hour > 8 || (hour === 8 && min >= 30)) {
        alert(`ALERTA: El estudiante ${clockInStudent.name} llegó después de 30 minutos de tolerancia (${clockInTime}).\n\n¡CORREO ENVIADO automáticamente a los padres!`);
    } else {
        alert(`Entrada registrada a las ${clockInTime} exitosamente.`);
    }
    setIsClockInOpen(false);
  };

  const handleAddStudent = () => {
     addStudent({ ...newStudentData, classOf: '2028' });
     createUser({ 
        name: newStudentData.name, 
        email: newStudentData.email.trim(), 
        password: newStudentData.password.trim(), 
        role: 'student', 
        rut: newStudentData.id 
     });
     setIsAddStudentOpen(false);
     setNewStudentData({ name: '', id: '', grade: 'Grado 9', department: 'Artes', email: '', password: '' });
  };

  const [loginError, setLoginError] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'supervisor', rut: '' });

  const handleLogin = () => {
    setIsStarting(true);
    setTimeout(() => {
      const loggedInUser = login(loginEmail.trim(), loginPassword.trim(), keepSession);
      if (loggedInUser) {
         changeView(loggedInUser.role === 'student' ? 'profile' : 'dashboard');
         setLoginError('');
         setIsStarting(false);
      } else {
         setLoginError('Credenciales incorrectas');
         setIsStarting(false);
      }
    }, 1000);
  };

  const changeView = (view) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  };

const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    changeView('profile');
  };

  if (!currentUser) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden selection:bg-[#4338ca] selection:text-white">
        
        {/* LEFT SIDE - BRANDING */}
        <div className="hidden lg:flex w-[55%] bg-gradient-to-br from-[#1e1b4b] via-[#4338ca] to-[#3b82f6] text-white relative flex-col justify-between overflow-hidden shadow-premium z-10 p-12 lg:p-20">
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 bg-[#8b5cf6]/30 w-[800px] h-[800px] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 animate-float"></div>
              <div className="absolute bottom-0 right-0 bg-[#0ea5e9]/30 w-[800px] h-[800px] rounded-full blur-[120px] translate-x-1/4 translate-y-1/4 animate-float" style={{animationDelay: '2s'}}></div>
           </div>
           
           <div className="relative z-10 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="glass-card p-4 lg:p-5 rounded-3xl shadow-xl border border-white/20 inline-flex items-center justify-center">
                 <img src={logoImg} alt="Edutracking" className="h-16 lg:h-24 w-auto object-contain drop-shadow-xl" />
              </div>
           </div>

           <div className="relative z-10 flex-1 flex flex-col justify-center max-w-xl">
              <h2 className="text-[52px] xl:text-[60px] font-bold text-white leading-[1.05] mb-6 animate-in fade-in slide-in-from-left-8 duration-1000 delay-150 tracking-tight drop-shadow-lg">
                 Transformando la <br/>gestión académica <br/>en tiempo real
              </h2>
              <p className="text-blue-100/90 text-[17px] xl:text-[18px] leading-relaxed animate-in fade-in slide-in-from-left-8 duration-1000 delay-300 font-medium max-w-lg drop-shadow">
                 Nuestra plataforma permite una sincronización total entre la administración, docentes y estudiantes, elevando los estándares de excelencia educativa a través de datos inteligentes.
              </p>
           </div>
           
           <div className="relative z-10 text-[13px] font-medium text-blue-200/80 flex items-center gap-4 animate-in fade-in duration-1000 delay-700">
              <span className="cursor-default">© 2024 Institución Académica Superior</span>
              <span className="w-1 h-1 rounded-full bg-blue-400/50"></span>
              <span className="hover:text-white cursor-pointer transition">Privacidad</span>
              <span className="w-1 h-1 rounded-full bg-blue-400/50"></span>
              <span className="hover:text-white cursor-pointer transition">Términos</span>
           </div>
        </div>

        {/* RIGHT SIDE - LOGIN */}
        <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-8 lg:p-24 relative bg-white/60 backdrop-blur-2xl z-0">
           <div className="w-full max-w-sm animate-in fade-in slide-in-from-right-16 duration-1000 delay-150">
              <div className="mb-10 flex flex-col">
                 <h1 className="text-[34px] font-black tracking-tight text-slate-900 mb-2 text-center lg:text-left">Inicio de Sesión</h1>
                 <p className="text-slate-600 text-[15px] font-medium text-center lg:text-left">
                    Bienvenido de nuevo al ecosistema institucional.
                 </p>
              </div>
              
              <div className="space-y-6">
                 
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[12px] font-black text-slate-700 block ml-1">Correo Institucional</label>
                       <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                             <Mail size={18} />
                          </div>
                          <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="ejemplo@institucion.edu" className="w-full bg-white/80 border border-slate-200/60 shadow-inner outline-none rounded-[14px] pl-12 pr-4 py-3.5 text-slate-800 font-bold transition focus:bg-white focus:border-[#4338ca] focus:ring-4 focus:ring-indigo-500/10" />
                       </div>
                    </div>
   
                    <div className="space-y-3">
                       <label className="text-[12px] font-black text-slate-700 block ml-1">Contraseña</label>
                       <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                          </div>
                          <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Contraseña" className="w-full bg-slate-100/70 border border-slate-200 outline-none rounded-[14px] pl-12 pr-4 py-3.5 text-slate-800 font-black text-2xl tracking-[0.25em] placeholder:text-sm placeholder:tracking-normal placeholder:font-medium transition focus:bg-white focus:border-[#4338ca] focus:ring-4 focus:ring-blue-500/10" />
                       </div>
                    </div>
                    
                    {loginError && <p className="text-red-500 text-sm font-bold text-center">{loginError}</p>}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
                       <label className="flex items-center gap-2 cursor-pointer" onClick={() => setKeepSession(!keepSession)}>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border shadow-sm transition ${keepSession ? 'bg-[#4338ca] text-white border-[#4338ca]' : 'bg-white text-transparent border-slate-300'}`}>
                            <CheckCircle2 size={14} strokeWidth={4} className="scale-75" />
                          </div>
                          <span className="text-[13px] font-bold text-slate-600">Mantener sesión activa</span>
                       </label>
                    </div>
                 </motion.div>

                 <button 
                   disabled={isStarting}
                   onClick={handleLogin} 
                   className="w-full bg-gradient-to-r from-[#4338ca] to-[#4f46e5] text-white shadow-md hover:shadow-[#4338ca]/30 h-[56px] mt-2 rounded-[14px] font-bold text-[14px] shadow-[0_8px_20px_rgba(21,87,215,0.25)] hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(21,87,215,0.35)] active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-80 disabled:pointer-events-none"
                 >
                   {isStarting ? (
                      <div className="flex items-center gap-3">
                         <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                         <span className="opacity-90">Verificando...</span>
                      </div>
                   ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> 
                        <span>INICIAR SESIÓN</span>
                      </>
                   )}
                 </button>
              </div>

              <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col items-center justify-center gap-4">
                 <p className="text-[13px] font-medium text-slate-500">¿Necesitas asistencia técnica?</p>
                 <div className="flex gap-3 w-full">
                    <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-full font-bold text-[12px] transition flex justify-center items-center gap-2">
                       <HelpCircle size={15} /> Centro de Ayuda
                    </button>
                    <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-full font-bold text-[12px] transition flex justify-center items-center gap-2">
                       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg> Seguridad
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-transparent text-slate-800 font-sans overflow-hidden selection:bg-[#4338ca] selection:text-white">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
         <div className="lg:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:static top-0 left-0 h-full w-[280px] glass border-r border-white/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col flex-shrink-0 z-50 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 lg:p-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="cursor-pointer" onClick={() => changeView('dashboard')}>
               <img src={logoImg} alt="Edutracking Logo" className="h-20 lg:h-24 w-auto object-contain drop-shadow-md" />
            </div>
            <div className="cursor-pointer" onClick={() => changeView('dashboard')}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#64748b] mt-1 text-left">{currentUser?.role === 'admin' ? "Dean's Office" : "Control de Acceso"}</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-500 hover:bg-slate-100 p-2 rounded-xl transition" onClick={() => setIsSidebarOpen(false)}>
             <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6 text-left overflow-y-auto custom-scrollbar">
          {currentUser?.role !== 'student' && (
             <>
               <button onClick={() => changeView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-[13px] transition-all ${activeView === 'dashboard' ? 'sidebar-link-active' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}`}>
                 <div className="icon-wrapper"><LayoutDashboard size={18} className={activeView === 'dashboard' ? 'text-[#4f46e5]' : 'text-slate-500'} /></div> Panel de Control
               </button>
               <button onClick={() => changeView('reception')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-[13px] transition-all ${activeView === 'reception' ? 'sidebar-link-active' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}`}>
                 <div className="icon-wrapper"><Clock size={18} className={activeView === 'reception' ? 'text-[#4f46e5]' : 'text-slate-500'} /></div> Registro de Ingreso
               </button>
               <button onClick={() => changeView('directory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-[13px] transition-all ${['profile', 'directory'].includes(activeView) ? 'sidebar-link-active' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}`}>
                 <div className="icon-wrapper"><Users size={18} className={['profile', 'directory'].includes(activeView) ? 'text-[#4f46e5]' : 'text-slate-500'} /></div> Directorio
               </button>
               <button onClick={() => changeView('reports')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-[13px] transition-all ${activeView === 'reports' ? 'sidebar-link-active' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}`}>
                 <div className="icon-wrapper"><BarChart3 size={18} className={activeView === 'reports' ? 'text-[#4f46e5]' : 'text-slate-500'} /></div> Reportes
               </button>
               
               {currentUser?.role === 'admin' && (
                 <button onClick={() => changeView('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-[13px] transition-all ${activeView === 'users' ? 'sidebar-link-active' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}`}>
                   <div className="icon-wrapper"><Users size={18} className={activeView === 'users' ? 'text-[#4f46e5]' : 'text-slate-500'} /></div> Gestión de Usuarios
                 </button>
               )}
               <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-[13px] transition-all text-slate-500 hover:text-slate-800 hover:bg-white/60`}>
                 <div className="icon-wrapper"><Settings size={18} className="text-slate-500" /></div> Configuración
               </button>
             </>
          )}

          {currentUser?.role === 'student' && (
             <>
                <button onClick={() => changeView('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-[13px] transition-all ${activeView === 'profile' ? 'sidebar-link-active' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}`}>
                   <div className="icon-wrapper"><UserCheck size={18} className={activeView === 'profile' ? 'text-[#4f46e5]' : 'text-slate-500'} /></div> Mi Perfil
                </button>
                <button onClick={() => changeView('qr')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-[13px] transition-all ${activeView === 'qr' ? 'sidebar-link-active' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}`}>
                   <div className="icon-wrapper"><QrCode size={18} className={activeView === 'qr' ? 'text-[#4f46e5]' : 'text-slate-500'} /></div> Generar QR
                </button>
                <button onClick={() => changeView('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-[13px] transition-all ${activeView === 'settings' ? 'sidebar-link-active' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}`}>
                   <div className="icon-wrapper"><Settings size={18} className={activeView === 'settings' ? 'text-[#4f46e5]' : 'text-slate-500'} /></div> Configuraciones
                </button>
             </>
          )}

        </nav>

        <div className="p-6 space-y-4">
           {currentUser?.role !== 'student' && (
              <button onClick={() => changeView('reception')} className="w-full bg-gradient-to-r from-[#4338ca] to-[#4f46e5] text-white shadow-md hover:shadow-[#4338ca]/30 py-3.5 rounded-xl font-semibold text-[13px] shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2 hover:bg-blue-700 transition">
                 <Plus size={18} /> Nuevo Incidente
              </button>
           )}
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent text-left relative z-0">
        
        {/* TOP HEADER */}
        <header className="h-[84px] bg-white/60 backdrop-blur-md border-b border-white/50 shadow-sm flex items-center justify-between px-6 lg:px-10 flex-shrink-0 relative z-20">
           <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl transition">
                 <Menu size={24} />
              </button>
              
              {activeView === 'profile' ? (
                 <div className="flex items-center gap-2 lg:gap-4 truncate">
                    {currentUser?.role !== 'student' && (
                       <button onClick={() => changeView('directory')} className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition hidden sm:block"><ArrowLeft size={20} /></button>
                    )}
                    <h2 className="text-[16px] xl:text-[19px] font-bold gradient-text truncate">Perfil: {selectedStudent.name.split(' ')[0]}</h2>
                 </div>
              ) : activeView === 'directory' ? (
                 <div className="flex items-center gap-4 truncate">
                    <h2 className="text-[16px] xl:text-[19px] font-bold gradient-text truncate">Directorio</h2>
                 </div>
              ) : activeView === 'reception' ? (
                 <div className="flex items-center gap-4 truncate">
                    <h2 className="text-[16px] xl:text-[19px] font-bold text-[#1e293b] truncate">Registro de Ingreso</h2>
                 </div>
              ) : activeView === 'reports' ? (
                 <div className="flex items-center gap-4 truncate">
                    <h2 className="text-[16px] xl:text-[19px] font-bold gradient-text truncate">Analíticas</h2>
                 </div>
              ) : activeView === 'users' ? (
                  <div className="flex items-center gap-4 truncate">
                     <h2 className="text-[16px] xl:text-[19px] font-bold gradient-text truncate">Gestión de Usuarios</h2>
                  </div>
               ) : (
                  <div className="flex items-center gap-4 truncate">
                     <h2 className="text-[16px] xl:text-[19px] font-bold gradient-text truncate">Panel de Control</h2>
                  </div>
               )}
           </div>

           <div className="flex items-center gap-4 lg:gap-6 ml-auto shrink-0 pl-4">
              <div className="flex items-center gap-4">
                 <button className="text-slate-400 hover:text-slate-600 relative p-2">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                 </button>
              </div>
              
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
              
              <div className="relative">
                 <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full transition cursor-pointer"
                 >
                    <div className="text-right hidden sm:block mt-1">
                       <p className="text-[13px] font-bold gradient-text leading-tight">{currentUser?.name}</p>
                       <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {currentUser?.role === 'admin' ? 'Administrador' : 'Supervisor'}
                       </p>
                    </div>
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-sm relative">
                       <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${(currentUser?.name || '').replace(/ /g, '')}&backgroundColor=e2e8f0`} alt="avatar" className="w-full h-full object-cover scale-110" />
                       <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                    </div>
                    <ChevronDown size={16} className="text-slate-400 ml-1 hidden sm:block" />
                 </button>

                 <AnimatePresence>
                    {isProfileMenuOpen && (
                       <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-[110%] w-56 bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-xl py-2 z-50 flex flex-col"
                       >
                         <div className="px-4 py-2 border-b border-slate-50 mb-1">
                            <p className="text-[13px] font-bold text-slate-800 truncate">{currentUser?.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                         </div>
                         <button onClick={() => { setIsProfileMenuOpen(false); logout(); }} className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition">
                            <LogOut size={16} /> Cerrar Sesión
                         </button>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </header>

        {/* SCROLLABLE VIEW */}
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar relative z-10 p-5 lg:p-10 pb-20">
           <div className="max-w-[1100px] mx-auto">
              
              <AnimatePresence mode="wait">

              {activeView === "users" && currentUser?.role === 'admin' ? (
                <motion.div key="users" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="space-y-6 lg:space-y-8">
                   <div>
                      <h1 className="text-[28px] lg:text-[32px] font-bold gradient-text tracking-tight mb-2">Gestión de Accesos</h1>
                      <p className="text-slate-500 text-[13px] lg:text-[14px] font-medium">Cree y administre cuentas para supervisores de guardia.</p>
                   </div>
                   
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="col-span-1 glass-card rounded-3xl transition-all duration-300 hover:shadow-premium p-6 lg:p-8">
                         <h2 className="text-[18px] font-bold text-slate-900 mb-6">Nuevo Usuario</h2>
                         <div className="space-y-4">
                            <div>
                               <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Nombre</label>
                               <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none focus:border-[#4338ca]" />
                            </div>
                            <div>
                               <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Correo</label>
                               <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none focus:border-[#4338ca]" />
                            </div>
                            <div>
                               <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Contraseña</label>
                               <input type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none focus:border-[#4338ca]" />
                            </div>
                            <button onClick={() => { createUser(newUser); setNewUser({name: '', email: '', password: '', role: 'supervisor', rut: ''}); }} className="w-full mt-4 bg-gradient-to-r from-[#4338ca] to-[#4f46e5] text-white shadow-md hover:shadow-[#4338ca]/30 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition">
                               <Plus size={18} /> Crear Cuenta
                            </button>
                         </div>
                      </div>
                      <div className="col-span-2 glass-card rounded-3xl transition-all duration-300 hover:shadow-premium overflow-hidden">
                         <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] border-b border-slate-100">
                               <tr>
                                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-500">Usuario</th>
                                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-500">Rol</th>
                                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-500">Acción</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                               {users.map(u => (
                                  <tr key={u.id} className="hover:bg-slate-50">
                                     <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden shrink-0">
                                           <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${u.name.replace(/ /g, '')}&backgroundColor=e2e8f0`} alt="avatar" className="w-full h-full object-cover scale-110" />
                                        </div>
                                        <div>
                                           <p className="font-bold text-slate-900">{u.name}</p>
                                           <p className="text-xs text-slate-500">{u.email}</p>
                                        </div>
                                     </td>
                                     <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-slate-100 rounded-md text-xs font-bold uppercase text-slate-600">{u.role}</span>
                                     </td>
                                     <td className="px-6 py-4">
                                        {u.id !== currentUser.id && (
                                           <button onClick={() => deleteUser(u.id)} className="text-red-500 font-bold text-xs hover:underline">Eliminar</button>
                                        )}
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </motion.div>
              ) : activeView === "dashboard" ? (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="space-y-6 lg:space-y-8">
                   <div>
                      <h1 className="text-[28px] lg:text-[32px] font-bold gradient-text tracking-tight mb-2">Pulso Institucional</h1>
                      <p className="text-slate-500 text-[13px] lg:text-[14px] font-medium">Hoy es martes, 24 de octubre. 14 nuevos incidentes registrados desde la asamblea matutina.</p>
                   </div>

                   {/* TOP WIDGETS ROW */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-3xl p-6 lg:p-7 border border-slate-100 shadow-sm flex flex-col justify-between">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 gradient-text flex items-center justify-center shrink-0"><Clock size={18} /></div>
                            <span className="text-[10px] font-bold uppercase gradient-text tracking-widest break-words leading-tight">MÉTRICAS EN TIEMPO REAL</span>
                         </div>
                         <p className="text-[14px] font-bold text-slate-600 mb-2">Pulso de Atrasos Activos</p>
                         <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-6xl font-black text-slate-800 tracking-tighter">84</span>
                            <span className="text-[12px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md mb-2 shrink-0">+12% ↑</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shrink-0 mt-auto">
                            <div className="h-full bg-[#4338ca] w-[65%] rounded-full"></div>
                         </div>
                      </div>

                      <div className="bg-slate-100/50 rounded-3xl p-6 lg:p-7 flex flex-col">
                         <div className="mb-5">
                            <h3 className="text-[17px] font-bold gradient-text">Protocolos Rápidos</h3>
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                            <button className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition text-left h-full group">
                               <AlertTriangle className="text-amber-700 group-hover:scale-110 transition-transform" size={24} />
                               <span className="text-[14px] font-bold text-slate-800 leading-tight block mt-auto pt-4">Asignar<br/>Detención</span>
                            </button>
                            <button className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition text-left h-full group">
                               <Mail className="gradient-text group-hover:scale-110 transition-transform" size={24} />
                               <span className="text-[14px] font-bold text-slate-800 leading-tight block mt-auto pt-4">Alerta a<br/>Padres</span>
                            </button>
                         </div>
                      </div>

                      <div className="bg-[#1e3a8a] rounded-3xl p-6 lg:p-7 text-white flex flex-col justify-between relative overflow-hidden shadow-xl shadow-blue-900/20">
                         <div className="absolute -bottom-8 -right-8 opacity-10"><Radio size={160} /></div>
                         <span className="text-[10px] font-bold uppercase tracking-widest text-[#93c5fd]">ESTADO DEL CAMPUS</span>
                         <div className="mt-4">
                            <h3 className="text-[28px] font-bold leading-tight relative z-10 pt-2 pb-6">Flujo Actual:<br/>Moderado</h3>
                         </div>
                         <div className="bg-[#1e40af] rounded-2xl p-3.5 flex items-center gap-3 mt-4 border border-blue-700/50 relative z-10 w-fit">
                            <span className="w-3 h-3 bg-blue-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(147,197,253,0.8)] shrink-0"></span>
                            <span className="text-[11px] sm:text-[12px] font-medium text-blue-100">Monitoreando Puerta Oeste</span>
                         </div>
                      </div>
                   </div>

                   {/* students LIST - PREVIEW */}
                   <div className="glass-card rounded-3xl transition-all duration-300 hover:shadow-premium overflow-hidden">
                      <div className="p-6 lg:p-7 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white gap-4">
                         <div>
                            <h2 className="text-[20px] font-bold text-slate-900">Estudiantes Incidentales Hoy</h2>
                         </div>
                         <button onClick={() => changeView('directory')} className="gradient-text text-sm font-bold hover:underline">Ver Directorio Completo</button>
                      </div>
                      <div className="overflow-x-auto w-full">
                         <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-[#f8fafc] border-b border-slate-100">
                               <tr>
                                  <th className="px-7 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Identidad del Estudiante</th>
                                  <th className="px-7 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Último Nivel de Atraso</th>
                                  <th className="px-7 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Acción</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                               {students.slice(0, 3).map((s, idx) => (
                                 <tr key={idx} className="hover:bg-slate-50/80 transition cursor-pointer" onClick={() => handleSelectStudent(s)}>
                                    <td className="px-7 py-4">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${s.name}&backgroundColor=f1f5f9`} alt="avatar" />
                                          </div>
                                          <div>
                                             <p className="text-[14px] font-bold text-slate-900">{s.name}</p>
                                             <p className="text-[12px] text-slate-500">{s.grade}</p>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-7 py-4 text-center">
                                       <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest whitespace-nowrap ${
                                         s.type === 'critical' ? 'bg-red-50 text-red-600' :
                                         s.type === 'medium' ? 'bg-orange-50 text-[#c2410c]' :
                                         'bg-slate-100 text-slate-600'
                                       }`}>{s.level}</span>
                                    </td>
                                    <td className="px-7 py-4 text-center">
                                       <div className="flex items-center justify-center gap-3">
                                          <button className="gradient-text font-bold text-[12px] hover:underline whitespace-nowrap">Perfil</button>
                                          {currentUser?.role === 'admin' && (
                                             <button onClick={(e) => { e.stopPropagation(); setClockInStudent(s); setIsClockInOpen(true); }} className="text-emerald-600 font-bold text-[12px] hover:underline whitespace-nowrap hidden sm:block">Llegada</button>
                                          )}
                                       </div>
                                    </td>
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </motion.div>
              ) : activeView === "directory" ? (
                <motion.div key="directory" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="space-y-6 lg:space-y-8">
                   <div>
                      <h1 className="text-[28px] lg:text-[32px] font-bold gradient-text tracking-tight mb-2">
                         {currentUser?.role === 'student' ? 'Compañeros y Profesores' : 'Directorio de Estudiantes'}
                      </h1>
                      <p className="text-slate-500 text-[13px] lg:text-[14px] font-medium">
                         {currentUser?.role === 'student' ? 'Directorio de la comunidad educativa y su curso asignado.' : 'Búsqueda y gestión de todo el alumnado registrado en la plataforma.'}
                      </p>
                   </div>
                   
                   <div className="glass-card rounded-3xl transition-all duration-300 hover:shadow-premium overflow-hidden">
                      <div className="p-6 lg:p-7 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white gap-4">
                         <div>
                            <h2 className="text-[20px] font-bold text-slate-900">
                               {currentUser?.role === 'student' ? 'Directorio de Curso' : 'Todos los Estudiantes'}
                            </h2>
                            <p className="text-[13px] lg:text-[14px] text-slate-500 mt-0.5">
                               {currentUser?.role === 'student' ? 'Observe la lista de sus compañeros y profesorado.' : 'Haga clic en un registro para ver el perfil detallado.'}
                            </p>
                         </div>
                         <div className="flex gap-3 w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm">
                               <Filter size={16} /> Filtrar
                            </button>
                            {currentUser?.role === 'admin' && (
                               <button onClick={() => setIsAddStudentOpen(true)} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2.5 bg-[#4338ca] rounded-xl text-[13px] font-bold text-white hover:bg-blue-700 transition shadow-sm">
                                  <Plus size={16} /> Añadir Alumno
                               </button>
                            )}
                         </div>
                      </div>
                      <div className="overflow-x-auto w-full">
                         <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-[#f8fafc] border-b border-slate-100">
                               <tr>
                                  <th className="px-7 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Identidad del Estudiante</th>
                                  <th className="px-7 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">ID Referencia</th>
                                  <th className="px-7 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Total Atrasos</th>
                                  <th className="px-7 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Nivel Riesgo</th>
                                  <th className="px-7 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Acción</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                               {students.map((s, idx) => (
                                 <tr key={idx} className="hover:bg-slate-50/80 transition cursor-pointer group" onClick={() => handleSelectStudent(s)}>
                                    <td className="px-7 py-5">
                                       <div className="flex items-center gap-4">
                                          <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${s.name}&backgroundColor=cbd5e1`} alt="avatar" />
                                          </div>
                                          <div>
                                             <p className="text-[15px] font-bold text-slate-900 group-hover:gradient-text transition">{s.name}</p>
                                             <p className="text-[13px] text-slate-500 mt-0.5">{s.grade}</p>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-7 py-5 text-[14px] font-medium text-slate-500 break-words">{s.id}</td>
                                    <td className="px-7 py-5 text-center">
                                       <span className={`text-[20px] font-bold ${s.total >= 10 ? 'text-red-500' : s.total > 0 ? 'gradient-text' : 'text-slate-400'}`}>{s.total}</span>
                                    </td>
                                    <td className="px-7 py-5 text-center">
                                       <span className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold tracking-widest whitespace-nowrap ${
                                         s.type === 'critical' ? 'bg-red-50 text-red-600' :
                                         s.type === 'medium' ? 'bg-orange-50 text-[#c2410c]' :
                                         'bg-slate-100 text-slate-600'
                                       }`}>{s.level}</span>
                                    </td>
                                    <td className="px-7 py-5 text-center">
                                       <button className="gradient-text font-bold text-[12px] px-4 py-2 rounded-lg hover:bg-blue-50 transition border border-transparent hover:border-blue-100 whitespace-nowrap">Ver Perfil</button>
                                    </td>
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </motion.div>
              ) : activeView === "profile" ? (() => {
                 const profileTarget = currentUser?.role === 'student' ? { ...currentUser, grade: '1° Medio', department: 'General', id: currentUser.rut || '000', classOf: '2028', probation: 'NINGUNO', total: 0, lastDelay: 'N/A', compliance: 100, type: 'low' } : selectedStudent;
                 return (
                <motion.div key="profile" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="space-y-6 lg:space-y-8">
                   {/* Top Summary Cards */}
                   <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-2 bg-white rounded-3xl p-6 lg:p-7 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
                         <div className={`relative w-[100px] h-[100px] lg:w-[116px] lg:h-[116px] rounded-2xl overflow-hidden shrink-0 shadow-md bg-slate-100 border-2 ${profileTarget.type === 'critical' ? 'border-red-100' : 'border-transparent'}`}>
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${profileTarget.name}&backgroundColor=cbd5e1`} alt={profileTarget.name} className="w-full h-full object-cover scale-110" />
                            {profileTarget.type === 'critical' && (
                              <div className="absolute bottom-1 right-1 p-1 bg-red-600 text-white rounded-lg border-2 border-white shadow-sm">
                                 <AlertTriangle size={14} strokeWidth={3} />
                              </div>
                            )}
                         </div>
                         <div className="flex-1 flex flex-col items-center sm:items-start w-full">
                            <h2 className="text-[24px] lg:text-[28px] font-bold text-slate-900 leading-tight mb-1">{profileTarget.name}</h2>
                            <p className="text-[13px] lg:text-[14px] text-slate-600 font-medium mb-4">
                               {profileTarget.grade} • Dept. {profileTarget.department} • ID: {profileTarget.id}
                            </p>
                            <div className="flex gap-2 flex-wrap justify-center sm:justify-start mb-5">
                               <span className="bg-slate-100 text-slate-600 px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                                  CLASE DE {profileTarget.classOf}
                               </span>
                               {profileTarget.probation !== 'NINGUNO' && (
                                 <span className="bg-red-50 text-red-600 px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                                    PRUEBA {profileTarget.probation}
                                 </span>
                               )}
                            </div>
                         </div>
                      </div>

                      <div className="bg-white rounded-3xl p-6 lg:p-7 flex flex-col justify-between border border-slate-100 shadow-sm">
                         <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 text-center lg:text-left">TOTAL DE ATRASOS</span>
                         <div className="flex items-baseline justify-center lg:justify-start gap-2 mt-4">
                            <span className={`text-[40px] lg:text-[48px] font-bold leading-none ${profileTarget.total >= 10 ? 'text-red-500' : 'gradient-text'}`}>{profileTarget.total}</span>
                            <span className="text-[12px] lg:text-[13px] font-bold text-red-500 whitespace-nowrap">{profileTarget.lastDelay}</span>
                         </div>
                      </div>

                      <div className="bg-[#fdf4eb] rounded-3xl p-6 lg:p-7 flex flex-col justify-between border border-orange-100/50">
                         <span className="text-[11px] font-bold uppercase tracking-widest text-[#9c5a33] text-center lg:text-left">ASISTENCIA</span>
                         <div className="mt-4">
                            <div className="flex items-baseline justify-center lg:justify-start gap-1">
                               <span className="text-[36px] lg:text-[44px] font-bold text-[#814522] leading-none">{profileTarget.compliance}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-orange-200/50 rounded-full mt-4 overflow-hidden">
                               <div className="h-full bg-[#814522] rounded-full" style={{ width: `${profileTarget.compliance}%` }}></div>
                            </div>
                         </div>
                       </div>
                    </div>

                   {/* Main Content Grid */}
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                      <div className="lg:col-span-2 space-y-6">
                         <div className="flex justify-between items-center px-1">
                            <h3 className="text-[18px] lg:text-[20px] font-bold text-slate-900">Historial Cronológico</h3>
                         </div>

                         <div className="space-y-4">
                            {CHRONOLOGY.map((item, idx) => (
                              <div key={item.id} className="relative pl-0 md:pl-7">
                                 {idx !== CHRONOLOGY.length - 1 && <div className="absolute top-12 bottom-[-24px] left-[35px] w-[2px] bg-slate-200 hidden md:block"></div>}
                                 
                                 <div className="bg-white rounded-3xl p-5 lg:p-6 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-5 lg:gap-6 hover:shadow-md transition">
                                    <div className={`hidden md:block absolute left-0 top-0 bottom-0 w-1.5 ${item.type === 'critical' ? 'bg-red-600' : item.type === 'medium' ? 'bg-[#c2410c]' : 'bg-[#4338ca]'}`}></div>
                                    <div className={`md:hidden absolute top-0 left-0 right-0 h-1.5 ${item.type === 'critical' ? 'bg-red-600' : item.type === 'medium' ? 'bg-[#c2410c]' : 'bg-[#4338ca]'}`}></div>
                                    
                                    <div className="flex gap-4 lg:gap-6 flex-1 flex-col sm:flex-row items-center sm:items-start text-center sm:text-left mt-2 md:mt-0">
                                       <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shrink-0 mt-1 ${item.type === 'critical' ? 'bg-red-50 text-red-600' : item.type === 'medium' ? 'bg-orange-50 text-[#c2410c]' : 'bg-blue-50 gradient-text'}`}>
                                          <item.icon size={24} strokeWidth={2.5} />
                                       </div>
                                       <div className="space-y-3 w-full">
                                          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start pt-1 gap-3 sm:gap-0">
                                             <div>
                                                <h4 className="text-[16px] lg:text-[17px] font-bold text-slate-900">{item.title}</h4>
                                                <p className="text-[12px] lg:text-[13px] text-slate-500 mt-0.5">Registrado por: {item.recordedBy}</p>
                                             </div>
                                             <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-slate-500 text-[11px] font-bold border border-slate-100 shrink-0">
                                                {item.date}
                                             </div>
                                          </div>
                                          <p className="text-[12px] lg:text-[13px] italic text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">"{item.note}"</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-6">
                         {profileTarget.type === 'critical' && (
                           <div className="bg-[#0b3b9b] rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-blue-900/10">
                              <h3 className="text-[16px] lg:text-[18px] font-bold mb-3 lg:mb-4">Intervención Requerida</h3>
                              <p className="text-blue-100 text-[13px] lg:text-[14px] leading-relaxed mb-5 lg:mb-6">
                                 {profileTarget.name} ha superado el umbral de retrasos de este semestre. Intervención oficial obligatoria.
                              </p>
                              <button className="w-full bg-white text-[#0b3b9b] py-3 lg:py-3.5 rounded-xl font-bold text-[13px] lg:text-[14px] flex items-center justify-center gap-2 hover:bg-slate-50 transition shadow-sm">
                                 <Mail size={18} /> Programar Reunión
                              </button>
                           </div>
                         )}

                         <div className="glass-card rounded-3xl transition-all duration-300 hover:shadow-premium p-6 lg:p-8 shadow-sm">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-5 lg:mb-6">ANÁLISIS DE PATRONES</h3>
                            <div className="space-y-4 lg:space-y-5">
                               <div className="flex justify-between items-center text-[13px] lg:text-[14px] border-b border-slate-100 pb-3">
                                  <span className="text-slate-500 font-medium">Día más Frecuente</span>
                                  <span className="font-bold text-slate-800">Lunes</span>
                               </div>
                               <div className="flex justify-between items-center text-[13px] lg:text-[14px] border-b border-slate-100 pb-3">
                                  <span className="text-slate-500 font-medium">Causa Primaria</span>
                                  <span className="font-bold text-slate-800">Tránsito</span>
                               </div>
                            </div>
                         </div>
                         
                         {currentUser?.role === 'student' && (
                            <div className="glass-card rounded-3xl transition-all duration-300 hover:shadow-premium p-6 lg:p-8 shadow-sm">
                               <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-5 lg:mb-6">COMUNIDAD</h3>
                               <p className="text-[13px] lg:text-[14px] text-slate-500 mb-5">Observe el directorio de sus compañeros de curso y profesores asignados.</p>
                               <button onClick={() => changeView('directory')} className="w-full bg-slate-50 gradient-text py-3 lg:py-3.5 rounded-xl font-bold text-[13px] lg:text-[14px] hover:bg-blue-50 transition border border-transparent hover:border-blue-100 flex items-center justify-center gap-2">
                                  <Users size={18} /> Ver Directorio de Curso
                               </button>
                            </div>
                         )}
                      </div>
                   </div>
                </motion.div>
                 );
              })() : activeView === "qr" ? (() => {
                 const profileTarget = currentUser?.role === 'student' ? { ...currentUser, id: currentUser.rut || '000' } : selectedStudent;
                 return (
                 <motion.div key="qr" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="space-y-6 lg:space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="bg-white rounded-3xl p-8 lg:p-12 border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden w-full max-w-2xl">
                       <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 to-[#4338ca]"></div>
                       <div className="text-center mb-8">
                          <h2 className="text-[24px] lg:text-[28px] font-bold text-slate-900 mb-2">Pase de Acceso Seguro</h2>
                          <p className="text-[14px] lg:text-[15px] text-slate-500 max-w-md mx-auto">Presente este código en los puntos de entrada. El código es dinámico y protege su identidad.</p>
                       </div>
                       
                       <div className="w-full flex justify-center">
                          {!showSecureQR ? (
                             <button onClick={() => setShowSecureQR(true)} className="bg-gradient-to-r from-[#4338ca] to-[#4f46e5] text-white shadow-md hover:shadow-[#4338ca]/30 px-10 py-5 rounded-2xl font-bold text-[16px] shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all w-full sm:w-auto flex items-center justify-center gap-3">
                                <QrCode size={24} /> Generar QR de Ingreso
                             </button>
                          ) : (
                             <SecureQR studentId={profileTarget.id} onExpire={() => setShowSecureQR(false)} />
                          )}
                       </div>
                    </div>
                 </motion.div>
                 );
              })() : activeView === "settings" ? (
                 <motion.div key="settings" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="space-y-6 lg:space-y-8">
                    <div>
                       <h1 className="text-[28px] lg:text-[32px] font-bold gradient-text tracking-tight mb-2">Configuraciones</h1>
                       <p className="text-slate-500 text-[13px] lg:text-[14px] font-medium">Gestione su cuenta y seguridad de acceso.</p>
                    </div>
                    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-sm max-w-xl">
                       <h2 className="text-[18px] font-bold text-slate-900 mb-6">Cambiar Contraseña</h2>
                       <div className="space-y-4">
                          <div>
                             <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Nueva Contraseña</label>
                             <input type="password" placeholder="••••••••" className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 outline-none focus:border-[#4338ca] transition" />
                          </div>
                          <div>
                             <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Confirmar Contraseña</label>
                             <input type="password" placeholder="••••••••" className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 outline-none focus:border-[#4338ca] transition" />
                          </div>
                          <button className="w-full bg-gradient-to-r from-[#4338ca] to-[#4f46e5] text-white shadow-md hover:shadow-[#4338ca]/30 py-4 rounded-xl font-bold hover:bg-blue-700 transition mt-2">Actualizar Contraseña</button>
                       </div>
                    </div>
                 </motion.div>
              ) : activeView === "reports" ? (
                <motion.div key="reports" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="space-y-6 lg:space-y-8">
                    <div>
                      <h1 className="text-[28px] lg:text-[32px] font-bold gradient-text tracking-tight mb-2">Analíticas y Reportes</h1>
                      <p className="text-slate-500 text-[13px] lg:text-[14px] font-medium">Visualización de datos de asistencia a nivel institucional para el periodo actual.</p>
                   </div>
                   
                   <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      <div className="bg-white p-5 lg:p-8 rounded-3xl shadow-sm border border-slate-100 xl:col-span-2 overflow-hidden w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
                           <h3 className="text-[15px] lg:text-[16px] font-bold text-slate-900 flex items-center gap-2">
                             <BarChartIcon size={20} className="gradient-text" /> Frecuencia de Atrasos (Semanal)
                           </h3>
                           <select className="bg-slate-50 border border-slate-200 text-xs lg:text-sm font-bold text-slate-600 rounded-xl px-4 py-2 outline-none w-full sm:w-auto">
                              <option>Esta Semana</option>
                              <option>Mes Pasado</option>
                           </select>
                        </div>
                        <div className="h-[250px] lg:h-[300px] w-full min-w-0">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={REPORT_DATA}>
                                 <defs>
                                    <linearGradient id="colorAtrasos" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#4338ca" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#4338ca" stopOpacity={0}/>
                                    </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 'bold'}} dy={10} />
                                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} dx={-10} width={30} />
                                 <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'}} />
                                 <Area type="monotone" dataKey="atrasos" stroke="#4338ca" strokeWidth={4} fillOpacity={1} fill="url(#colorAtrasos)" />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-[#1e3a8a] text-white p-6 lg:p-8 rounded-3xl shadow-xl shadow-blue-900/10 flex flex-col justify-between">
                         <h3 className="text-[13px] lg:text-[14px] font-bold text-blue-200 tracking-widest uppercase mb-4 xl:mb-0">Resumen Crítico</h3>
                         <div className="mb-6 xl:mb-0">
                            <p className="text-[54px] lg:text-[64px] font-black leading-none mb-1 lg:mb-2">134</p>
                            <p className="text-[14px] lg:text-[15px] font-bold text-blue-100">Total Atrasos Semanales</p>
                         </div>
                         <div className="space-y-4">
                            <div className="bg-white/10 rounded-xl p-4">
                               <p className="text-[11px] lg:text-[12px] font-medium text-blue-200 mb-1">Día más conflictivo</p>
                               <p className="font-bold text-[15px] lg:text-[16px]">Lunes (31%)</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-4">
                               <p className="text-[11px] lg:text-[12px] font-medium text-blue-200 mb-1">Departamento con fallas</p>
                               <p className="font-bold text-[15px] lg:text-[16px]">Arquitectura</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
              ) : activeView === "reception" ? (
                <motion.div key="reception" initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: -20 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="max-w-4xl mx-auto space-y-6 lg:space-y-8 mt-4 lg:mt-10">
                   <div className="text-center mb-8 lg:mb-10 px-4">
                      <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-[#4338ca] to-[#4f46e5] text-white shadow-md hover:shadow-[#4338ca]/30 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-5 shadow-lg shadow-blue-500/30">
                         <UserCheck size={32} className="scale-90 lg:scale-100" />
                      </div>
                      <h1 className="text-[26px] lg:text-[32px] font-black text-slate-900 tracking-tight leading-tight">Registro de Ingreso</h1>
                      <p className="text-slate-500 font-medium mt-2 text-[13px] lg:text-[15px]">Registre la llegada del estudiante. El sistema calculará el atraso automáticamente.</p>
                   </div>

                   <div className="bg-white rounded-3xl p-6 lg:p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
                      <div className="space-y-6 lg:space-y-8">
                         <div>
                            <div className="flex justify-between items-end mb-3">
                               <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-400 tracking-widest block">1. Identidad del Estudiante</label>
                               <button onClick={() => setIsScanningQR(!isScanningQR)} className="text-[12px] font-bold gradient-text flex items-center gap-1.5 hover:underline">
                                  <Camera size={14} /> {isScanningQR ? 'Cerrar Cámara' : 'Escanear QR'}
                               </button>
                            </div>
                            
                            {isScanningQR && (
                               <div key="qr-scanner" className="w-full max-w-md mx-auto bg-slate-900 rounded-2xl overflow-hidden relative mb-6 shadow-inner animate-in zoom-in-95 duration-300 border border-slate-800">
                                  <Scanner 
                                     onScan={(results) => {
                                        if (results && results.length > 0) {
                                           const rawValue = results[0].rawValue;
                                           let searchId = rawValue;
                                           
                                           // Parse the ENTRY token if it exists (Format: ENTRY:studentId-timestamp)
                                           if (rawValue.startsWith('ENTRY:')) {
                                              const tokenStr = rawValue.substring(6);
                                              const lastDashIdx = tokenStr.lastIndexOf('-');
                                              if (lastDashIdx !== -1) {
                                                 searchId = tokenStr.substring(0, lastDashIdx);
                                              }
                                           }
                                           
                                           searchId = searchId.trim();

                                           const studentList = studentsRef.current;
                                           const student = studentList.find(s => s.id === searchId || s.name === searchId || s.id === rawValue.trim());
                                           if (student) {
                                              setFoundStudent(student);
                                              setIsScanningQR(false);
                                              setReceptionSearch('');
                                           } else {
                                              setReceptionSearch(searchId);
                                           }
                                        }
                                     }}
                                  />
                               </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4">
                               <input value={receptionSearch} onChange={(e) => setReceptionSearch(e.target.value)} className="flex-1 bg-slate-50 p-3.5 lg:p-4 rounded-xl border border-slate-200 focus:border-[#4338ca] focus:ring-2 focus:ring-blue-100 outline-none text-[14px] lg:text-[15px] font-medium transition" placeholder="Ingrese nombre o ID del alumno..." />
                               <button 
                                 onClick={() => {
                                    const searchInput = receptionSearch.trim().toLowerCase();
                                    if (!searchInput) return;
                                    const student = students.find(s => s.id.toLowerCase() === searchInput || s.name.toLowerCase() === searchInput);
                                    if (student) {
                                       setFoundStudent(student);
                                       setReceptionSearch('');
                                    } else {
                                       alert('Estudiante no encontrado');
                                    }
                                 }} 
                                 className="bg-[#1e293b] text-white py-3.5 lg:py-0 sm:px-8 rounded-xl font-bold text-[14px] hover:bg-slate-800 transition w-full sm:w-auto shadow-md hover:shadow-xl"
                               >
                                 Buscar
                               </button>
                            </div>
                         </div>
                            
                            {foundStudent && (
                              <div key="found-student-card" className="mt-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 lg:gap-5 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl animate-in fade-in slide-in-from-top-4">
                                 <div className="w-12 h-12 bg-[#4338ca] rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                                    {foundStudent.name[0]}
                                 </div>
                                 <div className="flex-1">
                                    <p className="font-bold text-slate-900 text-[15px] lg:text-[16px]">{foundStudent.name}</p>
                                    <p className="text-[12px] lg:text-[13px] text-slate-500 font-medium">ID: {foundStudent.id} • {foundStudent.grade}</p>
                                 </div>
                                 <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shrink-0 w-full sm:w-auto">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block text-center">Atraso #</span>
                                    <span className="text-[18px] font-black gradient-text text-center block leading-none">{foundStudent.total + 1}</span>
                                 </div>
                              </div>
                            )}

                         {foundStudent && (() => {
                           const delay = calculateDelay(arrivalTime);
                           return (
                           <div key="found-student-details" className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 pt-6 border-t border-slate-100 animate-in fade-in">
                              <div className="space-y-3">
                                 <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-400 tracking-widest">2. Detalles de Ingreso</label>
                                 <div className="flex gap-3">
                                    <input type="time" value={arrivalTime} onChange={e => setArrivalTime(e.target.value)} className="w-1/2 bg-slate-50 p-3.5 lg:p-4 rounded-xl border border-slate-200 focus:border-[#4338ca] outline-none text-[14px] lg:text-[15px] font-medium" />
                                    {delay.type === 'none' ? (
                                       <select disabled className="w-1/2 bg-slate-50 p-3.5 lg:p-4 rounded-xl border border-slate-200 outline-none text-[14px] lg:text-[15px] font-medium opacity-60 appearance-none">
                                          <option>Llegó a la hora</option>
                                       </select>
                                    ) : (
                                       <select className="w-1/2 bg-slate-50 p-3.5 lg:p-4 rounded-xl border border-slate-200 outline-none text-[14px] lg:text-[15px] font-medium cursor-pointer focus:border-[#4338ca]">
                                          <option>Tránsito / Tráfico</option>
                                          <option>Cita Médica</option>
                                          <option>Problema Familiar</option>
                                          <option>Clima</option>
                                          <option>Sin Justificación</option>
                                       </select>
                                    )}
                                 </div>
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[10px] lg:text-[11px] font-black uppercase text-slate-400 tracking-widest">3. Estado Calculado</label>
                                 {delay.type === 'none' ? (
                                    <div key="delay-none" className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3.5 lg:p-4 rounded-xl font-bold flex items-center gap-3 text-[14px] lg:text-[15px]"><CheckCircle2 size={20}/> Llegada a la hora correspondiente</div>
                                 ) : (
                                    <div key="delay-some" className={`p-3.5 lg:p-4 rounded-xl font-bold flex items-center gap-3 text-[14px] lg:text-[15px] border ${
                                       delay.type === 'low' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                                       delay.type === 'medium' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                       'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                       <AlertTriangle size={20} />
                                       <div>
                                          Atraso {delay.level} <span className="opacity-75 font-medium">({delay.diff} min tarde)</span>
                                       </div>
                                    </div>
                                 )}
                              </div>
                              <div className="col-span-1 sm:col-span-2 pt-2 lg:pt-4">
                                <button onClick={() => { setFoundStudent(null); setReceptionSearch(''); }} className="w-full bg-gradient-to-r from-[#4338ca] to-[#4f46e5] text-white shadow-md hover:shadow-[#4338ca]/30 py-4 lg:py-5 rounded-2xl font-black text-[14px] lg:text-[15px] uppercase tracking-widest shadow-xl shadow-blue-500/40 hover:bg-blue-700 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 lg:gap-3">
                                   <CheckCircle2 size={24} className="scale-90 lg:scale-100" /> Confirmar Ingreso
                                </button>
                              </div>
                           </div>
                           );
                         })()}
                      </div>
                   </div>
                </motion.div>
              ) : null}
              </AnimatePresence>
           </div>
        </div>
      
     {/* MODAL INGRESAR LLEGADA */}
     <AnimatePresence>
        {isClockInOpen && clockInStudent && (
           <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 lg:p-8 max-w-sm w-full shadow-2xl">
                 <h3 className="text-lg font-bold text-slate-900 mb-1">Registrar Llegada</h3>
                 <p className="text-sm text-slate-500 mb-5">Estudiante: <b>{clockInStudent.name}</b></p>
                 <div className="mb-6">
                    <label className="text-[12px] font-black uppercase text-slate-400 tracking-widest block mb-2">Hora de Entrada (00:00)</label>
                    <input type="time" value={clockInTime} onChange={e => setClockInTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 outline-none p-3.5 rounded-xl font-bold text-slate-800 focus:border-[#4338ca]" />
                 </div>
                 <div className="flex gap-3">
                    <button onClick={() => setIsClockInOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Cancelar</button>
                    <button onClick={handleClockIn} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30">Confirmar</button>
                 </div>
              </motion.div>
           </div>
        )}
     </AnimatePresence>

     {/* MODAL CREAR ALUMNO */}
     <AnimatePresence>
        {isAddStudentOpen && (
           <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl">
                 <h3 className="text-lg font-bold text-slate-900 mb-6">Crear Nuevo Estudiante</h3>
                 <div className="space-y-4 mb-6">
                    <div>
                       <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block mb-2">Nombre Completo</label>
                       <input type="text" value={newStudentData.name} onChange={e => setNewStudentData({...newStudentData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 outline-none p-3 rounded-xl focus:border-[#4338ca]" />
                    </div>
                    <div>
                       <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block mb-2">Identidad (RUT)</label>
                       <input type="text" value={newStudentData.id} onChange={e => setNewStudentData({...newStudentData, id: e.target.value})} placeholder="Ej: 21.456.789-0" className="w-full bg-slate-50 border border-slate-200 outline-none p-3 rounded-xl focus:border-[#4338ca]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block mb-2">Grado</label>
                          <input type="text" value={newStudentData.grade} onChange={e => setNewStudentData({...newStudentData, grade: e.target.value})} className="w-full bg-slate-50 border border-slate-200 outline-none p-3 rounded-xl focus:border-[#4338ca]" />
                       </div>
                       <div>
                          <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block mb-2">Depto.</label>
                          <input type="text" value={newStudentData.department} onChange={e => setNewStudentData({...newStudentData, department: e.target.value})} className="w-full bg-slate-50 border border-slate-200 outline-none p-3 rounded-xl focus:border-[#4338ca]" />
                       </div>
                    </div>
                    <div>
                       <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block mb-2">Correo Estudiantil</label>
                       <input type="email" value={newStudentData.email} onChange={e => setNewStudentData({...newStudentData, email: e.target.value})} placeholder="ejemplo@escuela.edu" className="w-full bg-slate-50 border border-slate-200 outline-none p-3 rounded-xl focus:border-[#4338ca]" />
                    </div>
                    <div>
                       <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block mb-2">Contraseña Inicial</label>
                       <input type="text" value={newStudentData.password} onChange={e => setNewStudentData({...newStudentData, password: e.target.value})} placeholder="Ingrese contraseña" className="w-full bg-slate-50 border border-slate-200 outline-none p-3 rounded-xl focus:border-[#4338ca]" />
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <button onClick={() => setIsAddStudentOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Cancelar</button>
                    <button onClick={handleAddStudent} className="flex-[2] py-3 bg-gradient-to-r from-[#4338ca] to-[#4f46e5] text-white shadow-md hover:shadow-[#4338ca]/30 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2"><Plus size={16}/> Añadir Directorio</button>
                 </div>
              </motion.div>
           </div>
        )}
     </AnimatePresence>
     
</main>
    </div>
  );
}
