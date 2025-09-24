// Comprehensive grocery item database for recognition
export const GROCERY_ITEMS = {
  // Fresh Fruits
  fruits: [
    'apple', 'apples', 'banana', 'bananas', 'orange', 'oranges', 'grape', 'grapes',
    'strawberry', 'strawberries', 'blueberry', 'blueberries', 'raspberry', 'raspberries',
    'blackberry', 'blackberries', 'lemon', 'lemons', 'lime', 'limes', 'grapefruit',
    'avocado', 'avocados', 'pear', 'pears', 'peach', 'peaches', 'plum', 'plums',
    'cherry', 'cherries', 'pineapple', 'mango', 'mangos', 'kiwi', 'kiwis',
    'watermelon', 'cantaloupe', 'honeydew', 'papaya', 'coconut', 'coconuts',
    'cranberry', 'cranberries', 'pomegranate', 'dates', 'figs', 'raisins'
  ],

  // Fresh Vegetables
  vegetables: [
    'carrot', 'carrots', 'celery', 'onion', 'onions', 'potato', 'potatoes',
    'sweet potato', 'sweet potatoes', 'tomato', 'tomatoes', 'lettuce', 'spinach',
    'broccoli', 'cauliflower', 'cucumber', 'cucumbers', 'pepper', 'peppers',
    'bell pepper', 'bell peppers', 'jalapeno', 'jalapenos', 'garlic', 'ginger',
    'mushroom', 'mushrooms', 'zucchini', 'squash', 'eggplant', 'corn',
    'green beans', 'asparagus', 'cabbage', 'kale', 'arugula', 'radish', 'radishes',
    'beets', 'turnip', 'parsnip', 'leek', 'leeks', 'scallions', 'green onions',
    'brussels sprouts', 'artichoke', 'okra', 'snow peas', 'snap peas'
  ],

  // Proteins - Meat, Poultry, Seafood
  proteins: [
    'chicken', 'chicken breast', 'chicken thigh', 'chicken wings', 'whole chicken',
    'beef', 'ground beef', 'steak', 'ribeye', 'sirloin', 'tenderloin', 'brisket',
    'pork', 'pork chops', 'pork shoulder', 'ham', 'bacon', 'sausage', 'bratwurst',
    'turkey', 'ground turkey', 'turkey breast', 'deli turkey', 'pepperoni', 'salami',
    'salmon', 'tuna', 'cod', 'tilapia', 'shrimp', 'crab', 'lobster', 'scallops',
    'mussels', 'clams', 'sardines', 'anchovies', 'halibut', 'mahi mahi',
    'eggs', 'egg whites', 'tofu', 'tempeh', 'seitan'
  ],

  // Dairy and Alternatives
  dairy: [
    'milk', 'whole milk', 'skim milk', '2% milk', 'almond milk', 'oat milk',
    'soy milk', 'coconut milk', 'rice milk', 'lactose free milk',
    'cheese', 'cheddar', 'mozzarella', 'parmesan', 'swiss', 'gouda', 'brie',
    'feta', 'goat cheese', 'cream cheese', 'cottage cheese', 'ricotta',
    'provolone', 'monterey jack', 'blue cheese', 'camembert', 'manchego',
    'butter', 'margarine', 'ghee', 'yogurt', 'greek yogurt', 'plain yogurt',
    'vanilla yogurt', 'strawberry yogurt', 'heavy cream', 'half and half',
    'sour cream', 'whipped cream', 'ice cream', 'frozen yogurt'
  ],

  // Grains, Bread, and Cereals
  grains: [
    'bread', 'white bread', 'wheat bread', 'whole grain bread', 'sourdough',
    'rye bread', 'pumpernickel', 'bagels', 'english muffins', 'croissants',
    'tortillas', 'pita bread', 'naan', 'rolls', 'buns', 'hamburger buns',
    'rice', 'white rice', 'brown rice', 'jasmine rice', 'basmati rice', 'wild rice',
    'pasta', 'spaghetti', 'penne', 'fettuccine', 'linguine', 'rigatoni', 'macaroni',
    'lasagna noodles', 'angel hair', 'ravioli', 'gnocchi',
    'cereal', 'oatmeal', 'granola', 'corn flakes', 'cheerios', 'rice krispies',
    'flour', 'all purpose flour', 'wheat flour', 'almond flour', 'coconut flour',
    'quinoa', 'barley', 'oats', 'steel cut oats', 'couscous', 'bulgur'
  ],

  // Pantry and Condiments
  pantry: [
    'salt', 'black pepper', 'white pepper', 'sugar', 'brown sugar', 'honey',
    'maple syrup', 'agave', 'vanilla extract', 'almond extract',
    'olive oil', 'vegetable oil', 'coconut oil', 'canola oil', 'sesame oil',
    'vinegar', 'balsamic vinegar', 'apple cider vinegar', 'white vinegar',
    'ketchup', 'mustard', 'dijon mustard', 'mayonnaise', 'ranch', 'bbq sauce',
    'soy sauce', 'worcestershire sauce', 'hot sauce', 'sriracha', 'tabasco',
    'peanut butter', 'almond butter', 'nutella', 'jam', 'jelly', 'preserves',
    'baking powder', 'baking soda', 'yeast', 'cornstarch', 'cocoa powder',
    'spices', 'garlic powder', 'onion powder', 'paprika', 'cumin', 'oregano',
    'basil', 'thyme', 'rosemary', 'sage', 'cinnamon', 'nutmeg', 'ginger powder'
  ],

  // Canned and Jarred Goods
  canned: [
    'canned tomatoes', 'tomato sauce', 'tomato paste', 'marinara sauce',
    'canned beans', 'black beans', 'kidney beans', 'pinto beans', 'chickpeas',
    'canned corn', 'canned peas', 'canned carrots', 'canned green beans',
    'chicken broth', 'beef broth', 'vegetable broth', 'stock',
    'canned tuna', 'canned salmon', 'canned sardines',
    'soup', 'chicken soup', 'tomato soup', 'vegetable soup', 'minestrone',
    'pasta sauce', 'alfredo sauce', 'pesto sauce', 'salsa', 'pickles',
    'olives', 'capers', 'coconut milk', 'evaporated milk', 'condensed milk'
  ],

  // Beverages
  beverages: [
    'water', 'sparkling water', 'soda', 'cola', 'sprite', 'orange soda',
    'juice', 'orange juice', 'apple juice', 'grape juice', 'cranberry juice',
    'coffee', 'instant coffee', 'coffee beans', 'ground coffee', 'espresso',
    'tea', 'green tea', 'black tea', 'herbal tea', 'chamomile tea', 'earl grey',
    'beer', 'wine', 'red wine', 'white wine', 'champagne', 'vodka', 'whiskey',
    'energy drink', 'sports drink', 'coconut water', 'kombucha'
  ],

  // Frozen Foods
  frozen: [
    'frozen vegetables', 'frozen broccoli', 'frozen peas', 'frozen corn',
    'frozen fruit', 'frozen berries', 'frozen mango', 'frozen strawberries',
    'frozen pizza', 'frozen dinners', 'frozen fish', 'frozen chicken',
    'ice cream', 'frozen yogurt', 'popsicles', 'frozen waffles', 'frozen fries',
    'frozen burgers', 'frozen shrimp', 'frozen dumplings'
  ],

  // Snacks and Sweets
  snacks: [
    'chips', 'potato chips', 'tortilla chips', 'pretzels', 'popcorn', 'crackers',
    'nuts', 'peanuts', 'almonds', 'walnuts', 'cashews', 'pistachios',
    'cookies', 'chocolate chip cookies', 'oreos', 'graham crackers',
    'candy', 'chocolate', 'dark chocolate', 'milk chocolate', 'gummy bears',
    'trail mix', 'granola bars', 'protein bars', 'rice cakes', 'beef jerky'
  ],

  // Household Items
  household: [
    'toilet paper', 'paper towels', 'tissues', 'napkins', 'aluminum foil',
    'plastic wrap', 'trash bags', 'ziplock bags', 'parchment paper',
    'dish soap', 'hand soap', 'laundry detergent', 'fabric softener',
    'bleach', 'all purpose cleaner', 'glass cleaner', 'disinfectant',
    'sponges', 'paper plates', 'plastic cups', 'disposable utensils'
  ],

  // Personal Care
  personal: [
    'shampoo', 'conditioner', 'body wash', 'soap bar', 'lotion', 'deodorant',
    'toothpaste', 'toothbrush', 'mouthwash', 'floss', 'razors', 'shaving cream',
    'sunscreen', 'lip balm', 'band aids', 'vitamins', 'aspirin', 'ibuprofen'
  ],

  // Baby and Pet
  baby_pet: [
    'diapers', 'baby food', 'baby formula', 'baby wipes', 'baby shampoo',
    'dog food', 'cat food', 'pet treats', 'cat litter', 'dog treats'
  ]
};

// Flatten all items into a single array for easy searching
export const ALL_GROCERY_ITEMS = Object.values(GROCERY_ITEMS).flat();

// Create a set for O(1) lookup performance
export const GROCERY_ITEMS_SET = new Set(ALL_GROCERY_ITEMS);

// Function to check if an item is a valid grocery item
export const isValidGroceryItem = (item: string): boolean => {
  const normalized = item.toLowerCase().trim();
  
  // Direct match
  if (GROCERY_ITEMS_SET.has(normalized)) {
    return true;
  }
  
  // Check for partial matches (for plurals and variations)
  const partialMatches = ALL_GROCERY_ITEMS.some(groceryItem => {
    // Handle plurals (e.g., "apples" matches "apple")
    if (normalized.endsWith('s') && groceryItem === normalized.slice(0, -1)) {
      return true;
    }
    if (groceryItem.endsWith('s') && normalized === groceryItem.slice(0, -1)) {
      return true;
    }
    
    // Handle compound items (e.g., "greek yogurt" contains "yogurt")
    if (normalized.includes(' ') || groceryItem.includes(' ')) {
      const normalizedWords = normalized.split(' ');
      const groceryWords = groceryItem.split(' ');
      
      // Check if all words in grocery item are present in the normalized item
      if (groceryWords.every(word => normalizedWords.includes(word))) {
        return true;
      }
      
      // Check if all words in normalized item are present in grocery item
      if (normalizedWords.every(word => groceryWords.includes(word))) {
        return true;
      }
    }
    
    return false;
  });
  
  return partialMatches;
};

// Function to find the best matching grocery item
export const findBestMatch = (item: string): string | null => {
  const normalized = item.toLowerCase().trim();
  
  // Direct match
  if (GROCERY_ITEMS_SET.has(normalized)) {
    return normalized;
  }
  
  // Find partial matches and return the most specific one
  const matches = ALL_GROCERY_ITEMS.filter(groceryItem => {
    if (normalized.endsWith('s') && groceryItem === normalized.slice(0, -1)) {
      return true;
    }
    if (groceryItem.endsWith('s') && normalized === groceryItem.slice(0, -1)) {
      return true;
    }
    
    if (normalized.includes(' ') || groceryItem.includes(' ')) {
      const normalizedWords = normalized.split(' ');
      const groceryWords = groceryItem.split(' ');
      
      if (groceryWords.every(word => normalizedWords.includes(word))) {
        return true;
      }
    }
    
    return false;
  });
  
  // Return the longest match (most specific)
  if (matches.length > 0) {
    return matches.reduce((longest, current) => 
      current.length > longest.length ? current : longest
    );
  }
  return null;
};

// Function to determine the category of an item
export const getItemCategory = (item: string): string | null => {
  const normalized = item.toLowerCase().trim();
  
  // Check each category
  for (const [category, items] of Object.entries(GROCERY_ITEMS)) {
    // Direct match
    if (items.includes(normalized)) {
      return category;
    }
    
    // Check for partial matches (plurals and variations)
    const hasPartialMatch = items.some(groceryItem => {
      // Handle plurals (e.g., "apples" matches "apple")
      if (normalized.endsWith('s') && groceryItem === normalized.slice(0, -1)) {
        return true;
      }
      if (groceryItem.endsWith('s') && normalized === groceryItem.slice(0, -1)) {
        return true;
      }
      
      // Handle compound items (e.g., "greek yogurt" contains "yogurt")
      if (normalized.includes(' ') || groceryItem.includes(' ')) {
        const normalizedWords = normalized.split(' ');
        const groceryWords = groceryItem.split(' ');
        
        // Check if all words in grocery item are present in the normalized item
        if (groceryWords.every(word => normalizedWords.includes(word))) {
          return true;
        }
      }
      
      return false;
    });
    
    if (hasPartialMatch) {
      return category;
    }
  }
  
  return null;
};

// Category display names
export const CATEGORY_NAMES: Record<string, string> = {
  fruits: 'Fruits',
  vegetables: 'Vegetables',
  proteins: 'Proteins',
  dairy: 'Dairy & Alternatives',
  grains: 'Grains & Bread',
  pantry: 'Pantry & Condiments',
  canned: 'Canned & Jarred Goods',
  beverages: 'Beverages',
  frozen: 'Frozen Foods',
  snacks: 'Snacks & Sweets',
  household: 'Household Items',
  personal: 'Personal Care',
  baby_pet: 'Baby & Pet'
};
