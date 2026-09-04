import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Guest, Table, Zone, EventStats, Role } from "../types";

// Mock Data Initial State
const MOCK_ZONES: Zone[] = [
  { id: "z1", name: "VIP", color: "bg-amber-500" },
  { id: "z2", name: "FAMILIAR", color: "bg-blue-500" },
  { id: "z3", name: "AMIGOS", color: "bg-emerald-500" },
  { id: "z4", name: "EMPRESARIAL", color: "bg-indigo-500" },
];

const MOCK_TABLES: Table[] = [
  { id: "t1", number: "1", capacity: 8, zone: "VIP", x: 100, y: 100 },
  { id: "t2", number: "2", capacity: 8, zone: "VIP", x: 300, y: 100 },
  { id: "t8", number: "8", capacity: 10, zone: "FAMILIAR", x: 100, y: 300 },
  { id: "t12", number: "12", capacity: 8, zone: "AMIGOS", x: 300, y: 300 },
];

const MOCK_GUESTS: Guest[] = [
  {
    id: "g1",
    qrCode: "QR-12345",
    firstName: "Juan",
    lastName: "Pérez",
    fullName: "Juan Pérez",
    profile: "VIP",
    companionsCount: 2,
    companions: [
      { id: "c1", name: "Laura Pérez", entryStatus: "NO_INGRESADO" },
      { id: "c2", name: "Diego Pérez", entryStatus: "NO_INGRESADO" }
    ],
    tableId: "t12",
    seatIds: ["A1", "A2", "A3"],
    zone: "VIP",
    status: "CONFIRMADO",
    entryStatus: "NO_INGRESADO"
  },
  {
    id: "g2",
    qrCode: "QR-FAM-GONZALEZ",
    firstName: "Roberto",
    lastName: "González",
    fullName: "Familia González",
    profile: "FAMILIA",
    groupId: "fam1",
    groupName: "Familia González",
    companionsCount: 5,
    companions: [
      { id: "c3", name: "María González", entryStatus: "NO_INGRESADO" },
      { id: "c4", name: "Ana González", entryStatus: "NO_INGRESADO" },
      { id: "c5", name: "Luis González", entryStatus: "NO_INGRESADO" },
      { id: "c6", name: "Pedro González", entryStatus: "NO_INGRESADO" },
      { id: "c7", name: "Sofía González", entryStatus: "NO_INGRESADO" },
    ],
    tableId: "t8",
    seatIds: ["1", "2", "3", "4", "5", "6"],
    zone: "FAMILIAR",
    status: "CONFIRMADO",
    entryStatus: "NO_INGRESADO"
  },
  {
    id: "g3",
    qrCode: "QR-CARLOS-ANA",
    firstName: "Carlos",
    lastName: "Ruiz",
    fullName: "Carlos Ruiz",
    profile: "PAREJA",
    companionsCount: 1,
    companions: [
      { id: "c8", name: "Ana López", entryStatus: "NO_INGRESADO" }
    ],
    tableId: "t12",
    seatIds: ["3", "4"],
    zone: "AMIGOS",
    status: "CONFIRMADO",
    entryStatus: "INGRESADO",
    entryTime: "8:42 PM",
    registeredBy: "María"
  },
  {
    id: "g4",
    qrCode: "QR-INV-VIP-1",
    firstName: "Elena",
    lastName: "García",
    fullName: "Elena García",
    profile: "INVITADO ESPECIAL",
    companionsCount: 0,
    companions: [],
    tableId: "t1",
    seatIds: ["1"],
    zone: "VIP",
    status: "CONFIRMADO",
    entryStatus: "NO_INGRESADO"
  },
  {
    id: "g5",
    qrCode: "QR-CANCELLED",
    firstName: "Mario",
    lastName: "Vargas",
    fullName: "Mario Vargas",
    profile: "REGULAR",
    companionsCount: 0,
    companions: [],
    status: "CANCELADO",
    entryStatus: "NO_INGRESADO"
  }
];

interface EventState {
  role: Role;
  setRole: (role: Role) => void;
  currentUser: string;
  guests: Guest[];
  tables: Table[];
  zones: Zone[];
  
  // Actions
  checkInGuest: (guestId: string, receptionistName: string) => void;
  updateGuestTable: (guestId: string, tableId: string, seatIds: string[]) => void;
  addTable: (table: Table) => void;
  removeTable: (tableId: string) => void;
  updateTablePosition: (tableId: string, x: number, y: number) => void;
  addZone: (zone: Zone) => void;
  addGuest: (guest: Guest) => void;
  updateGuest: (guestId: string, updates: Partial<Guest>) => void;
  removeGuest: (guestId: string) => void;
  
  // Selectors/Getters
  getStats: () => EventStats;
  findGuestByQR: (qr: string) => Guest | undefined;
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
  role: "RECEPCIONISTA", // Default for testing reception view quickly
  setRole: (role) => set({ role }),
  currentUser: "María",
  guests: MOCK_GUESTS,
  tables: MOCK_TABLES,
  zones: MOCK_ZONES,

  checkInGuest: (guestId, receptionistName) => set((state) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      guests: state.guests.map(g => 
        g.id === guestId 
          ? { ...g, entryStatus: "INGRESADO", entryTime: timeString, registeredBy: receptionistName } 
          : g
      )
    };
  }),

  updateGuestTable: (guestId, tableId, seatIds) => set((state) => ({
    guests: state.guests.map(g => 
      g.id === guestId ? { ...g, tableId, seatIds } : g
    )
  })),
  
  addTable: (table) => set((state) => ({ tables: [...state.tables, table] })),
  
  removeTable: (tableId) => set((state) => ({ tables: state.tables.filter(t => t.id !== tableId) })),

  updateTablePosition: (tableId, x, y) => set((state) => ({
    tables: state.tables.map(t => t.id === tableId ? { ...t, x, y } : t)
  })),

  addZone: (zone) => set((state) => ({ zones: [...state.zones, zone] })),

  addGuest: (guest) => set((state) => ({ guests: [...state.guests, guest] })),
  removeGuest: (guestId) => set((state) => ({ guests: state.guests.filter(g => g.id !== guestId) })),
  updateGuest: (guestId, updates) => set((state) => ({
    guests: state.guests.map(g => g.id === guestId ? { ...g, ...updates } : g)
  })),

  getStats: () => {
    const { guests, tables } = get();
    const totalGuests = guests.reduce((acc, g) => acc + 1 + g.companionsCount, 0);
    const confirmed = guests.filter(g => g.status === "CONFIRMADO").reduce((acc, g) => acc + 1 + g.companionsCount, 0);
    const entered = guests.filter(g => g.entryStatus === "INGRESADO").reduce((acc, g) => acc + 1 + g.companionsCount, 0);
    const pending = confirmed - entered;
    
    const totalTables = tables.length;
    const totalSeats = tables.reduce((acc, t) => acc + t.capacity, 0);
    
    // Simplification for tables occupied (at least one person assigned)
    const tablesOccupied = new Set(guests.filter(g => g.tableId).map(g => g.tableId)).size;
    
    return {
      totalGuests,
      confirmed,
      entered,
      pending,
      totalTables,
      totalSeats,
      tablesOccupied,
      tablesAvailable: totalTables - tablesOccupied
    };
  },
  
  findGuestByQR: (qr) => {
    return get().guests.find(g => g.qrCode === qr);
  }
}),
  {
    name: "event-store",
  }
));
