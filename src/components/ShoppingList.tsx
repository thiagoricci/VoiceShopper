import React from 'react';
import { Card } from '@/components/ui/card';
import {
  CheckCircle2,
  Circle,
  Trash2,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getItemCategory, CATEGORY_NAMES } from '@/data/groceryItems';

// Category color mapping for visual distinction
const CATEGORY_COLORS = {
  fruits: 'text-red-500 border-red-500',
  vegetables: 'text-green-600 border-green-600',
  proteins: 'text-amber-600 border-amber-600',
  dairy: 'text-blue-500 border-blue-500',
  grains: 'text-amber-800 border-amber-800',
  pantry: 'text-purple-500 border-purple-500',
  canned: 'text-gray-600 border-gray-600',
  beverages: 'text-cyan-500 border-cyan-500',
  frozen: 'text-teal-500 border-teal-500',
  snacks: 'text-pink-500 border-pink-500',
  household: 'text-stone-600 border-stone-600',
  personal: 'text-rose-400 border-rose-400',
  baby_pet: 'text-emerald-500 border-emerald-500',
  other: 'text-muted-foreground border-muted-foreground'
};

// Detailed item-specific emoji mapping
const CATEGORY_EMOJIS: Record<string, Record<string, string>> = {
  fruits: {
    apple: '🍎',
    bananas: '🍌',
    banana: '🍌',
    orange: '🍊',
    grapes: '🍇',
    watermelon: '🍉',
    strawberry: '🍓',
    pineapple: '🍍',
    mango: '🥭'
  },
  vegetables: {
    carrot: '🥕',
    broccoli: '🥦',
    corn: '🌽',
    cucumber: '🥒',
    tomato: '🍅',
    potato: '🥔',
    lettuce: '🥬',
    onion: '🧅',
    garlic: '🧄'
  },
  proteins: {
    chicken: '🍗',
    beef: '🥩',
    fish: '🐟',
    shrimp: '🦐',
    bacon: '🥓',
    eggs: '🥚',
    tofu: '🧆',
    beans: '🫘'
  },
  dairy: {
    milk: '🥛',
    cheese: '🧀',
    butter: '🧈',
    yogurt: '🍦',
    cream: '🍶'
  },
  grains: {
    bread: '🍞',
    rice: '🍚',
    pasta: '🍝',
    tortilla: '🌮',
    cereal: '🥣'
  },
  pantry: {
    sugar: '🧂',
    flour: '🌾',
    oil: '🫙',
    spices: '🌶️',
    honey: '🍯'
  },
  canned: {
    soup: '🥫',
    beans: '🫘',
    tuna: '🐟',
    tomatoes: '🍅'
  },
  beverages: {
    water: '💧',
    coffee: '☕',
    tea: '🍵',
    juice: '🧃',
    soda: '🥤',
    wine: '🍷',
    beer: '🍺'
  },
  frozen: {
    ice_cream: '🍨',
    pizza: '🍕',
    fries: '🍟',
    veggies: '🥦',
    nuggets: '🍗'
  },
  snacks: {
    chips: '🍟',
    chocolate: '🍫',
    popcorn: '🍿',
    cookie: '🍪',
    candy: '🍬',
    donut: '🍩'
  },
  household: {
    soap: '🧼',
    sponge: '🧽',
    detergent: '🧴',
    paper_towels: '🧻',
    broom: '🧹'
  },
  personal: {
    shampoo: '🧴',
    toothpaste: '😁',
    razor: '🪒',
    deodorant: '🧴',
    lotion: '🧴'
  },
  baby_pet: {
    baby_formula: '🍼',
    diaper: '🧷',
    pacifier: '🍼',
    dog_food: '🐶',
    cat_food: '🐱'
  },
  other: {
    gift: '🎁',
    batteries: '🔋',
    lightbulb: '💡'
  }
};

// Category-level fallback emojis
const CATEGORY_FALLBACK_EMOJIS: Record<string, string> = {
  fruits: '🍎',
  vegetables: '🥕',
  proteins: '🍗',
  dairy: '🥛',
  grains: '🌾',
  pantry: '📦',
  canned: '🥫',
  beverages: '🍷',
  frozen: '🍦',
  snacks: '🍬',
  household: '🏠',
  personal: '🛁',
  baby_pet: '👶',
  other: '❓'
};

// Helper function to get emoji for an item
const getItemEmoji = (itemName: string): string => {
  const category = getItemCategory(itemName) || 'other';
  const normalizedItemName = itemName.toLowerCase().replace(/\s+/g, '_');
  
  // Try to find item-specific emoji
  if (CATEGORY_EMOJIS[category] && CATEGORY_EMOJIS[category][normalizedItemName]) {
    return CATEGORY_EMOJIS[category][normalizedItemName];
  }
  
  // Fallback to category emoji
  return CATEGORY_FALLBACK_EMOJIS[category] || CATEGORY_FALLBACK_EMOJIS.other;
};

export interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
  quantity?: number;
  unit?: string;
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
      <Card className={cn("p-8 md:p-12 text-center shadow-card rounded-2xl border-0 bg-white/80 backdrop-blur-sm", className)}>
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto">
            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Empty Shopping List</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              No items in your shopping list yet. Use voice input to add items!
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = getItemCategory(item.name) || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  // Sort categories by predefined order
  const categoryOrder = [
    'fruits', 'vegetables', 'proteins', 'dairy', 'grains', 
    'pantry', 'canned', 'beverages', 'frozen', 'snacks', 
    'household', 'personal', 'baby_pet', 'other'
  ];

  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    // Put unknown categories at the end
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <Card className={cn("p-6 md:p-8 shadow-card rounded-2xl border-0 bg-white/80 backdrop-blur-sm", className)}>
      <div className="space-y-8">
        {sortedCategories.map((category) => (
          <div key={category} className="space-y-3">
            <h3 className={cn("text-lg font-bold pl-2 border-l-4", CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.other)}>
              {CATEGORY_NAMES[category] || category.charAt(0).toUpperCase() + category.slice(1)}
            </h3>
            <div className="space-y-3">
              {groupedItems[category].map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 animate-slide-up hover:shadow-md",
                    item.completed
                      ? "bg-secondary/50 border-primary/20"
                      : "bg-background border-border hover:border-primary/30"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <button
                    onClick={() => onToggleItem(item.id)}
                    className="flex-shrink-0 transition-transform duration-300 hover:scale-110 p-2"
                    aria-label={item.completed ? "Mark as not completed" : "Mark as completed"}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary animate-check-bounce" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                    )}
                  </button>
                  
                  {/* Item-specific or category emoji */}
                  <span className="text-4xl text-muted-foreground flex-shrink-0">
                    {getItemEmoji(item.name)}
                  </span>
                  
                  <span
                    className={cn(
                      "flex-1 text-lg font-medium transition-all duration-300 py-2",
                      item.completed
                        ? "text-muted-foreground line-through opacity-70"
                        : "text-foreground"
                    )}
                  >
                    {/* Quantity and unit display */}
                    {((item.quantity !== undefined && item.quantity !== null) || item.unit) && (
                      <span className="font-bold text-primary mr-2">
                        {item.quantity !== undefined && item.quantity !== null ? item.quantity : ''}
                        {item.unit && <span className="lowercase">{item.unit}</span>}
                      </span>
                    )}
                    {item.name}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 rounded-xl transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {items.length > 0 && (
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="font-medium">
              {items.filter(item => item.completed).length} of {items.length} completed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-voice-listening"></div>
            <span className="font-medium">
              {items.length - items.filter(item => item.completed).length} remaining
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};
