import React, { useState, useEffect } from 'react';
import { useEventStore } from '../../store/eventStore';
import { Guest } from '../../types';
import { QrCode, CheckCircle2, AlertTriangle, XCircle, ArrowRight, UserCheck, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { cn, getProfileColor, getZoneColor } from '../../lib/utils';

type ScanState = 'IDLE' | 'SCANNING' | 'SUCCESS' | 'ALREADY_ENTERED' | 'INVALID';

export function ReceptionPanel() {
  const { findGuestByQR, checkInGuest, currentUser, zones } = useEventStore();
  const [scanState, setScanState] = useState<ScanState>('IDLE');
  const [scannedGuest, setScannedGuest] = useState<Guest | null>(null);

  const getDynamicZoneColor = (zoneName?: string) => {
    if (!zoneName) return 'bg-zinc-500';
    const foundZone = zones.find(z => z.name.toLowerCase() === zoneName.toLowerCase());
    return foundZone ? foundZone.color : getZoneColor(zoneName);
  };

  // Auto-focus input trick for real USB scanners (they act as keyboards)
  const [qrInput, setQrInput] = useState('');

  // Handle mock scans and real scans
  const handleScan = (qr: string) => {
    setScanState('SCANNING');
    
    // Simulate network delay
    setTimeout(() => {
      const guest = findGuestByQR(qr);
      if (!guest) {
        setScanState('INVALID');
        setScannedGuest(null);
        return;
      }

      setScannedGuest(guest);
      
      if (guest.entryStatus === 'INGRESADO') {
        setScanState('ALREADY_ENTERED');
      } else {
        setScanState('SUCCESS');
      }
    }, 600);
  };

  useEffect(() => {
    let buffer = '';
    let timeout: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field (though there shouldn't be one on this screen)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter') {
        if (buffer.length > 3) {
          handleScan(buffer);
        }
        buffer = '';
        if (timeout) clearTimeout(timeout);
        return;
      }

      // Add alphanumeric and dash characters to buffer
      if (e.key.length === 1) {
        buffer += e.key;
        
        // Reset buffer if typing is too slow (human typing vs scanner)
        // Scanners type very fast, usually < 50ms per keystroke
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          buffer = '';
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [findGuestByQR]);

  const handleCheckIn = () => {
    if (scannedGuest) {
      checkInGuest(scannedGuest.id, currentUser);
      setScanState('IDLE');
      setScannedGuest(null);
    }
  };

  const resetScanner = () => {
    setScanState('IDLE');
    setScannedGuest(null);
  };

  if (scanState === 'IDLE') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
         <div className="w-64 h-64 border-2 border-dashed border-zinc-700 rounded-3xl flex items-center justify-center bg-zinc-900/50 relative overflow-hidden group">
            <QrCode className="w-24 h-24 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent h-full animate-[scan_2s_ease-in-out_infinite]" />
         </div>
         
         <h2 className="text-2xl font-bold tracking-tight text-center">ESPERANDO ESCANEO</h2>
         <p className="text-zinc-500 text-center text-sm">Presenta el código QR del invitado frente a la cámara</p>

         {/* Development tools to simulate scanning */}
         <div className="fixed bottom-6 left-6 right-6 flex flex-col gap-2 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
            <span className="text-xs text-zinc-500 text-center font-mono uppercase tracking-widest mb-2">Simulador de Escaneo</span>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => handleScan('QR-12345')} className="border-zinc-700 text-zinc-300">QR Válido (Familia)</Button>
              <Button size="sm" variant="outline" onClick={() => handleScan('QR-INV-VIP-1')} className="border-zinc-700 text-zinc-300">QR VIP</Button>
              <Button size="sm" variant="outline" onClick={() => handleScan('QR-CARLOS-ANA')} className="border-zinc-700 text-amber-500">QR Ya Registrado</Button>
              <Button size="sm" variant="outline" onClick={() => handleScan('INVALID-123')} className="border-zinc-700 text-red-500">QR Inválido</Button>
            </div>
         </div>
      </div>
    );
  }

  if (scanState === 'SCANNING') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin" />
        <h2 className="mt-6 text-xl font-medium text-zinc-400">Identificando...</h2>
      </div>
    );
  }

  if (scanState === 'SUCCESS' && scannedGuest) {
    return (
      <div className="flex-1 flex flex-col p-4 sm:p-6 bg-emerald-950/20 dark:bg-emerald-950/20 bg-emerald-50">
         <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-6">
            
            <div className="w-full bg-white dark:bg-[#0c0c0e] border border-emerald-500/30 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />
              
              <div className="flex flex-col items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-8 text-center">
                <CheckCircle2 className="w-16 h-16 mb-2" />
                <h2 className="font-display text-3xl font-black tracking-wide">ACCESO AUTORIZADO</h2>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mb-2">Invitado Principal</p>
                  <p className="font-display text-4xl font-bold text-zinc-900 dark:text-white leading-tight">{scannedGuest.fullName}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="text-center">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mb-2">Perfil</p>
                    <div className={cn("inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase", getProfileColor(scannedGuest.profile))}>
                       {scannedGuest.profile}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mb-2">Pases extra</p>
                    <p className="font-display text-3xl font-bold text-zinc-900 dark:text-white">+{scannedGuest.companionsCount}</p>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 mt-6 shadow-inner">
                  <div className={cn("h-4 w-full", getDynamicZoneColor(scannedGuest.zone))} />
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 items-center">
                       <div>
                         <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mb-2">Mesa</p>
                         <p className="font-display text-6xl font-black text-zinc-900 dark:text-white">{scannedGuest.tableId ? scannedGuest.tableId.replace('t', '') : 'N/A'}</p>
                       </div>
                       <div className="flex flex-col items-end justify-center">
                         {scannedGuest.tableId && (
                           <div className="flex items-center justify-center gap-2">
                              <MapPin className={cn("w-12 h-12", getDynamicZoneColor(scannedGuest.zone).replace('bg-', 'text-'))} />
                           </div>
                         )}
                       </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between">
                       <div>
                         <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mb-1">Zona</p>
                         <div className="flex items-center gap-2">
                           <div className={cn("w-4 h-4 rounded-full", getDynamicZoneColor(scannedGuest.zone))} />
                           <p className="text-lg font-bold text-zinc-900 dark:text-white uppercase">{scannedGuest.zone || 'General'}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mb-1">Asientos</p>
                         <p className="text-lg font-bold text-zinc-900 dark:text-white">{scannedGuest.seatIds?.join(', ') || 'N/A'}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full text-center space-y-4">
              <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">Instrucción Hostess</p>
              <div className={cn("inline-block px-8 py-4 rounded-full shadow-lg border", getDynamicZoneColor(scannedGuest.zone).replace('bg-', 'bg-').concat('/10'), getDynamicZoneColor(scannedGuest.zone).replace('bg-', 'border-').concat('/30'))}>
                <h1 className={cn("font-display text-2xl sm:text-3xl font-black uppercase tracking-wide", getDynamicZoneColor(scannedGuest.zone).replace('bg-', 'text-'))}>
                  DIRIGIR A MESA {scannedGuest.tableId ? scannedGuest.tableId.replace('t', '') : 'N/A'}
                </h1>
              </div>
            </div>

         </div>

         <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-4 mt-8 shrink-0">
            <Button size="lg" variant="outline" className="h-16 rounded-2xl text-lg font-bold tracking-wide border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white" onClick={resetScanner}>
               <XCircle className="w-6 h-6 mr-2" />
               CANCELAR
            </Button>
            <Button size="lg" className="h-16 rounded-2xl text-lg font-bold tracking-wide bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" onClick={handleCheckIn}>
               REGISTRAR
               <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
         </div>
      </div>
    );
  }

  if (scanState === 'ALREADY_ENTERED' && scannedGuest) {
    return (
       <div className="flex-1 flex flex-col items-center justify-center p-6 bg-amber-950/20">
         <div className="w-full max-w-md bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 text-center">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-amber-500 mb-2">INVITADO YA REGISTRADO</h2>
            <p className="text-zinc-300 text-lg mb-8">{scannedGuest.fullName}</p>
            
            <div className="bg-zinc-950 rounded-xl p-4 text-left border border-zinc-800 space-y-4 mb-8">
               <div>
                  <p className="text-sm text-zinc-500 uppercase tracking-wider">Hora de entrada</p>
                  <p className="text-xl font-medium text-white">{scannedGuest.entryTime}</p>
               </div>
               <div>
                  <p className="text-sm text-zinc-500 uppercase tracking-wider">Recepcionista</p>
                  <p className="text-xl font-medium text-white">{scannedGuest.registeredBy}</p>
               </div>
            </div>

            <Button size="lg" className="w-full h-14 bg-zinc-100 text-zinc-900" onClick={resetScanner}>
              Volver a escanear
            </Button>
         </div>
       </div>
    )
  }

  if (scanState === 'INVALID') {
    return (
       <div className="flex-1 flex flex-col items-center justify-center p-6 bg-red-950/20">
         <div className="w-full max-w-md bg-zinc-900 border border-red-500/30 rounded-2xl p-6 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-red-500 mb-2">QR INVÁLIDO</h2>
            <p className="text-zinc-400 mb-8">Este código no pertenece a ningún invitado registrado en este evento.</p>
            
            <Button size="lg" className="w-full h-14 bg-zinc-100 text-zinc-900" onClick={resetScanner}>
              Volver a escanear
            </Button>
         </div>
       </div>
    )
  }

  return null;
}
