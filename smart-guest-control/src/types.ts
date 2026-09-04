export type Role = "ADMINISTRADOR" | "HOST" | "RECEPCIONISTA" | "COORDINADOR" | "STAFF";

export type GuestProfile = "VIP" | "FAMILIA" | "AMIGO" | "PAREJA" | "EMPRESA" | "PROVEEDOR" | "PRENSA" | "STAFF" | "INVITADO ESPECIAL" | "REGULAR";

export type GuestStatus = "PENDIENTE" | "CONFIRMADO" | "CANCELADO";
export type EntryStatus = "NO_INGRESADO" | "INGRESADO";

export interface Companion {
  id: string;
  name: string;
  entryStatus: EntryStatus;
  entryTime?: string;
}

export interface Guest {
  id: string;
  qrCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  photoUrl?: string;
  profile: GuestProfile;
  companionsCount: number;
  companions: Companion[];
  groupId?: string; // For families/couples
  groupName?: string;
  tableId?: string;
  seatIds?: string[];
  zone?: string;
  restrictions?: string;
  status: GuestStatus;
  entryStatus: EntryStatus;
  entryTime?: string;
  registeredBy?: string; // Name of the receptionist
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  zone: string;
  x?: number;
  y?: number;
}

export interface Zone {
  id: string;
  name: string;
  color: string;
}

export interface EventStats {
  totalGuests: number;
  confirmed: number;
  entered: number;
  pending: number;
  totalTables: number;
  totalSeats: number;
  tablesOccupied: number;
  tablesAvailable: number;
}
