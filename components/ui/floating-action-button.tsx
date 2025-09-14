import { useState } from 'react';
import { Plus, Search, Star, Settings, Download, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FABAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  className?: string;
}

export const defaultFABActions: FABAction[] = [
  {
    icon: Search,
    label: 'Quick Search',
    onClick: () => console.log('Quick search'),
    color: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    icon: Star,
    label: 'Add to Watchlist',
    onClick: () => console.log('Add to watchlist'),
    color: 'bg-yellow-600 hover:bg-yellow-700'
  },
  {
    icon: Download,
    label: 'Export Data',
    onClick: () => console.log('Export data'),
    color: 'bg-green-600 hover:bg-green-700'
  },
  {
    icon: Settings,
    label: 'Settings',
    onClick: () => console.log('Settings'),
    color: 'bg-gray-600 hover:bg-gray-700'
  }
];

export function FloatingActionButton({ actions, className }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Action buttons */}
      <div className={cn(
        "flex flex-col gap-3 mb-3 transition-all duration-300 ease-in-out",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={action.label}
              className="flex items-center gap-3"
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
              }}
            >
              <span className="bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-90">
                {action.label}
              </span>
              <Button
                size="sm"
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg transition-all duration-200",
                  action.color || "bg-gray-600 hover:bg-gray-700"
                )}
              >
                <Icon className="h-5 w-5" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Main FAB button */}
      <Button
        size="lg"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-300",
          isOpen && "rotate-45"
        )}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}