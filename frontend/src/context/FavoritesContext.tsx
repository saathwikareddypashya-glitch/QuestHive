import { createContext, useContext, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from './ToastContext';

interface Ctx {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string, name?: string) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<Ctx>(null as unknown as Ctx);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useLocalStorage<string[]>('qh_favorites', ['t2', 't7']);
  const { toast } = useToast();

  const isFavorite = (id: string) => favorites.includes(id);
  const toggleFavorite = (id: string, name?: string) => {
    const exists = favorites.includes(id);
    setFavorites(exists ? favorites.filter((f) => f !== id) : [...favorites, id]);
    toast(exists ? `Removed ${name ?? 'teacher'} from favorites` : `Saved ${name ?? 'teacher'} to favorites`, exists ? 'info' : 'success');
  };
  const clearFavorites = () => setFavorites([]);

  return <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, clearFavorites }}>{children}</FavoritesContext.Provider>;
}

export const useFavorites = () => useContext(FavoritesContext);
