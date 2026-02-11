
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Plus, Ghost, PenTool, X, Trash2, Move, Edit3, Clock, 
  Check, Palette, MousePointer2, Infinity, Calendar, 
  Square, MousePointer, Type, AlertCircle
} from 'https://esm.sh/lucide-react@0.460.0';

// --- Types & Constants ---
type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange' | 'sunset' | 'ocean' | 'forest' | 'berry' | 'magic';
type NoteType = 'text' | 'sketch';

interface Note {
  id: string;
  type: NoteType;
  content?: string; 
  sketchData?: string;
  sketchColor?: string;
  color: NoteColor; 
  emoji?: string;
  createdAt: number;
  expiresAt?: number; 
  zIndex: number;
  position: { x: number; y: number };
}

const STORAGE_KEY = 'pastel_sticky_v31_sketch_fix';

const COLOR_MAP: Record<NoteColor, { bg: string; border: string; accent: string }> = {
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', accent: 'bg-yellow-400' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'bg-blue-400' },
  green: { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-400' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', accent: 'bg-pink-400' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', accent: 'bg-purple-400' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', accent: 'bg-orange-400' },
  sunset: { bg: 'bg-gradient-to-br from-orange-100 to-rose-100', border: 'border-orange-200', accent: 'bg-rose-400' },
  ocean: { bg: 'bg-gradient-to-br from-blue-100 to-cyan-100', border: 'border-blue-200', accent: 'bg-cyan-500' },
  forest: { bg: 'bg-gradient-to-br from-emerald-100 to-teal-100', border: 'border-emerald-200', accent: 'bg-teal-500' },
  berry: { bg: 'bg-gradient-to-br from-purple-100 to-pink-100', border: 'border-purple-200', accent: 'bg-pink-400' },
  magic: { bg: 'bg-gradient-to-br from-indigo-100 to-purple-100', border: 'border-indigo-200', accent: 'bg-purple-500' },
};

const TEXT_COLORS = [
  { name: 'Dark', value: '#1e293b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Purple', value: '#a855f7' },
];

const EMOJIS = ['📌', '💡', '🔥', '✅', '❤️', '⭐', '📅', '📝', '🎨', '🚀', '🌈', '🍕'];

// --- StickyNote Component ---
const StickyNote = React.memo<{
  note: Note;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onDragStart: (e: React.MouseEvent, id: string, element: HTMLDivElement) => void;
}>(({ note, onDelete, onEdit, onDragStart }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const colors = COLOR_MAP[note.color];
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!note.expiresAt) {
      setTimeLeft('영구 보관');
      return;
    }
    const updateCountdown = () => {
      const now = Date.now();
      const diff = note.expiresAt! - now;
      if (diff <= 0) { setTimeLeft('만료됨'); return; }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(hours > 0 ? `${hours}h ${mins}m` : `${mins}m ${secs}s`);
    };
    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(interval);
  }, [note.expiresAt]);

  return (
    <div 
      ref={elementRef}
      className="sticky-note-item absolute w-64 min-h-[260px] rounded-2xl shadow-xl border border-white/20 overflow-hidden"
      style={{ 
        transform: `translate3d(${note.position.x}px, ${note.position.y}px, 0)`,
        zIndex: note.zIndex 
      }}
    >
      <div 
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          setIsConfirmingDelete(false);
          onDragStart(e, note.id, elementRef.current!);
        }} 
        className={`h-11 w-full flex items-center justify-between px-3 cursor-grab active:cursor-grabbing ${colors.accent} shadow-inner transition-colors duration-300`}
      >
        <div className="flex items-center gap-1.5 text-white/95 text-[10px] font-black uppercase pointer-events-none tracking-tighter">
          <Move className="w-4 h-4" /> {note.emoji} {note.type === 'text' ? 'Memo' : 'Sketch'}
        </div>
        <div className="flex items-center gap-1.5">
          {isConfirmingDelete ? (
            <div className="flex items-center gap-1 animate-in slide-in-from-right-2 duration-200">
              <button onClick={() => onDelete(note.id)} className="bg-rose-500 text-white p-1 rounded-md shadow-md hover:bg-rose-600"><Check className="w-3.5 h-3.5"/></button>
              <button onClick={() => setIsConfirmingDelete(false)} className="bg-white/30 text-white p-1 rounded-md hover:bg-white/50"><X className="w-3.5 h-3.5"/></button>
            </div>
          ) : (
            <>
              <button onClick={() => onEdit(note)} className="text-white hover:bg-white/20 p-1 rounded-md transition-all active:scale-90"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => setIsConfirmingDelete(true)} className="text-white hover:bg-white/20 p-1 rounded-md transition-all active:scale-90"><Trash2 className="w-4 h-4" /></button>
            </>
          )}
        </div>
      </div>
      
      <div className={`p-5 flex flex-col h-full gap-4 ${colors.bg} min-h-[220px] transition-colors duration-300`}>
        {note.type === 'sketch' ? (
          <div className="flex-1 flex items-center justify-center overflow-hidden pointer-events-none">
            {note.sketchData && <img src={note.sketchData} className="max-w-full max-h-[160px] object-contain" alt="sketch" />}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden pointer-events-none">
            <div className="text-2xl font-handwriting break-words leading-tight rich-content opacity-90" dangerouslySetInnerHTML={{ __html: note.content || '' }} />
          </div>
        )}
        <div className="mt-auto pt-3 border-t border-black/5 flex items-center justify-between text-slate-500 text-[10px] font-black uppercase tracking-widest">
          <div className={`flex items-center gap-1.5 ${note.expiresAt && (note.expiresAt - Date.now() < 300000) ? 'text-rose-500' : ''}`}>
            {note.expiresAt ? <Clock className="w-3 h-3" /> : <Infinity className="w-3 h-3 text-indigo-400" />}
            <span className="truncate max-w-[100px]">{timeLeft}</span>
          </div>
          {note.type === 'sketch' && note.sketchColor && <div className="w-2.5 h-2.5 rounded-full shadow-inner" style={{ backgroundColor: note.sketchColor }} />}
        </div>
      </div>
    </div>
  );
});

// --- NoteModal Component ---
const NoteModal: React.FC<{
  initialNote?: Note | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ initialNote, onClose, onSubmit }) => {
  const [noteType, setNoteType] = useState<NoteType>(initialNote?.type || 'text');
  const [selectedBgColor, setSelectedBgColor] = useState<NoteColor>(initialNote?.color || 'yellow');
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>(initialNote?.emoji);
  const [activeSketchColor, setActiveSketchColor] = useState(initialNote?.sketchColor || TEXT_COLORS[0].value);
  const [isPermanent, setIsPermanent] = useState(!initialNote?.expiresAt);
  const [expiryDate, setExpiryDate] = useState(initialNote?.expiresAt ? new Date(initialNote.expiresAt).toISOString().split('T')[0] : new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [expiryTime, setExpiryTime] = useState(initialNote?.expiresAt ? new Date(initialNote.expiresAt).toTimeString().slice(0, 5) : '12:00');

  const editorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (noteType === 'text' && editorRef.current) {
      editorRef.current.innerHTML = initialNote?.content || '';
    }
  }, [noteType, initialNote]);

  useEffect(() => {
    if (noteType === 'sketch' && initialNote?.sketchData && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const img = new Image();
      img.onload = () => ctx?.drawImage(img, 0, 0);
      img.src = initialNote.sketchData;
    }
  }, [noteType, initialNote]);

  const applyTextColor = (color: string) => {
    if (noteType === 'text') {
      document.execCommand('foreColor', false, color);
      editorRef.current?.focus();
    } else {
      setActiveSketchColor(color);
    }
  };

  // 캔버스 좌표 보정 함수
  const getCanvasPos = (e: React.MouseEvent | MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let expiresAt: number | undefined = undefined;
    if (!isPermanent) {
      expiresAt = new Date(`${expiryDate}T${expiryTime}`).getTime();
      if (expiresAt <= Date.now()) { alert("미래 시간을 선택해주세요."); return; }
    }
    onSubmit({
      id: initialNote?.id || null, 
      type: noteType,
      content: noteType === 'text' ? editorRef.current?.innerHTML : undefined,
      sketchData: noteType === 'sketch' ? canvasRef.current?.toDataURL() : undefined,
      sketchColor: noteType === 'sketch' ? activeSketchColor : undefined,
      color: selectedBgColor,
      emoji: selectedEmoji,
      expiresAt
    });
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20 my-auto">
        <div className="px-8 py-5 border-b flex justify-between items-center bg-slate-50/50">
          <h2 className="font-black text-xs uppercase tracking-widest text-slate-800 flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-lg"><PenTool className="w-4 h-4" /></div>
            {initialNote ? '메모 수정' : '새 메모'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl shadow-inner">
            {(['text', 'sketch'] as const).map(t => (
              <button key={t} type="button" onClick={() => setNoteType(t)} className={`flex-1 py-2.5 rounded-xl font-black text-[10px] tracking-widest transition-all ${noteType === t ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div className="space-y-4">
            {noteType === 'text' ? (
              <div className="space-y-3">
                <div ref={editorRef} contentEditable className="w-full min-h-[160px] p-6 bg-slate-50 border border-slate-200 rounded-3xl font-handwriting text-3xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all overflow-y-auto max-h-[200px] shadow-inner" />
                <div className="flex items-center gap-3 px-2">
                  <Type className="w-4 h-4 text-slate-400" />
                  <div className="flex gap-3">
                    {TEXT_COLORS.map(c => <button key={c.value} type="button" onMouseDown={(e) => { e.preventDefault(); applyTextColor(c.value); }} className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-125 transition-transform" style={{ backgroundColor: c.value }} />)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <canvas ref={canvasRef} width={800} height={400}
                  onMouseDown={(e) => { 
                    setIsDrawing(true); 
                    const ctx = canvasRef.current!.getContext('2d')!; 
                    ctx.beginPath(); 
                    ctx.lineWidth=6; 
                    ctx.lineCap='round'; 
                    ctx.lineJoin='round';
                    ctx.strokeStyle=activeSketchColor; 
                    const pos = getCanvasPos(e);
                    ctx.moveTo(pos.x, pos.y); 
                  }}
                  onMouseMove={(e) => { 
                    if(!isDrawing) return; 
                    const ctx = canvasRef.current!.getContext('2d')!; 
                    const pos = getCanvasPos(e);
                    ctx.lineTo(pos.x, pos.y); 
                    ctx.stroke(); 
                  }}
                  onMouseUp={() => setIsDrawing(false)}
                  onMouseLeave={() => setIsDrawing(false)}
                  className="w-full h-48 bg-slate-50 border border-slate-200 rounded-3xl cursor-crosshair shadow-inner"
                />
                <div className="flex items-center gap-3 px-2">
                  <Palette className="w-4 h-4 text-slate-400" />
                  <div className="flex gap-3">
                    {TEXT_COLORS.map(c => <button key={c.value} type="button" onClick={() => setActiveSketchColor(c.value)} className={`w-6 h-6 rounded-full border-2 shadow-sm transition-all hover:scale-125 ${activeSketchColor === c.value ? 'border-indigo-600 scale-125' : 'border-white'}`} style={{ backgroundColor: c.value }} />)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">배경 컬러</p>
               <div className="grid grid-cols-6 gap-3">
                 {(Object.keys(COLOR_MAP) as NoteColor[]).map(c => <button key={c} type="button" onClick={() => setSelectedBgColor(c)} className={`w-full aspect-square rounded-full border-2 transition-all hover:scale-110 ${selectedBgColor === c ? 'border-indigo-600 scale-110 shadow-lg' : 'border-transparent'} ${COLOR_MAP[c].bg}`} />)}
               </div>
             </div>

             <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-500" /><span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">자동 삭제 예약</span></div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isPermanent} onChange={e => setIsPermanent(e.target.checked)} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-300 rounded-full peer peer-checked:bg-indigo-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                </div>
                {!isPermanent && (
                    <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-300">
                        <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100" />
                        <input type="time" value={expiryTime} onChange={e => setExpiryTime(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100" />
                    </div>
                )}
             </div>
             
             <div className="flex justify-between items-center px-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
               {EMOJIS.map(e => <button key={e} type="button" onClick={() => setSelectedEmoji(e === selectedEmoji ? undefined : e)} className={`text-2xl p-1 rounded-xl transition-all hover:scale-125 ${selectedEmoji === e ? 'bg-indigo-100 scale-110' : ''}`}>{e}</button>)}
             </div>
          </div>
          
          <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-600 active:scale-95 shadow-xl shadow-slate-200 transition-all">
            포스트잇 저장하기
          </button>
        </form>
      </div>
    </div>
  );
};

// --- App Component (Optimized Engine) ---
const App = () => {
  const [notes, setNotes] = useState<Record<string, Note>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    try { 
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const cleaned: Record<string, Note> = {};
        Object.keys(parsed).forEach(id => { if (!parsed[id].expiresAt || parsed[id].expiresAt > now) cleaned[id] = parsed[id]; });
        return cleaned;
    } catch { return {}; }
  });

  const [modalState, setModalState] = useState<{isOpen: boolean, editNote: Note | null}>({isOpen: false, editNote: null});
  
  const dragRef = useRef<{ 
    id: string; el: HTMLDivElement; 
    grabX: number; grabY: number; 
    currentX: number; currentY: number;
    parentRect: DOMRect;
    frameId: number;
  } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
        const now = Date.now();
        setNotes(prev => {
            let hasExpired = false;
            const next = { ...prev };
            Object.keys(next).forEach(id => { if (next[id].expiresAt && next[id].expiresAt! <= now) { delete next[id]; hasExpired = true; } });
            if (hasExpired) { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next; }
            return prev;
        });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveNote = useCallback((data: any) => {
    setNotes(prev => {
      const id = data.id || Math.random().toString(36).substr(2, 9);
      const existing = prev[id];
      const noteArray = Object.values(prev) as Note[];
      const maxZ = noteArray.length > 0 ? Math.max(...noteArray.map(n => n.zIndex)) : 0;
      const newNote: Note = {
        ...data, id, createdAt: existing?.createdAt || Date.now(),
        zIndex: existing?.zIndex || maxZ + 1,
        position: existing?.position || { x: 40 + Math.random()*150, y: 40 + Math.random()*150 }
      };
      const next = { ...prev, [id]: newNote };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setModalState({isOpen: false, editNote: null});
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent, id: string, el: HTMLDivElement) => {
    const note = notes[id];
    if (!note) return;
    
    const noteArray = Object.values(notes) as Note[];
    const maxZ = noteArray.length > 0 ? Math.max(...noteArray.map(n => n.zIndex)) : 0;
    el.style.zIndex = (maxZ + 1).toString();
    el.classList.add('is-dragging');

    const rect = el.getBoundingClientRect();
    const parent = el.parentElement!.getBoundingClientRect();
    
    dragRef.current = {
      id, el,
      grabX: e.clientX - rect.left,
      grabY: e.clientY - rect.top,
      currentX: note.position.x,
      currentY: note.position.y,
      parentRect: parent,
      frameId: 0
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      const info = dragRef.current;
      if (!info) return;

      info.currentX = moveEvent.clientX - info.parentRect.left - info.grabX;
      info.currentY = moveEvent.clientY - info.parentRect.top - info.grabY;

      cancelAnimationFrame(info.frameId);
      info.frameId = requestAnimationFrame(() => {
        info.el.style.transform = `translate3d(${info.currentX}px, ${info.currentY}px, 0)`;
      });
    };

    const onMouseUp = () => {
      const info = dragRef.current;
      if (info) {
        info.el.classList.remove('is-dragging');
        setNotes(prev => {
          const updated = { 
            ...prev, 
            [info.id]: { 
              ...prev[info.id], 
              position: { x: info.currentX, y: info.currentY },
              zIndex: parseInt(info.el.style.zIndex)
            } 
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dragRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
  }, [notes]);

  const noteList = useMemo(() => (Object.values(notes) as Note[]).sort((a, b) => a.zIndex - b.zIndex), [notes]);

  return (
    <div className="w-full h-full bg-[#f8fafc] flex flex-col font-sans">
      <header className="h-16 bg-white/95 backdrop-blur-xl border-b z-[2000] flex items-center justify-between px-10 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100 transition-transform hover:rotate-12 cursor-pointer"><PenTool className="text-white w-5 h-5" /></div>
          <div>
            <h1 className="text-sm font-black text-slate-800 tracking-tighter uppercase leading-none">Pastel Canvas</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ver 3.1 Stable</p>
          </div>
        </div>
        <button onClick={() => setModalState({isOpen: true, editNote: null})} className="bg-slate-900 text-white px-7 py-3 rounded-2xl text-[10px] font-black shadow-xl hover:bg-indigo-600 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest"><Plus className="w-4 h-4" /> New Memo</button>
      </header>

      <main className="flex-1 relative bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:32px_32px] overflow-hidden">
        {noteList.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 opacity-40 animate-in fade-in duration-1000">
            <Ghost className="w-20 h-20 mb-6" />
            <p className="font-black text-xs uppercase tracking-[0.4em]">Ready for notes</p>
          </div>
        )}
        {noteList.map(n => <StickyNote key={n.id} note={n} onDelete={(id) => setNotes(prev => { const next = {...prev}; delete next[id]; localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next; })} onEdit={(editNote) => setModalState({isOpen: true, editNote})} onDragStart={handleDragStart} />)}
      </main>

      {modalState.isOpen && <NoteModal initialNote={modalState.editNote} onClose={() => setModalState({isOpen: false, editNote: null})} onSubmit={handleSaveNote} />}
      
      <footer className="h-10 bg-white border-t flex items-center justify-between px-10 z-[1900]">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3"><MousePointer2 className="w-3.5 h-3.5" /> <span>Grab header to move</span> <span className="opacity-20">|</span> <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Auto-expiry supported</span></div>
        <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Active Notes: {noteList.length}</div>
      </footer>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
