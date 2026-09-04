import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '../../store/eventStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Role } from '../../types';

export function Login() {
  const { setRole } = useEventStore();
  const navigate = useNavigate();

  const handleLogin = (selectedRole: Role) => {
    setRole(selectedRole);
    if (selectedRole === "RECEPCIONISTA") {
      navigate('/reception');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 uppercase mb-2">Smart Guest Control</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Selecciona tu rol para ingresar al sistema (Demo)</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Acceso de Personal</CardTitle>
          <CardDescription>Eventos Premium SaaS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full justify-start h-12" variant="outline" onClick={() => handleLogin("ADMINISTRADOR")}>
            <div className="flex flex-col items-start">
              <span>ADMINISTRADOR</span>
              <span className="text-xs text-zinc-500 font-normal">Acceso total al dashboard y mapas</span>
            </div>
          </Button>
          
          <Button className="w-full justify-start h-12" variant="outline" onClick={() => handleLogin("HOST")}>
            <div className="flex flex-col items-start">
              <span>HOST</span>
              <span className="text-xs text-zinc-500 font-normal">Gestión de evento</span>
            </div>
          </Button>

          <Button className="w-full justify-start h-12 border-zinc-900 dark:border-zinc-50" onClick={() => handleLogin("RECEPCIONISTA")}>
             <div className="flex flex-col items-start">
              <span>RECEPCIONISTA</span>
              <span className="text-xs font-normal opacity-80">Escáner móvil y Check-in</span>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
