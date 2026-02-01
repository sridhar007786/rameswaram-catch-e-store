import { categories } from '@/data/products';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoryFilter = ({ selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => onSelectCategory(null)}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all',
          selectedCategory === null
            ? 'bg-primary text-primary-foreground shadow-ocean'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        )}
      >
        <span className="text-lg">🌊</span>
        All Products
      </button>
      
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all',
            selectedCategory === category.id
              ? 'bg-primary text-primary-foreground shadow-ocean'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          <span className="text-lg">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  );
};
