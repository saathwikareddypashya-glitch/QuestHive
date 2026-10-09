import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Category } from '../../types';

export default function CategoryCard({ category, count }: { category: Category; count?: number }) {
  return (
    <Link to={`/explore?category=${category.id}`} className="category-card">
      <span className="cat-emoji" aria-hidden>{category.emoji}</span>
      <span className="cat-text">
        <strong>{category.shortName}</strong>
        <small>{count !== undefined ? `${count} teachers` : `${category.subjects.length} subjects`}</small>
      </span>
      <ArrowUpRight size={18} className="cat-arrow" aria-hidden />
    </Link>
  );
}
