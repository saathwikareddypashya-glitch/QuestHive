import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · QuestHive` : 'QuestHive — Find a skill. Find your person.';
  }, [title]);
}
