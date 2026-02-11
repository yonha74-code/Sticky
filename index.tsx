
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'https://esm.sh/react@19.0.0';
import { createRoot } from 'https://esm.sh/react-dom@19.0.0/client';
import { Plus, Ghost, PenTool, X, Trash2, Move, Edit3, Clock, Type, Check, Palette, MousePointer2, RotateCcw, Infinity, Calendar, Download, Upload, Share2, Settings, Monitor, HelpCircle, ChevronRight, Minimize2, Square, ExternalLink } from 'https://esm.sh/lucide-react@0.460.0';

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

const STORAGE_KEY = 'pastel_sticky_v25_win';

const COLOR_MAP: Record<NoteColor, { bg: string; border: string; accent: string }> = {
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-200', accent: 'bg-yellow-400' },
  blue: { bg: 'bg-blue-100', border: 'border-blue-200', accent: 'bg-blue-400' },
  green: { bg: 'bg-emerald-100', border: 'border-emerald-200', accent: 'bg-emerald-400' },
  pink: { bg: 'bg-pink-100', border: 'border-pink-200', accent: 'bg-pink-400' },
  purple: { bg: 'bg-purple-100', border: 'border-purple-200', accent: 'bg-purple-400' },
  orange: { bg: 'bg-orange-100', border: 'border-orange-200', accent: 'bg-orange-400' },
  sunset: { bg: 'bg-gradient-to-br from-orange-200 to-rose-200', border: 'border-orange-300', accent: 'bg-rose-400' },
  ocean: { bg: 'bg-gradient-to-br from-blue-200 to-cyan-200', border: 'border-blue-300', accent: 'bg-cyan-500' },
  forest: { bg: 'bg-gradient-to-br from-emerald-200 to-teal-200', border: 'border-emerald-300', accent: 'bg-teal-500' },
  berry: { bg: 'bg-gradient-to-br from-purple-200 to-pink-200', border: 'border-purple-300', accent: 'bg-pink-400' },
  magic: { bg: 'bg-gradient-to-br from-indigo-200 to-purple-200', border: 'border-indigo-300', accent: 'bg-purple-500' },
};

const PALETTE_COLORS = [
  { name: 'Slate', value: '#1e293b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Purple', value: '#a855f7' },
];

const EMOJIS = ['📌', '💡', '🔥', '✅', '❤️', '⭐', '📅', '📝', '🎨', '🚀', '🌈', '🍕'];

const downloadJSON = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// --- StickyNote Component ---
const StickyNote: React.FC<{
  note: Note;
  isDragging: boolean;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onDragStart: (e: React.MouseEvent, id: string, element: HTMLDivElement) => void;
}> = ({ note, isDragging, onDelete, onEdit, onDragStart }) => {
  const [timeLeft, setTimeLeft] = useState('');
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
      const mins = Math.floor(diff / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(mins > 60 ? `${Math.floor(mins / 60)}시간 ${mins % 60}분` : `${mins}분 ${secs}초`);
    };
    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(interval);
  }, [note.expiresAt]);

  return (
    <div 
      ref={elementRef}
      className={`absolute w-64 min-h-[260px] rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-200 border border-white/20 overflow-hidden ${isDragging ? 'z-[9999]' : ''}`}
      style={{ 
        transform: `translate3d(${note.position.x}px, ${note.position.y}px, 0)`,
        zIndex: note.zIndex,
      }}
      data-note-id={note.id}
    >
      <div 
        onMouseDown={(e) => onDragStart(e, note.id, elementRef.current!)} 
        className={`h-9 w-full flex items-center justify-between px-3 cursor-grab active:cursor-grabbing ${colors.accent} rounded-t-lg backdrop-blur-sm`}
      >
        <div className="flex items-center gap-1.5 text-white/90 text-[10px] font-black uppercase select-none pointer-events-none">
          <Move className="w-3.5 h-3.5" /> {note.emoji} {note.type}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onEdit(note); }} className="text-white hover:bg-white/20 p-1 rounded-md transition-colors" title="수정"><Edit3 className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="text-white hover:bg-white/20 p-1 rounded-md transition-colors" title="삭제"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className={`p-5 flex flex-col h-full gap-4 ${colors.bg} min-h-[220px]`}>
        {note.type === 'sketch' ? (
          <div className="flex-1 flex items-center justify-center overflow-hidden pointer-events-none">
            {note.sketchData && <img src={note.sketchData} className="max-w-full max-h-[160px] object-contain" alt="sketch" />}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden pointer-events-none">
            <div className="text-2xl font-handwriting break-words leading-[1.2] whitespace-pre-wrap rich-content" dangerouslySetInnerHTML={{ __html: note.content || '' }} />
          </div>
        )}
        <div className="mt-auto pt-3 border-t border-black/5 flex items-center justify-between text-slate-500 text-[11px] font-bold">
          <div className="flex items-center gap-1.5">
            {note.expiresAt ? <Clock className="w-3.5 h-3.5 text-rose-400" /> : <Infinity className="w-3.5 h-3.5 text-indigo-400" />}
            <span className={timeLeft === '만료됨' ? 'text-rose-500' : note.expiresAt ? '' : 'text-indigo-500'}>{timeLeft}</span>
          </div>
          {note.type === 'sketch' && note.sketchColor && <div className="w-2.5 h-2.5 rounded-full ring-1 ring-black/5 shadow-inner" style={{ backgroundColor: note.sketchColor }} />}
        </div>
      </div>
    </div>
  );
};

// --- Help Modal ---
const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
    <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden border border-slate-100">
      <div className="p-8 space-y-6">
        <div className="flex justify-center">
          <div className="bg-indigo-600/10 p-4 rounded-3xl">
            <Monitor className="w-12 h-12 text-indigo-600" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Windows 앱으로 사용하기</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Pastel Sticky를 실제 프로그램처럼 설치하고<br/>작업 표시줄에 고정하여 사용해보세요!
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
            <div className="bg-white p-2 rounded-xl shadow-sm border text-xs font-bold text-slate-400">1</div>
            <p className="text-xs text-slate-600 font-bold leading-relaxed">상단의 <span className="text-indigo-600">"Windows 앱 설치"</span> 버튼을 클릭하세요.</p>
          </div>
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
            <div className="bg-white p-2 rounded-xl shadow-sm border text-xs font-bold text-slate-400">2</div>
            <p className="text-xs text-slate-600 font-bold leading-relaxed">바탕화면의 아이콘을 우클릭하여 <span className="text-indigo-600">"작업 표시줄에 고정"</span>을 선택하세요.</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors">확인했습니다</button>
      </div>
    </div>
  </div>
);

// --- NoteModal Component ---
const NoteModal: React.FC<{
  initialNote?: Note | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ initialNote, onClose, onSubmit }) => {
  const [noteType, setNoteType] = useState<NoteType>(initialNote?.type || 'text');
  const [selectedBgColor, setSelectedBgColor] = useState<NoteColor>(initialNote?.color || 'yellow');
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>(initialNote?.emoji);
  const [activeTextColor, setActiveTextColor] = useState(PALETTE_COLORS[0].value);
  const [activeSketchColor, setActiveSketchColor] = useState(initialNote?.sketchColor || PALETTE_COLORS[0].value);
  
  const [isPermanent, setIsPermanent] = useState(!initialNote?.expiresAt);
  const initialExpiry = initialNote?.expiresAt ? new Date(initialNote.expiresAt) : new Date(Date.now() + 86400000);
  const [expiryDate, setExpiryDate] = useState(initialExpiry.toISOString().split('T')[0]);
  const [expiryTime, setExpiryTime] = useState(initialExpiry.toTimeString().slice(0, 5));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

  useEffect(() => {
    if (noteType === 'text' && editorRef.current) {
      editorRef.current.innerHTML = initialNote?.content || '';
      checkEmpty();
    }
  }, [noteType]);

  useEffect(() => {
    if (noteType === 'sketch' && initialNote?.sketchData && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const img = new Image();
      img.onload = () => ctx?.drawImage(img, 0, 0);
      img.src = initialNote.sketchData;
    }
  }, [noteType, initialNote]);

  const checkEmpty = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML.trim();
    setIsEditorEmpty(!content || content === '<br>');
  };

  const applyTextColor = (color: string) => {
    setActiveTextColor(color);
    if (noteType === 'text' && editorRef.current) {
      editorRef.current.focus();
      document.execCommand('foreColor', false, color);
    }
  };

  const getCoordinates = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { 
      x: (e.clientX - rect.left) * (canvasRef.current!.width / rect.width), 
      y: (e.clientY - rect.top) * (canvasRef.current!.height / rect.height) 
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const richContent = editorRef.current?.innerHTML || '';
    if (noteType === 'text' && isEditorEmpty) return;
    let expiresAt: number | undefined = undefined;
    if (!isPermanent) {
      const expireObj = new Date(expiryDate);
      const [h, m] = expiryTime.split(':').map(Number);
      expireObj.setHours(h, m, 0, 0);
      expiresAt = expireObj.getTime();
    }
    onSubmit({
      id: initialNote?.id || null, 
      type: noteType,
      content: noteType === 'text' ? richContent : undefined,
      sketchData: noteType === 'sketch' ? canvasRef.current?.toDataURL() : undefined,
      sketchColor: noteType === 'sketch' ? activeSketchColor : undefined,
      color: selectedBgColor,
      emoji: selectedEmoji,
      expiresAt
    });
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
        <div className="px-6 py-5 border-b flex justify-between items-center bg-slate-50/80 backdrop-blur-md">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-lg shadow-indigo-200"><PenTool className="w-4 h-4" /></div>
            {initialNote ? '포스트잇 수정' : '새 포스트잇 부착'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl">
            {(['text', 'sketch'] as const).map(t => (
              <button key={t} type="button" onClick={() => setNoteType(t)} className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${noteType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{t === 'text' ? 'TEXT' : 'SKETCH'}</button>
            ))}
          </div>

          {noteType === 'text' ? (
            <div className="space-y-3">
              <div className="relative">
                <div ref={editorRef} contentEditable onInput={checkEmpty} className="w-full min-h-[160px] p-6 bg-slate-50 border border-slate-200 rounded-3xl font-handwriting text-3xl outline-none focus:ring-4 focus:ring-indigo-100 shadow-inner overflow-y-auto max-h-[240px]" />
                {isEditorEmpty && <div className="absolute top-6 left-6 text-slate-300 text-3xl font-handwriting pointer-events-none">메모를 작성하세요...</div>}
              </div>
              <div className="flex items-center justify-between px-1">
                <div className="flex gap-2.5">
                  {PALETTE_COLORS.map(c => (
                    <button key={c.value} type="button" onMouseDown={(e) => { e.preventDefault(); applyTextColor(c.value); }} className={`w-5 h-5 rounded-full border-2 transition-transform ${activeTextColor === c.value ? 'scale-125 border-slate-400 shadow-sm' : 'border-transparent'}`} style={{ backgroundColor: c.value }} />
                  ))}
                </div>
                <button type="button" onClick={() => { document.execCommand('removeFormat', false); editorRef.current?.focus(); }} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors uppercase"><RotateCcw className="w-3 h-3"/> Reset</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <div className="flex gap-2.5">
                  {PALETTE_COLORS.map(c => (
                    <button key={c.value} type="button" onClick={() => setActiveSketchColor(c.value)} className={`w-5 h-5 rounded-full border-2 transition-transform ${activeSketchColor === c.value ? 'scale-125 border-slate-400 shadow-sm' : 'border-transparent'}`} style={{ backgroundColor: c.value }} />
                  ))}
                </div>
                <button type="button" onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0,0,400,200)} className="text-[10px] font-black text-rose-400 uppercase tracking-tighter">Clear Canvas</button>
              </div>
              <canvas ref={canvasRef} width={400} height={200} onMouseDown={(e) => { setIsDrawing(true); const ctx = canvasRef.current!.getContext('2d')!; const c = getCoordinates(e); ctx.beginPath(); ctx.lineWidth=4; ctx.lineCap='round'; ctx.strokeStyle=activeSketchColor; ctx.moveTo(c.x, c.y); }} onMouseMove={(e) => { if(isDrawing) { const ctx = canvasRef.current!.getContext('2d')!; const c = getCoordinates(e); ctx.lineTo(c.x, c.y); ctx.stroke(); } }} onMouseUp={() => setIsDrawing(false)} onMouseLeave={() => setIsDrawing(false)} className="w-full h-44 bg-slate-50 border border-slate-200 rounded-3xl cursor-crosshair shadow-inner" />
            </div>
          )}

          <div className="space-y-6">
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Color Palette</p>
               <div className="flex flex-wrap gap-2.5 px-1">
                 {(Object.keys(COLOR_MAP) as NoteColor[]).map(c => (
                   <button key={c} type="button" onClick={() => setSelectedBgColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${selectedBgColor === c ? 'border-indigo-600 scale-110 shadow-lg' : 'border-transparent'} ${COLOR_MAP[c].bg}`} />
                 ))}
               </div>
             </div>

             <div className="p-5 bg-slate-50/80 border border-slate-200/50 rounded-3xl space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Expiry Date</span>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isPermanent} onChange={e => setIsPermanent(e.target.checked)} className="sr-only peer" />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ml-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Never</span>
                 </label>
               </div>
               {!isPermanent && (
                 <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-300">
                    <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100" />
                    <input type="time" value={expiryTime} onChange={e => setExpiryTime(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100" />
                 </div>
               )}
             </div>

             <div className="flex flex-wrap gap-2 justify-between px-1">{EMOJIS.map(e => <button key={e} type="button" onClick={() => setSelectedEmoji(e === selectedEmoji ? undefined : e)} className={`text-xl p-2 rounded-xl transition-all ${selectedEmoji === e ? 'bg-indigo-100 scale-110 shadow-sm' : 'hover:bg-slate-50'}`}>{e}</button>)}</div>
          </div>

          <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
            {initialNote ? <Check className="w-5 h-5"/> : <Plus className="w-5 h-5"/>} {initialNote ? 'Save Changes' : 'Attach Note'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- App Component ---
const App = () => {
  const [notes, setNotes] = useState<Record<string, Note>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    try {
      const parsed = JSON.parse(saved);
      const now = Date.now();
      return Object.keys(parsed).reduce((acc, id) => {
        const note = parsed[id];
        if (!note.expiresAt || note.expiresAt > now) acc[id] = note;
        return acc;
      }, {} as Record<string, Note>);
    } catch { return {}; }
  });

  const [modalState, setModalState] = useState<{isOpen: boolean, editNote: Note | null}>({isOpen: false, editNote: null});
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dragInfoRef = useRef<{ 
    id: string; el: HTMLDivElement; startX: number; startY: number; 
    initialX: number; initialY: number; currentX: number; currentY: number;
  } | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotes(prev => {
        const now = Date.now();
        const next = { ...prev };
        let expired = false;
        Object.keys(next).forEach(id => { 
          if (next[id].expiresAt && next[id].expiresAt! <= now) { 
            delete next[id]; 
            expired = true; 
          } 
        });
        return expired ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { 
    if (!activeDragId) localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); 
  }, [notes, activeDragId]);

  const handleSaveNote = useCallback((data: any) => {
    setNotes(prev => {
      const id = data.id || Math.random().toString(36).substr(2, 9);
      const existing = prev[id];
      const maxZ = Math.max(0, ...(Object.values(prev) as Note[]).map(n => n.zIndex));
      const newNote: Note = {
        ...data, id, createdAt: existing?.createdAt || Date.now(),
        zIndex: existing?.zIndex || maxZ + 1,
        position: existing?.position || { x: 50 + Math.random() * (window.innerWidth - 300), y: 100 + Math.random() * (window.innerHeight - 400) }
      };
      return { ...prev, [id]: newNote };
    });
    setModalState({isOpen: false, editNote: null});
    setToast({ message: data.id ? '수정 완료' : '부착 완료', type: 'success' });
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent, id: string, el: HTMLDivElement) => {
    e.preventDefault();
    const note = notes[id];
    if (!note) return;
    const maxZ = Math.max(0, ...(Object.values(notes) as Note[]).map(n => n.zIndex));
    setNotes(prev => ({ ...prev, [id]: { ...prev[id], zIndex: maxZ + 1 } }));
    dragInfoRef.current = {
      id, el, startX: e.clientX, startY: e.clientY,
      initialX: note.position.x, initialY: note.position.y,
      currentX: note.position.x, currentY: note.position.y
    };
    setActiveDragId(id);
    el.classList.add('scale-[1.03]', 'shadow-2xl', 'opacity-90', 'cursor-grabbing');
    el.style.willChange = 'transform';
  }, [notes]);

  useEffect(() => {
    if (!activeDragId) return;
    const onMouseMove = (e: MouseEvent) => {
      const info = dragInfoRef.current;
      if (!info) return;
      const dx = e.clientX - info.startX;
      const dy = e.clientY - info.startY;
      info.currentX = info.initialX + dx;
      info.currentY = info.initialY + dy;
      info.el.style.transform = `translate3d(${info.currentX}px, ${info.currentY}px, 0)`;
    };
    const onMouseUp = () => {
      const info = dragInfoRef.current;
      if (info) {
        info.el.classList.remove('scale-[1.03]', 'shadow-2xl', 'opacity-90', 'cursor-grabbing');
        info.el.style.willChange = 'auto';
        setNotes(prev => ({
          ...prev,
          [info.id]: { ...prev[info.id], position: { x: info.currentX, y: info.currentY } }
        }));
      }
      setActiveDragId(null);
      dragInfoRef.current = null;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [activeDragId]);

  const handleExport = () => {
    downloadJSON({ version: '2.5', notes, exportedAt: Date.now() }, `pastel_notes_${new Date().toISOString().split('T')[0]}.json`);
    setToast({ message: '백업 완료', type: 'info' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.notes) {
          setNotes(prev => ({ ...prev, ...data.notes }));
          setToast({ message: '복원 완료', type: 'success' });
        }
      } catch { setToast({ message: '실패', type: 'info' }); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const noteList = useMemo(() => (Object.values(notes) as Note[]).sort((a, b) => a.zIndex - b.zIndex), [notes]);

  return (
    <div className="w-full h-full bg-[#f8fafc] overflow-hidden select-none flex flex-col">
      {/* Windows Style Header */}
      <header className="h-14 bg-white/80 backdrop-blur-xl border-b z-[2000] flex items-center justify-between px-6 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200"><PenTool className="text-white w-4 h-4" /></div>
            <h1 className="text-sm font-black text-slate-800 tracking-tighter uppercase">Pastel Sticky</h1>
          </div>
          {installPrompt && (
            <button onClick={handleInstallClick} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-[10px] font-black hover:bg-indigo-100 transition-colors">
              <Monitor className="w-3 h-3" /> WINDOWS 앱 설치
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 mr-4">
             <button onClick={() => setIsHelpOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400" title="도움말"><HelpCircle className="w-4.5 h-4.5" /></button>
             <button onClick={handleExport} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400" title="백업"><Download className="w-4.5 h-4.5" /></button>
             <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400" title="복원"><Upload className="w-4.5 h-4.5" /></button>
             <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
          </div>
          <button onClick={() => setModalState({isOpen: true, editNote: null})} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2 uppercase">
            <Plus className="w-4 h-4" /> New Note
          </button>
          
          <div className="hidden lg:flex items-center gap-0.5 ml-4 border-l pl-4">
            <div className="p-2 hover:bg-slate-100 rounded-md text-slate-400"><Minimize2 className="w-3.5 h-3.5" /></div>
            <div className="p-2 hover:bg-slate-100 rounded-md text-slate-400"><Square className="w-3.5 h-3.5" /></div>
            <div className="p-2 hover:bg-rose-100 rounded-md text-slate-400 hover:text-rose-500"><X className="w-3.5 h-3.5" /></div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] overflow-hidden">
        {noteList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 animate-in fade-in duration-1000">
            <Ghost className="w-16 h-16 mb-4 opacity-30" />
            <p className="font-black text-sm uppercase tracking-widest">No Notes Found</p>
          </div>
        ) : noteList.map(n => (
          <StickyNote key={n.id} note={n} isDragging={activeDragId === n.id} onDelete={id => confirm('삭제하시겠습니까?') && setNotes(p => { const n={...p}; delete n[id]; return n; })} onEdit={editNote => setModalState({isOpen: true, editNote})} onDragStart={handleDragStart} />
        ))}
      </main>

      {modalState.isOpen && <NoteModal initialNote={modalState.editNote} onClose={() => setModalState({isOpen: false, editNote: null})} onSubmit={handleSaveNote} />}
      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
      
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-full shadow-2xl z-[6000] animate-in slide-in-from-bottom-4 flex items-center gap-2.5 uppercase tracking-widest">
          <div className="bg-indigo-500 p-1 rounded-full"><Check className="w-3 h-3 text-white" /></div> {toast.message}
        </div>
      )}

      <footer className="h-10 bg-white/50 border-t flex items-center justify-between px-6 z-[1900] shrink-0">
        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
          <MousePointer2 className="w-3 h-3" /> Drag Note Header to Move
        </div>
        <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
          <span>Active: {noteList.length}</span>
          <span>Build: 2.5.0-win</span>
        </div>
      </footer>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
