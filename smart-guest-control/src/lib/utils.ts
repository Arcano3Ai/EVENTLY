import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { GuestProfile } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getProfileColor(profile: GuestProfile) {
  switch (profile) {
    case 'VIP':
    case 'INVITADO ESPECIAL':
      return 'bg-amber-500 text-amber-950';
    case 'FAMILIA':
      return 'bg-blue-500 text-white';
    case 'PAREJA':
    case 'AMIGO':
      return 'bg-emerald-500 text-white';
    case 'EMPRESA':
    case 'PROVEEDOR':
      return 'bg-indigo-500 text-white';
    case 'PRENSA':
      return 'bg-purple-500 text-white';
    case 'STAFF':
      return 'bg-zinc-800 text-white border-zinc-700';
    default:
      return 'bg-zinc-500 text-white';
  }
}

export function getZoneColor(zoneName: string | undefined) {
  if (!zoneName) return 'bg-zinc-500';
  const name = zoneName.toUpperCase();
  if (name.includes('VIP')) return 'bg-amber-500';
  if (name.includes('FAMILIAR')) return 'bg-blue-500';
  if (name.includes('AMIGOS')) return 'bg-emerald-500';
  if (name.includes('EMPRESA')) return 'bg-indigo-500';
  return 'bg-zinc-500';
}
