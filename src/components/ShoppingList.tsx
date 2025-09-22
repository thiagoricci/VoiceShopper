import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
}

interface ShoppingListProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  className?: string;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  onToggleItem,
  onRemoveItem,
  className
}) => {
  if (items.length === 0) {
    return (
      <Card className={cn("p-6 md:p-8 text-center shadow-card", className)}>
        <div className="text-muted-foreground text-lg">
          No items in your shopping list yet.
          <br />
          Use voice input to add items!
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-4 md:p-6 shadow-card", className)}>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg border transition-smooth animate-slide-up",
              item.completed 
                ? "bg-secondary/50 border-primary/20" 
                : "bg-background border-border hover:border-primary/30"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <button
              onClick={() => onToggleItem(item.id)}
              className="flex-shrink-0 transition-bounce p-2"
              aria-label={item.completed ? "Mark as not completed" : "Mark as completed"}
            >
              {item.completed ? (
                <CheckCircle2 className="w-6 h-6 text-primary animate-check-bounce" />
              ) : (
                <Circle className="w-6 h-6 text-muted-foreground hover:text-primary" />
              )}
            </button>
            
            <span
              className={cn(
                "flex-1 text-lg font-medium transition-smooth py-2",
                item.completed 
                  ? "text-muted-foreground line-through" 
                  : "text-foreground"
              )}
            >
              {item.name}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveItem(item.id)}
              className="flex-shrink-0 text-muted-foreground hover:text-destructive p-2"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t flex justify-between items-center text-sm text-muted-foreground">
        <span>
          {items.filter(item => item.completed).length} of {items.length} completed
        </span>
        <span>
          {items.length - items.filter(item => item.completed).length} remaining
        </span>
      </div>
    </Card>
  );
};
