import React, { useState } from 'react';
import { useEventStore } from '../../store/eventStore';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus, Users, Armchair, X } from 'lucide-react';
import { cn, getProfileColor } from '../../lib/utils';
import { GuestProfile, Zone, Table } from '../../types';
import { Input } from '../../components/ui/input';

const ZONE_COLORS = [
  'bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-indigo-500',
  'bg-purple-500', 'bg-pink-500', 'bg-red-500', 'bg-orange-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-zinc-500'
];

export function TableMap() {
  const { tables, zones, guests, addZone, addTable, updateTablePosition } = useEventStore();
  
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneColor, setNewZoneColor] = useState(ZONE_COLORS[0]);

  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  const [newTableCap, setNewTableCap] = useState(8);
  const [newTableZone, setNewTableZone] = useState('');

  const [draggingTable, setDraggingTable] = useState<string | null>(null);
  const mapRef = React.useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, tableId: string) => {
     setDraggingTable(tableId);
     (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
     if (!draggingTable || !mapRef.current) return;
     const rect = mapRef.current.getBoundingClientRect();
     // w-40 is 160px. Center is 80px.
     let x = e.clientX - rect.left - 80;
     let y = e.clientY - rect.top - 80;
     
     // basic boundaries
     x = Math.max(0, Math.min(x, rect.width - 160));
     y = Math.max(0, Math.min(y, rect.height - 160));

     updateTablePosition(draggingTable, x, y);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
     if (draggingTable) {
        setDraggingTable(null);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
     }
  };

  const handleAddZone = () => {
    if (!newZoneName) return;
    const newZone: Zone = {
      id: `z-${Date.now()}`,
      name: newZoneName.toUpperCase(),
      color: newZoneColor
    };
    addZone(newZone);
    setNewZoneName('');
    setIsAddingZone(false);
  };

  const handleAddTable = () => {
    if (!newTableNum || !newTableZone) return;
    const newTable: Table = {
      id: `t-${Date.now()}`,
      number: newTableNum,
      capacity: newTableCap,
      zone: newTableZone,
      x: 200 + Math.random() * 100, // Basic random placement in center
      y: 200 + Math.random() * 100
    };
    addTable(newTable);
    setNewTableNum('');
    setNewTableCap(8);
    setNewTableZone('');
    setIsAddingTable(false);
  };

  const profiles: GuestProfile[] = ['VIP', 'FAMILIA', 'PAREJA', 'EMPRESA', 'STAFF', 'AMIGO'];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-wide">Mapa de Mesas</h2>
          <p className="text-sm text-zinc-500 mt-2 tracking-wide dark:text-zinc-400">Distribución visual y asignación por colores</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="rounded-xl px-6" onClick={() => setIsAddingZone(true)}><Plus className="w-4 h-4 mr-2"/> Nueva Zona</Button>
           <Button className="rounded-xl px-6" onClick={() => setIsAddingTable(true)}><Plus className="w-4 h-4 mr-2"/> Nueva Mesa</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Zones Legend */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Zonas del Evento</p>
          <div className="flex flex-wrap gap-4">
            {zones.map(z => (
              <div key={z.id} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                 <div className={`w-3 h-3 rounded-full ${z.color}`} />
                 {z.name}
              </div>
            ))}
          </div>
        </div>

        {/* Profiles Legend */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Perfiles de Invitados (Asientos)</p>
          <div className="flex flex-wrap gap-4">
            {profiles.map(p => (
              <div key={p} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                 <div className={cn("w-3 h-3 rounded-full", getProfileColor(p))} />
                 <span className="capitalize">{p.toLowerCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Card 
        ref={mapRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="flex-1 min-h-[600px] bg-zinc-50 dark:bg-zinc-900/50 relative overflow-hidden p-8 border-2 border-dashed touch-none"
      >
         <div className="absolute inset-0 grid grid-cols-12 gap-8 p-8 opacity-20 pointer-events-none">
            {Array.from({ length: 144 }).map((_, i) => (
               <div key={i} className="border border-zinc-300 dark:border-zinc-700 rounded-sm" />
            ))}
         </div>

         {/* Draggable Tables Mock */}
         {tables.map(table => {
            const tableGuests = guests.filter(g => g.tableId === table.id);
            // Flatten guests + companions to assign them linearly to seats for visualization
            const occupants = tableGuests.flatMap(g => 
              [ { name: g.fullName, profile: g.profile }, ...g.companions.map(c => ({ name: c.name, profile: g.profile })) ]
            );
            
            const occupiedSeats = occupants.length;
            const zone = zones.find(z => z.name === table.zone);
            
            return (
              <div 
                key={table.id}
                onPointerDown={(e) => handlePointerDown(e, table.id)}
                className={cn("absolute w-40 h-40 flex flex-col items-center justify-center cursor-move transition-all duration-300 group select-none", draggingTable === table.id ? 'scale-105 z-50' : '')}
                style={{ 
                  left: `${table.x}px`, 
                  top: `${table.y}px`
                }}
              >
                 {/* 3D Table Base */}
                 <div 
                   className={cn(
                     "absolute inset-0 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-[#0c0c0e] backdrop-blur-md transition-all duration-300",
                     draggingTable === table.id 
                        ? "shadow-[0_12px_0_0_rgba(228,228,231,1),0_30px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_0_0_rgba(39,39,42,1),0_30px_40px_rgba(0,0,0,0.6)]" 
                        : "shadow-[0_8px_0_0_rgba(228,228,231,1),0_15px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_0_0_rgba(39,39,42,1),0_15px_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_10px_0_0_rgba(228,228,231,1),0_20px_25px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_10px_0_0_rgba(39,39,42,1),0_20px_25px_rgba(0,0,0,0.5)] group-hover:-translate-y-1"
                   )}
                   style={{
                      borderColor: zone?.color ? 'var(--tw-colors-current)' : '#e5e7eb', // Just a fallback, we use actual border class in reality but dynamic color is nice. Wait, zone?.color is a tailwind class.
                   }}
                 >
                    {/* Inner elegant ring */}
                    <div className="absolute inset-1.5 rounded-full border border-zinc-100 dark:border-zinc-900/50" />
                    {/* Zone color tint */}
                    <div className={cn("absolute inset-2 rounded-full opacity-10", zone?.color)} />
                 </div>

                 {/* Center Info (capacity) */}
                 <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-3 flex items-center gap-1 text-[10px] font-bold text-zinc-500 bg-zinc-100/80 dark:bg-zinc-900/80 px-2 py-0.5 rounded-full backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 z-10 transition-transform group-hover:scale-105 pointer-events-none">
                    <Armchair className="w-3 h-3" />
                    <span>{occupiedSeats}/{table.capacity}</span>
                 </div>

                 {/* 3D Pennant Pole & Flag */}
                 <div className={cn(
                   "absolute top-1/2 left-1/2 flex flex-col items-center z-30 transition-transform duration-300 origin-bottom pointer-events-none",
                   draggingTable === table.id 
                     ? "-translate-x-1/2 -translate-y-[85%]" 
                     : "-translate-x-1/2 -translate-y-[75%] group-hover:-translate-y-[80%]"
                 )}>
                    {/* Flag/Pennant */}
                    <div className="relative flex items-center justify-center h-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 pr-4 pl-3 rounded-l-md shadow-xl translate-x-3">
                       <span className="font-display font-black text-xl tracking-wider leading-none">{table.number}</span>
                       {/* Pennant tail cutout (CSS triangle) */}
                       <div className="absolute -right-[14px] top-0 w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-l-[14px] border-l-zinc-900 dark:border-l-white"></div>
                    </div>
                    {/* Pole */}
                    <div className="w-1.5 h-16 bg-gradient-to-b from-zinc-300 to-zinc-500 dark:from-zinc-500 dark:to-zinc-700 shadow-sm rounded-full -mt-2 border border-zinc-400/20"></div>
                    {/* Pole Base / Stand */}
                    <div className="w-6 h-3 bg-zinc-200 dark:bg-zinc-800 rounded-[100%] shadow-inner -mt-1.5 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                       <div className="w-2 h-1 bg-zinc-400 dark:bg-zinc-600 rounded-[100%]"></div>
                    </div>
                 </div>

                 {/* Seats visualization around table */}
                 {Array.from({ length: table.capacity }).map((_, i) => {
                    const angle = (i * 360) / table.capacity;
                    const radius = 88; // Half width + padding
                    const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
                    const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;
                    
                    const occupant = occupants[i];
                    
                    // If seat is occupied, we use the profile color of the guest
                    // Otherwise, an empty state color
                    const seatStyle = occupant 
                      ? cn("bg-zinc-900 border-zinc-900 text-white cursor-pointer hover:ring-4 hover:ring-zinc-400/50 shadow-md", getProfileColor(occupant.profile).replace('text-', 'border-'))
                      : "bg-white border-zinc-300 text-zinc-400 dark:bg-zinc-950 dark:border-zinc-700 cursor-pointer hover:border-emerald-500 border-dashed hover:text-emerald-500";

                    return (
                       <div 
                         key={i}
                         title={occupant ? `${occupant.name} (${occupant.profile})` : 'Asiento Libre (Clic para asignar)'}
                         className={cn("absolute w-8 h-8 rounded-full border-2 -ml-4 -mt-4 flex items-center justify-center text-[10px] font-bold transition-all duration-200", seatStyle)}
                         style={{
                           left: `50%`,
                           top: `50%`,
                           transform: `translate(${x}px, ${y}px)`
                         }}
                       >
                         {i + 1}
                       </div>
                    )
                 })}
              </div>
            )
         })}
      </Card>

      {/* Add Zone Modal */}
      {isAddingZone && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-lg">Nueva Zona</h3>
              <button onClick={() => setIsAddingZone(false)}><X className="w-5 h-5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-500 mb-1">Nombre de la Zona</label>
                <Input value={newZoneName} onChange={e => setNewZoneName(e.target.value)} placeholder="Ej: LOUNGE VIP" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-500 mb-2">Color identificador</label>
                <div className="flex flex-wrap gap-3">
                  {ZONE_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewZoneColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 ring-offset-2 dark:ring-offset-zinc-950 transition-all", 
                        color, 
                        newZoneColor === color ? 'ring-2 ring-zinc-900 dark:ring-zinc-100 border-white dark:border-zinc-950' : 'border-transparent'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsAddingZone(false)}>Cancelar</Button>
              <Button onClick={handleAddZone} disabled={!newZoneName.trim()}>Guardar Zona</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Table Modal */}
      {isAddingTable && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-lg">Nueva Mesa</h3>
              <button onClick={() => setIsAddingTable(false)}><X className="w-5 h-5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-1">Número o Nombre</label>
                  <Input value={newTableNum} onChange={e => setNewTableNum(e.target.value)} placeholder="Ej: 14" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-1">Capacidad (Asientos)</label>
                  <Input type="number" min={1} max={20} value={newTableCap} onChange={e => setNewTableCap(parseInt(e.target.value) || 8)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-500 mb-2">Zona Asignada</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {zones.map(z => (
                    <button
                      key={z.id}
                      onClick={() => setNewTableZone(z.name)}
                      className={cn(
                        "flex items-center gap-2 p-2 border rounded-md text-sm text-left transition-colors", 
                        newTableZone === z.name ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 font-medium' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                      )}
                    >
                      <div className={cn("w-3 h-3 rounded-full shrink-0", z.color)} />
                      <span className="truncate">{z.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsAddingTable(false)}>Cancelar</Button>
              <Button onClick={handleAddTable} disabled={!newTableNum.trim() || !newTableZone}>Guardar Mesa</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
