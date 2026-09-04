import React from 'react';
import { useEventStore } from '../../store/eventStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, CheckCircle2, LogIn, Clock, Grid, Armchair, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Dashboard() {
  const { getStats, guests } = useEventStore();
  const stats = getStats();

  const percentageEntered = stats.totalGuests > 0 ? Math.round((stats.entered / stats.totalGuests) * 100) : 0;

  const recentEntries = guests
    .filter(g => g.entryStatus === 'INGRESADO')
    .sort((a, b) => {
      // Assuming entryTime is formatted like "8:42 PM", we'll just mock sort for now
      return -1;
    })
    .slice(0, 5);

  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="tracking-tight text-sm font-medium text-zinc-500 uppercase">{title}</p>
          <Icon className={cn("h-4 w-4 text-zinc-400", colorClass)} />
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-bold">{value}</span>
          {subtitle && <span className="text-xs text-zinc-500 mt-1">{subtitle}</span>}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard del Evento</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Resumen en tiempo real de asistencia y lugares.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Invitados" value={stats.totalGuests} icon={Users} />
        <StatCard title="Confirmados" value={stats.confirmed} icon={CheckCircle2} colorClass="text-blue-500" />
        <StatCard title="Ingresaron" value={stats.entered} icon={LogIn} colorClass="text-emerald-500" subtitle={`${percentageEntered}% del total`} />
        <StatCard title="Pendientes" value={stats.pending} icon={Clock} colorClass="text-amber-500" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Mesas Totales" value={stats.totalTables} icon={Grid} />
        <StatCard title="Asientos" value={stats.totalSeats} icon={Armchair} />
        <StatCard title="Mesas Ocupadas" value={stats.tablesOccupied} icon={Users} subtitle="Con al menos 1 invitado" />
        <StatCard title="Mesas Disponibles" value={stats.tablesAvailable} icon={CheckCircle2} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Últimos Accesos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEntries.map(guest => (
                <div key={guest.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                      {guest.firstName.charAt(0)}{guest.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{guest.fullName}</p>
                      <p className="text-xs text-zinc-500">{guest.profile} • {guest.companionsCount} acompañantes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-emerald-600 dark:text-emerald-400">{guest.entryTime}</p>
                    <p className="text-xs text-zinc-500">Mesa {guest.tableId?.replace('t', '')}</p>
                  </div>
                </div>
              ))}
              {recentEntries.length === 0 && (
                <div className="text-center text-zinc-500 py-4 text-sm">No hay ingresos registrados aún.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Alertas del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock alerts for realism */}
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-100 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-sm">
                <div className="mt-0.5"><Users className="w-4 h-4" /></div>
                <div>
                  <p className="font-medium">Mesa 8 al máximo de capacidad</p>
                  <p className="text-xs opacity-80 mt-1">Familia González ha ocupado todos los lugares.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-100 dark:border-red-900/50 text-red-800 dark:text-red-300 text-sm">
                <div className="mt-0.5"><Clock className="w-4 h-4" /></div>
                <div>
                  <p className="font-medium">23 invitados VIP pendientes</p>
                  <p className="text-xs opacity-80 mt-1">Se recomienda preparar staff de recepción VIP.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
