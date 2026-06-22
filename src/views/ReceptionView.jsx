import { useState } from 'react';
import { useAttendance } from '../hooks/useAttendance';
import { 
  Search, 
  ChevronDown, 
  X, 
  AlertTriangle, 
  Info,
  Clock,
  CheckCircle2,
  BellRing
} from 'lucide-react';

export default function ReceptionView() {
  const { findStudent, registerArrival } = useAttendance();
  const [query, setQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [severity, setSeverity] = useState('MEDIANO');
  const [cause, setCause] = useState('Tránsito');
  const [notes, setNotes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!query) return;
    const student = findStudent(query);
    if (student) setSelectedStudent(student);
  };

  const handleConfirm = () => {
    if (!selectedStudent) return;
    registerArrival(selectedStudent, {
      arrivalTime: new Date().toTimeString().substring(0, 5),
      reason: cause + (notes ? `: ${notes}` : ''),
      severity: severity
    });
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setSelectedStudent(null);
      setQuery('');
      setSeverity('MEDIANO');
      setCause('Tránsito');
      setNotes('');
    }, 3000);
  };

  return (
    <div className="flex-1 p-8 md:p-12 animate-in fade-in slide-in-from-top-4 duration-500 bg-[#f8fafc]">
      <nav className="flex text-sm font-medium text-slate-400 mb-6 uppercase tracking-wider">
        <span>Logs</span>
        <span className="mx-2">›</span>
        <span className="text-brand-primary">Log New Incident</span>
      </nav>

      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-left">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Register Student Delay</h1>
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
            Documentation of student tardiness ensures academic accountability and helps identify underlying patterns of behavior.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white rounded-3xl p-10 border border-slate-100 shadow-sm space-y-10 text-left">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Search size={14} /> Identify Student
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && handleSearch(e)}
                  placeholder="Enter student name or ID number..."
                  className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-transparent focus:bg-white focus:border-brand-primary transition-all outline-none italic text-slate-600 pr-12"
                />
                <button 
                  onClick={handleSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-brand-primary transition-colors"
                >
                  <Search size={22} />
                </button>
              </div>

              {selectedStudent && (
                <div className="flex items-center gap-4 p-4 bg-sky-50 border border-sky-100 rounded-2xl animate-in fade-in zoom-in-95">
                  <div className="w-14 h-14 bg-brand-primary rounded-xl overflow-hidden shrink-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.id}`} alt="avatar" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{selectedStudent.full_name}</p>
                    <p className="text-xs text-brand-primary font-semibold uppercase tracking-tight">
                       ID: {selectedStudent.rut} • {selectedStudent.official_entry_time} AM
                    </p>
                  </div>
                  <button onClick={() => setSelectedStudent(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
              <div className="space-y-4">
                 <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                   ✱ Cause of Delay
                 </label>
                 <div className="relative">
                    <select 
                      value={cause}
                      onChange={(e) => setCause(e.target.value)}
                      className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-transparent focus:bg-white focus:border-brand-primary transition-all outline-none appearance-none font-medium text-slate-600 italic"
                    >
                      <option value="Tránsito">Transit/Traffic</option>
                      <option value="Médico">Medical Appointment</option>
                      <option value="Personal">Personal Reasons</option>
                      <option value="Transporte">Shuttle/Bus Delay</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                   ❢ Delay Severity
                 </label>
                 <div className="flex gap-4 h-[60px]">
                    <button 
                      onClick={() => setSeverity('LEVE')}
                      className={`flex-1 rounded-xl font-bold uppercase transition-all tracking-widest text-[10px] ${severity === 'LEVE' ? 'bg-[#fee2e2] text-[#991b1b] border-2 border-red-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >Low</button>
                    <button 
                      onClick={() => setSeverity('MEDIANO')}
                      className={`flex-1 rounded-xl font-bold uppercase transition-all tracking-widest text-[10px] ${severity === 'MEDIANO' ? 'bg-[#78350f] text-white shadow-lg shadow-amber-900/40' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >Medium</button>
                    <button 
                      onClick={() => setSeverity('CRÍTICO')}
                      className={`flex-1 rounded-xl font-bold uppercase transition-all tracking-widest text-[10px] ${severity === 'CRÍTICO' ? 'bg-[#fecaca] text-[#991b1b] border-2 border-red-300' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >High</button>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
               <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                 ✍ Administrative Notes
               </label>
               <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe context or mitigating circumstances..."
                  className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-transparent focus:bg-white focus:border-brand-primary transition-all outline-none min-h-[120px] italic text-slate-600"
               />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-slate-50">
               <button onClick={() => setSelectedStudent(null)} className="text-xs font-black text-slate-900 border-b-2 border-slate-900 transition-all uppercase tracking-widest">
                  Discard Draft
               </button>
               <div className="flex gap-4 w-full md:w-auto">
                  <button className="flex-1 md:flex-none px-8 py-4 bg-slate-100 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">
                    Save as Preliminary
                  </button>
                  <button 
                    disabled={!selectedStudent}
                    onClick={handleConfirm}
                    className="flex-1 md:flex-none px-12 py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-brand-primary/30 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-30 disabled:translate-y-0"
                  >
                    Confirm & Log Delay
                  </button>
               </div>
            </div>
          </div>

          <div className="space-y-8 text-left">
            <div className="bg-slate-50 rounded-3xl p-8 space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Recent Tardiness Summary</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-600">Daily Average</span>
                    <span className="font-black text-slate-900 text-lg">14.2 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-600">Peak Time</span>
                    <span className="font-black text-slate-900 text-lg">08:15 AM</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                     <div className="h-full bg-brand-primary w-[70%]" />
                  </div>
               </div>
               <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Current trend is <span className="text-red-500 font-bold">12% higher</span> than previous week. Most delays attributed to regional transit maintenance.
               </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary mb-6 flex items-center gap-2">
                 <Info size={16} /> Registry Policy
               </h4>
               <ul className="space-y-3 text-xs text-slate-500 list-disc pl-5 font-medium leading-relaxed">
                 <li>Delay levels determine follow-up urgency with parents.</li>
                 <li>High severity incidents (30+ min) trigger automated faculty alerts.</li>
                 <li>Documentation must be filed within 2 hours of the incident.</li>
               </ul>
            </div>

            <div className="relative rounded-3xl overflow-hidden h-[200px] shadow-lg">
               <img 
                 src="https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?auto=format&fit=crop&q=80&w=1000" 
                 alt="Main Quad" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent p-6 flex flex-col justify-end">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Academic Environment</p>
                  <p className="text-lg font-black text-white">Main Quad Entrance</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed bottom-10 right-10 flex items-center gap-6 bg-slate-900 text-white p-6 rounded-3xl shadow-2xl animate-in slide-in-from-right-10 duration-500 z-[100]">
           <div className="bg-emerald-500 p-3 rounded-2xl shrink-0">
              <CheckCircle2 size={32} />
           </div>
           <div>
              <p className="font-black uppercase tracking-widest text-[10px] text-emerald-400 mb-1">Success</p>
              <p className="font-bold text-lg">Incident Logged Successfully</p>
           </div>
        </div>
      )}
    </div>
  );
}
