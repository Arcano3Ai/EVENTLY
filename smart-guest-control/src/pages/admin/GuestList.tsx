import React, { useState } from 'react';
import { useEventStore } from '../../store/eventStore';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Search, UserCheck, AlertCircle, Users, CheckCircle2, X, Trash2, QrCode } from 'lucide-react';
import { cn, getProfileColor } from '../../lib/utils';
import { GuestProfile, Guest } from '../../types';
import QRCode from 'react-qr-code';

export function GuestList() {
  const { guests, addGuest, removeGuest } = useEventStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newProfile, setNewProfile] = useState<GuestProfile>('VIP');
  const [newCompanions, setNewCompanions] = useState(0);

  const [viewingQR, setViewingQR] = useState<Guest | null>(null);

  const filteredGuests = guests.filter(g => 
    g.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.profile.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddGuest = () => {
    if (!newFirstName || !newLastName) return;
    
    const newGuest: Guest = {
      id: `g-${Date.now()}`,
      firstName: newFirstName,
      lastName: newLastName,
      fullName: `${newFirstName} ${newLastName}`,
      profile: newProfile,
      status: 'CONFIRMADO',
      entryStatus: 'NO_INGRESADO',
      companionsCount: newCompanions,
      companions: Array.from({ length: newCompanions }).map((_, i) => ({
        id: `c-${Date.now()}-${i}`,
        name: `Acompañante ${i+1}`,
        entryStatus: 'NO_INGRESADO'
      })),
      qrCode: `QR${Math.floor(Math.random() * 90000) + 10000}`
    };
    
    addGuest(newGuest);
    setNewFirstName('');
    setNewLastName('');
    setNewProfile('VIP');
    setNewCompanions(0);
    setIsAddingGuest(false);
  };

  const PROFILES: GuestProfile[] = ['VIP', 'FAMILIA', 'PAREJA', 'EMPRESA', 'PROVEEDOR', 'PRENSA', 'STAFF', 'AMIGO'];

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-wide">Gestión de Invitados</h2>
          <p className="text-sm text-zinc-500 mt-2 tracking-wide dark:text-zinc-400">Directorio, perfiles y estado de acceso</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="rounded-xl px-6">Importar Lista</Button>
           <Button className="rounded-xl px-6" onClick={() => setIsAddingGuest(true)}>Agregar Invitado</Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Buscar por nombre, QR o perfil..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
             <Badge variant="outline">{guests.length} Totales</Badge>
          </div>
        </div>
        
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {filteredGuests.map(guest => (
            <div key={guest.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg", getProfileColor(guest.profile).replace('text-', 'text-').concat(' bg-opacity-20 dark:bg-opacity-20'), guest.entryStatus === 'INGRESADO' ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-950' : '')}>
                  {guest.firstName.charAt(0)}{guest.lastName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{guest.fullName}</h4>
                    {guest.entryStatus === 'INGRESADO' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                    <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{guest.qrCode}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3"/> +{guest.companionsCount}</span>
                    <span>•</span>
                    <span className={cn("text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold", getProfileColor(guest.profile))}>
                      {guest.profile}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                 <div className="text-right">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Ubicación</p>
                    <p className="font-medium text-sm">
                      {guest.tableId ? `Mesa ${guest.tableId.replace('t', '')}` : 'Sin asignar'}
                      {guest.seatIds && guest.seatIds.length > 0 && <span className="text-zinc-400 ml-1">({guest.seatIds.join(', ')})</span>}
                    </p>
                 </div>
                 
                 <div className="text-right w-32">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Estado</p>
                    {guest.entryStatus === 'INGRESADO' ? (
                      <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20">
                        INGRESADO {guest.entryTime}
                      </Badge>
                    ) : guest.status === 'CANCELADO' ? (
                      <Badge variant="destructive" className="bg-red-500/10 text-red-600 dark:text-red-400">CANCELADO</Badge>
                    ) : (
                      <Badge variant="secondary">PENDIENTE</Badge>
                    )}
                 </div>
                 
                 <div className="flex gap-2">
                   <Button variant="ghost" size="sm" onClick={() => setViewingQR(guest)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                     <QrCode className="w-4 h-4" />
                   </Button>
                   <Button variant="ghost" size="sm" onClick={() => removeGuest(guest.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 </div>
              </div>
            </div>
          ))}
          {filteredGuests.length === 0 && (
             <div className="p-8 text-center text-zinc-500">
               No se encontraron invitados.
             </div>
          )}
        </div>
      </Card>

      {/* Add Guest Modal */}
      {isAddingGuest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-lg">Nuevo Invitado</h3>
              <button onClick={() => setIsAddingGuest(false)}><X className="w-5 h-5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-1">Nombre</label>
                  <Input value={newFirstName} onChange={e => setNewFirstName(e.target.value)} placeholder="Ej: Juan" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-1">Apellidos</label>
                  <Input value={newLastName} onChange={e => setNewLastName(e.target.value)} placeholder="Ej: Pérez" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-500 mb-2">Perfil / Categoría</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {PROFILES.map(p => (
                    <button
                      key={p}
                      onClick={() => setNewProfile(p)}
                      className={cn(
                        "flex items-center gap-2 p-2 border rounded-md text-sm text-left transition-colors", 
                        newProfile === p ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 font-medium' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                      )}
                    >
                      <div className={cn("w-3 h-3 rounded-full shrink-0", getProfileColor(p))} />
                      <span className="truncate capitalize">{p.toLowerCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-500 mb-1">Pases Adicionales (Acompañantes)</label>
                <div className="flex items-center gap-4">
                  <Input type="range" min={0} max={10} value={newCompanions} onChange={e => setNewCompanions(parseInt(e.target.value))} className="flex-1" />
                  <span className="w-12 text-center font-bold text-lg">{newCompanions}</span>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsAddingGuest(false)}>Cancelar</Button>
              <Button onClick={handleAddGuest} disabled={!newFirstName.trim() || !newLastName.trim()}>Registrar Invitado</Button>
            </div>
          </Card>
        </div>
      )}

      {/* QR Code Modal */}
      {viewingQR && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setViewingQR(null)}>
          <Card className="w-full max-w-sm bg-white dark:bg-zinc-950 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-lg">Pase de Acceso</h3>
              <button onClick={() => setViewingQR(null)}><X className="w-5 h-5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white" /></button>
            </div>
            <div className="p-8 flex flex-col items-center space-y-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200">
                <QRCode value={viewingQR.qrCode} size={200} level="H" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-bold text-xl">{viewingQR.fullName}</p>
                <p className="text-zinc-500">{viewingQR.profile} • +{viewingQR.companionsCount} Acompañantes</p>
                <p className="text-sm font-mono mt-4 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full text-zinc-500 inline-block">{viewingQR.qrCode}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
