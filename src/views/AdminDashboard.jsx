import { useAttendance } from '../hooks/useAttendance';
import { 
  ArrowLeft, 
  Search, 
  Bell, 
  HelpCircle,
  Clock,
  Mail,
  ChevronDown,
  Filter,
  Download,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const { records } = useAttendance();

  return (
    <div className="flex-1 p-8 md:p-12 animate-in fade-in duration-700 bg-[#f8fafc] text-left">
      {/* Top Header Section */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-6">
           <button className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400">
              <ArrowLeft size={24} />
           </button>
           <h1 className="text-3xl font-black text-slate-800 tracking-tight">Perfil Detallado del Alumno</h1>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar registros..." 
                className="bg-white pl-12 pr-6 py-4 rounded-2xl border border-slate-100 shadow-sm w-64 md:w-80 font-bold focus:border-brand-primary outline-none transition-all"
              />
           </div>
           <button className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400">
              <Bell size={20} />
           </button>
           <button className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400">
              <HelpCircle size={20} />
           </button>
           <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm ml-2">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="profile" />
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-10">
           <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-12 items-center">
              <div className="flex items-center gap-8 col-span-2 border-r border-slate-50 pr-8">
                 <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-xl shrink-0">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=julian" alt="julian" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full border-2 border-white">
                       <AlertTriangle size={14} className="text-white" />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <h2 className="text-4xl font-black text-slate-900 leading-none">Julian Thorne</h2>
                    <p className="text-slate-400 font-bold tracking-tight text-sm">
                       Último Año • Arquitectura • ID: 2024-00892
                    </p>
                    <div className="flex gap-3">
                       <span className="bg-slate-100 px-4 py-2 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">Clase de 2025</span>
                       <span className="bg-red-50 px-4 py-2 rounded-xl text-[10px] font-black text-red-500 uppercase tracking-widest">Prueba Nivel 2</span>
                    </div>
                 </div>
              </div>
              <div className="space-y-2">
                 <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Total de Atrasos</p>
                 <p className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums flex items-end gap-2">
                    {records.length} <span className="text-[10px] font-bold text-red-500 mb-2">+2 hoy</span>
                 </p>
              </div>
              <div className="space-y-2 border-l border-slate-50 pl-8">
                 <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Latencia Promedio</p>
                 <p className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums flex items-end gap-2">
                    12 <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Minutos</span>
                 </p>
              </div>
           </div>

           <div className="space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black text-slate-900">Historial de Atrasos</h3>
                 <div className="flex gap-4">
                    <button className="bg-white border border-slate-100 px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-[10px] text-slate-600 uppercase tracking-widest shadow-sm">
                       <Filter size={18} /> Filtrar
                    </button>
                    <button className="bg-white border border-slate-100 px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-[10px] text-slate-600 uppercase tracking-widest shadow-sm">
                       <Download size={18} /> Exportar
                    </button>
                 </div>
              </div>

              <div className="space-y-6">
                 {records.length === 0 && (
                   <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-widest">
                      Sin registros recientes
                   </div>
                 )}
                 {records.map((rec) => (
                   <div key={rec.id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        rec.severity === 'CRÍTICO' ? 'bg-red-500' : 
                        rec.severity === 'MEDIANO' ? 'bg-orange-400' : 
                        'bg-blue-500'
                      }`} />
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                         <div className="flex gap-8 items-center">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                              rec.severity === 'CRÍTICO' ? 'bg-red-50 text-red-500' : 
                              rec.severity === 'MEDIANO' ? 'bg-orange-50 text-orange-400' : 
                              'bg-blue-50 text-blue-500'
                            }`}>
                               {rec.severity === 'CRÍTICO' ? <Clock size={28} /> : <Calendar size={28} />}
                            </div>
                            <div className="space-y-2">
                               <h4 className="text-xl font-black text-slate-900 uppercase truncate max-w-sm">{rec.studentName}</h4>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  {rec.date} • {rec.arrivalTime} • {rec.severity}
                               </p>
                            </div>
                         </div>
                         <div className="italic text-slate-500 text-xs font-medium bg-slate-50 p-4 rounded-xl flex-1 max-w-sm">
                            " {rec.reason || 'Sin observación'} "
                         </div>
                      </div>
                   </div>
                 ))}
                 
                 <button className="w-full py-6 text-brand-primary font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3">
                    Cargar Registros Anteriores <ChevronDown size={20} />
                 </button>
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-brand-primary rounded-[40px] p-8 text-white space-y-6 shadow-2xl shadow-brand-primary/20 text-left">
              <h3 className="text-2xl font-black mt-2">Intervención Requerida</h3>
              <p className="text-white/80 text-xs font-medium leading-relaxed">
                 Julian ha superado el umbral de retrasos injustificados este semestre. Una revisión formal es obligatoria.
              </p>
              <button className="w-full bg-white text-brand-primary py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                 <Mail size={18} /> Programar Reunión
              </button>
           </div>

           <div className="bg-slate-100/50 rounded-[40px] p-10 space-y-8 border border-white shadow-sm text-left">
              <h3 className="text-sm font-black text-slate-800 tracking-[0.2em]">ANÁLISIS DE PATRONES</h3>
              <div className="space-y-6">
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-500">Día Frecuente</span>
                    <span className="font-black text-slate-900">Lunes</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-500">Causa</span>
                    <span className="font-black text-slate-900">Tránsito</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-500">Recurrencia</span>
                    <span className="font-black text-red-500">+12%</span>
                 </div>
              </div>
           </div>

           <div className="space-y-6 bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm text-left">
              <h3 className="text-sm font-black text-slate-800 tracking-[0.2em]">NOTAS ADM.</h3>
              <div className="bg-slate-50 p-6 rounded-3xl border-l-4 border-slate-300">
                 <p className="text-xs text-slate-600 font-medium italic leading-relaxed">
                    "Se discutieron los problemas de tránsito el 10/15. Se sugirió transporte alternativo."
                 </p>
                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4">— ADVISOR S. KIM</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
