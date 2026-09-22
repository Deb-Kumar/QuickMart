import React from 'react';
import { Category } from '../types';

interface CategoryBarProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  activeCategory,
  onSelectCategory
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
          <span>Shop by Category</span>
        </h2>
        <span className="text-xs font-semibold text-zinc-600">
          {categories.length} categories available
        </span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x">
        {/* "All Items" Category Card */}
        <button
          id="category-pill-all"
          onClick={() => onSelectCategory('all')}
          className={`shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer snap-start ${
            activeCategory === 'all'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20 scale-[1.02]'
              : 'bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-200/80 hover:border-zinc-300'
          }`}
        >
          <span className="text-base">🌟</span>
          <span>All Items</span>
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          return (
            <button
              id={`category-pill-${cat.slug}`}
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer snap-start ${
                isActive
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20 scale-[1.02]'
                  : 'bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-200/80 hover:border-zinc-300'
              }`}
            >
              <span className="text-base sm:text-lg">{cat.emoji}</span>
              <span className="whitespace-nowrap">{cat.name}</span>
              {typeof cat.itemCount === 'number' && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/25 text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {cat.itemCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
