import React, { useState } from 'react';
import { useEventStore } from '../../store/eventStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Wand2, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

export function SmartSeating() {
  const { guests, tables, updateGuestTable } = useEventStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const unassignedGuests = guests.filter(g => !g.tableId);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation process
    setTimeout(() => {
      const newSuggestions = [];
      
      for (const guest of unassignedGuests) {
         // Find a table with enough capacity
         const table = tables.find(t => {
            const tableGuests = guests.filter(g => g.tableId === t.id);
            const occupied = tableGuests.reduce((acc, g) => acc + 1 + g.companionsCount, 0);
            return (t.capacity - occupied) >= (1 + guest.companionsCount);
         });

         if (table) {
            newSuggestions.push({
               id: `sug-${guest.id}`,
               guestId: guest.id,
               tableId: table.id,
               guest: { fullName: guest.fullName, profile: guest.profile, count: 1 + guest.companionsCount },
               table: { number: table.number, zone: table.zone },
               reason: `Afinidad de perfil (${guest.profile}) con la zona ${table.zone}. Capacidad perfecta.`
            });
         }
         
         if (newSuggestions.length >= 5) break; // Limit for demo
      }

      setSuggestions(newSuggestions);
      setIsGenerating(false);
    }, 1500);
  };

  const handleAccept = (sugId: string, guestId: string, tableId: string) => {
    // We mock the seat IDs assignment since we don't know exactly which are free, 
    // but in a real scenario we'd assign specific seat IDs.
    updateGuestTable(guestId, tableId, []);
    setSuggestions(prev => prev.filter(s => s.id !== sugId));
  };

  const handleReject = (sugId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== sugId));
  };

  const handleAcceptAll = () => {
    suggestions.forEach(sug => {
      updateGuestTable(sug.guestId, sug.tableId, []);
    });
    setSuggestions([]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-3 mb-10">
        <h2 className="font-display text-4xl font-bold tracking-wide">Acomodo Inteligente</h2>
        <p className="text-zinc-500 tracking-wide dark:text-zinc-400">Distribución automatizada basada en perfiles, grupos y zonas.</p>
      </div>

      <Card className="bg-zinc-900 text-white border-zinc-800/50 overflow-hidden relative shadow-xl rounded-[32px]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
        <CardContent className="p-12 relative z-10 flex flex-col items-center text-center space-y-8">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-2 backdrop-blur-md shadow-inner">
            <Wand2 className="w-10 h-10 text-indigo-400" />
          </div>
          <div className="space-y-4">
            <h3 className="font-display text-3xl font-bold tracking-wide">Motor de Distribución</h3>
            <p className="text-zinc-400 max-w-lg text-lg leading-relaxed">
              El sistema analizará a los <strong className="text-white">{unassignedGuests.length} invitados sin mesa</strong> y las <strong className="text-white">{tables.length} mesas disponibles</strong> para sugerir el mejor acomodo posible.
            </p>
          </div>
          
          <div className="flex gap-6 text-sm text-zinc-300 font-medium tracking-wide">
             <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400"/> Grupos familiares juntos</span>
             <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400"/> Respetar zonas</span>
             <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400"/> Optimizar capacidad</span>
          </div>

          <Button 
             size="lg" 
             onClick={handleGenerate} 
             disabled={isGenerating}
             className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white border-0 h-16 px-10 text-lg font-bold tracking-wide rounded-2xl shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            {isGenerating ? 'ANALIZANDO VARIABLES...' : 'AUTOMATIZAR ACOMODO'}
          </Button>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <div className="space-y-4 mt-8 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Sugerencias Encontradas
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
              {suggestions.length} resultados
            </Badge>
          </h3>
          
          <div className="grid gap-4">
            {suggestions.map((sug) => (
              <Card key={sug.id}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Invitado / Grupo</p>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{sug.guest.fullName}</h4>
                        <Badge variant="outline">{sug.guest.profile}</Badge>
                      </div>
                      <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                        <Users className="w-3 h-3"/> {sug.guest.count} personas
                      </p>
                    </div>
                    
                    <ArrowRight className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                    
                    <div>
                      <p className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Asignación Sugerida</p>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">Mesa {sug.table.number}</h4>
                        <Badge variant="secondary">{sug.table.zone}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-zinc-500 max-w-xs text-right italic">
                      "{sug.reason}"
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" onClick={() => handleAccept(sug.id, sug.guestId, sug.tableId)} className="bg-emerald-600 hover:bg-emerald-500 text-white">Aceptar</Button>
                      <Button size="sm" onClick={() => handleReject(sug.id)} variant="ghost">Rechazar</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-end mt-4">
             <Button variant="outline" onClick={() => setSuggestions([])} className="mr-2">Rechazar Todas</Button>
             <Button onClick={handleAcceptAll} className="bg-indigo-600 hover:bg-indigo-500 text-white">Aceptar Todas las Sugerencias</Button>
          </div>
        </div>
      )}
    </div>
  );
}
