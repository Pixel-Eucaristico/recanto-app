'use client';

interface CategoryCardProps {
  name: string;
  description?: string;
  count: number;
  icon: React.ReactNode;
  automatic?: boolean;
  onClick: () => void;
}

export function CategoryCard({ name, description, count, icon, automatic, onClick }: CategoryCardProps) {
  return (
    <button
      type="button"
      className="w-full text-left card bg-base-100 border border-base-300 hover:border-primary transition-colors"
      onClick={onClick}
    >
      <div className="card-body p-4 gap-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-base-content flex-1">{name}</span>
          {automatic && <span className="badge badge-ghost badge-xs">auto</span>}
          <span className="badge badge-ghost">{count}</span>
        </div>
        {description && <p className="text-xs text-base-content/60">{description}</p>}
      </div>
    </button>
  );
}
