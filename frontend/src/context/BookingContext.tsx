import { createContext, useContext, type ReactNode } from 'react';
import type { BookingDraft } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Ctx {
  draft: BookingDraft | null;
  setDraft: (d: BookingDraft) => void;
  clearDraft: () => void;
}

const BookingContext = createContext<Ctx>(null as unknown as Ctx);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useLocalStorage<BookingDraft | null>('qh_booking_draft', null);
  return (
    <BookingContext.Provider value={{ draft, setDraft: (d) => setDraftState(d), clearDraft: () => setDraftState(null) }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
