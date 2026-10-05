import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check, X, Type } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureData: string, signerName?: string) => void;
  title: string;
  initialName?: string;
  currentSignature?: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  initialName = '',
  currentSignature = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [name, setName] = useState(initialName);
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [selectedFont, setSelectedFont] = useState<'font-serif' | 'font-mono' | 'font-sans'>('font-serif');

  useEffect(() => {
    setName(initialName);
    setHasDrawn(!!currentSignature);
  }, [initialName, currentSignature, isOpen]);

  useEffect(() => {
    if (!isOpen || mode !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas dimensions to crisp scale
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0f172a';

    // If there is existing signature, render it if it's an image
    if (currentSignature && currentSignature.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = currentSignature;
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (canvas && hasDrawn) {
        const dataUrl = canvas.toDataURL('image/png');
        onSave(dataUrl, name);
      } else {
        onSave('', name);
      }
    } else {
      // Type signature mode: render name into a canvas to generate a signature image
      if (!name.trim()) {
        onSave('', '');
        onClose();
        return;
      }
      const offscreen = document.createElement('canvas');
      offscreen.width = 400;
      offscreen.height = 120;
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.font = 'italic 34px "Brush Script MT", "Caveat", "Segoe Script", cursive, Georgia, serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, 20, 60);
        // Add subtle stylized flourish underline
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#2563eb';
        ctx.beginPath();
        ctx.moveTo(15, 85);
        ctx.bezierCurveTo(80, 75, 200, 95, 340, 80);
        ctx.stroke();
        onSave(offscreen.toDataURL('image/png'), name);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 text-sm">{title}</h3>
              <p className="text-xs text-zinc-500">Signoff authorization for Area 308</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Signer Name Input */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
              Signee Full Name / Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ir. Clement Wong / Ahmad Firdaus"
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Mode Switch */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
              Signature Method
            </span>
            <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 bg-zinc-100">
              <button
                type="button"
                onClick={() => setMode('draw')}
                className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                  mode === 'draw'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                Draw (Mouse / Finger)
              </button>
              <button
                type="button"
                onClick={() => setMode('type')}
                className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                  mode === 'type'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                Type Script
              </button>
            </div>
          </div>

          {mode === 'draw' ? (
            <div className="space-y-2">
              <div className="relative border-2 border-dashed border-zinc-300 rounded-lg bg-zinc-50 overflow-hidden select-none touch-none">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-44 cursor-crosshair block"
                />
                {!hasDrawn && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-zinc-400 text-xs font-medium">
                    Sign inside this box (touch or mouse)
                  </div>
                )}
                <div className="absolute bottom-2 left-4 text-[10px] text-zinc-400 pointer-events-none">
                  ✕ Sign on the line
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium px-2 py-1 rounded-sm hover:bg-red-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear Pad
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-6 border border-zinc-200 rounded-lg bg-zinc-50 flex items-center justify-center min-h-[140px]">
                {name.trim() ? (
                  <div className="text-3xl italic tracking-wide text-zinc-900 font-serif border-b-2 border-blue-500 pb-2 px-4">
                    {name}
                  </div>
                ) : (
                  <div className="text-zinc-400 text-xs italic">
                    Type a name above to generate stylized signature
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 bg-zinc-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Apply Signature
          </button>
        </div>
      </div>
    </div>
  );
};
