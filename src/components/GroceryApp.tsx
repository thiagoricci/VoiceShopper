import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { VoiceButton } from './VoiceButton';
import { ShoppingList, type ShoppingItem } from './ShoppingList';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { ShoppingCart, Plus, RotateCcw, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isValidGroceryItem, findBestMatch } from '@/data/groceryItems';
import groceryHero from '@/assets/grocery-hero.jpg';

type AppMode = 'adding' | 'shopping' | 'idle';

export const GroceryApp: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [mode, setMode] = useState<AppMode>('idle');
  const [history, setHistory] = useState<ShoppingItem[][]>([]);
  const { toast } = useToast();
  const completionAudioRef = useRef<HTMLAudioElement | null>(null);

  // State for accumulating speech input
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');

  // Debounced transcript for processing
  const debouncedTranscript = useDebounce(accumulatedTranscript, 500);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Start adding items with 'a' key
      if (e.key === 'a' && mode === 'idle') {
        e.preventDefault();
        handleStartAddingItems();
      }
      
      // Start shopping with 's' key
      if (e.key === 's' && mode === 'idle' && items.length > 0) {
        e.preventDefault();
        handleStartShopping();
      }
      
      // Stop current action with 'Escape' key
      if (e.key === 'Escape' && mode !== 'idle') {
        e.preventDefault();
        if (mode === 'adding') {
          handleStopAddingItems();
        } else if (mode === 'shopping') {
          handleStopShopping();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, items.length]);


  // Speech recognition for adding items
  const addItemsRecognition = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    timeout: 5000, // 5 second timeout
    onResult: (transcript, isFinal) => {
      if (isFinal && transcript.trim()) {
        // Accumulate the transcript instead of processing immediately
        setAccumulatedTranscript(prev => prev + ' ' + transcript.trim());
      }
    },
    onError: (error) => {
      console.error('Speech recognition error:', error);
      toast({
        title: "Voice Recognition Error",
        description: "Please try again or check microphone permissions.",
        variant: "destructive",
      });
    },
  });

  // Speech recognition for shopping mode
  const shoppingRecognition = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    timeout: 5000, // 5 second timeout
    onResult: (transcript, isFinal) => {
      if (isFinal && transcript.trim()) {
        checkOffItems(transcript.trim());
      }
    },
    onError: (error) => {
      console.error('Shopping mode error:', error);
      toast({
        title: "Voice Recognition Error",
        description: "Please try again or check microphone permissions.",
        variant: "destructive",
      });
    },
  });

  // Function to extract quantity from item name
  const extractQuantity = (itemName: string): { quantity: number | undefined, itemName: string } => {
    // Match patterns like "2 apples", "three bananas", "a dozen eggs"
    const quantityPatterns = [
      /^(\d+)\s+(.+)$/, // "2 apples"
      /^(one|two|three|four|five|six|seven|eight|nine|ten)\s+(.+)$/i, // "three bananas"
      /^(a\s+dozen|a\s+pair|a\s+few)\s+(.+)$/i, // "a dozen eggs"
    ];
    
    for (const pattern of quantityPatterns) {
      const match = itemName.match(pattern);
      if (match) {
        let quantity: number | undefined;
        
        if (pattern === quantityPatterns[0]) {
          // Numeric quantity
          quantity = parseInt(match[1], 10);
        } else if (pattern === quantityPatterns[1]) {
          // Word quantity
          const wordToNumber: Record<string, number> = {
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
          };
          quantity = wordToNumber[match[1].toLowerCase()];
        } else if (pattern === quantityPatterns[2]) {
          // Special quantities
          const specialQuantities: Record<string, number> = {
            'a dozen': 12, 'a pair': 2, 'a few': 3
          };
          quantity = specialQuantities[match[1].toLowerCase()];
        }
        
        return { quantity, itemName: match[2] };
      }
    }
    
    return { quantity: undefined, itemName };
  };

  // Enhanced parsing function for natural speech patterns
  const parseAndAddItems = useCallback((transcript: string) => {
    // Normalize the transcript
    let normalized = transcript.toLowerCase().trim();
    
    // Remove common filler words and phrases
    const fillerWords = [
      'i need', 'i want', 'get me', 'buy', 'purchase', 'pick up',
      'we need', 'let me get', 'can you add', 'add to the list',
      'put on the list', 'write down', 'remember to get'
    ];
    
    fillerWords.forEach(filler => {
      normalized = normalized.replace(new RegExp(`^${filler}\\s+`, 'i'), '');
      normalized = normalized.replace(new RegExp(`\\s+${filler}\\s+`, 'gi'), ' ');
    });
    
    // Enhanced separators for natural speech
    const separators = [
      // Conjunctions
      /\s+and\s+/gi,
      /\s+also\s+/gi,
      /\s+plus\s+/gi,
      /\s+as well as\s+/gi,
      /\s+along with\s+/gi,
      
      // Sequential words
      /\s+then\s+/gi,
      /\s+next\s+/gi,
      /\s+after that\s+/gi,
      
      // Quantity transitions
      /\s+some\s+/gi,
      /\s+a few\s+/gi,
      /\s+couple of\s+/gi,
      
      // Punctuation
      /,\s*/g,
      /;\s*/g,
      
      // Numbers (when they start a new item)
      /\s+(?=\d+\s+)/g,
      
      // Pauses in speech (multiple periods or spaces)
      /\.{2,}/g,
      /\s{3,}/g
    ];
    
    // Apply all separators first
    let parsedItems = [normalized];
    separators.forEach(separator => {
      parsedItems = parsedItems.flatMap(item =>
        item.split(separator).filter(part => part.trim().length > 0)
      );
    });
    
    // If no separators found and we have multiple words, try space separation
    if (parsedItems.length === 1 && parsedItems[0].includes(' ')) {
      const words = parsedItems[0].split(' ').filter(word => word.trim());
      
      // Common grocery items and compound words that should stay together
      const compoundItems = [
        'ice cream', 'olive oil', 'peanut butter', 'orange juice', 'apple juice',
        'ground beef', 'chicken breast', 'hot dogs', 'potato chips', 'corn flakes',
        'green beans', 'sweet potato', 'bell pepper', 'black beans', 'brown rice',
        'whole wheat', 'greek yogurt', 'coconut milk', 'almond milk', 'soy sauce',
        'maple syrup', 'baking soda', 'vanilla extract', 'cream cheese', 'cottage cheese',
        'hand soap', 'toilet paper', 'paper towels'
      ];
      
      // Process words to identify compounds and individual items
      const processedItems: string[] = [];
      let i = 0;
      
      while (i < words.length) {
        // Check for compound items (2 words)
        if (i < words.length - 1) {
          const twoWordPhrase = `${words[i]} ${words[i + 1]}`;
          if (compoundItems.includes(twoWordPhrase)) {
            processedItems.push(twoWordPhrase);
            i += 2;
            continue;
          }
        }
        
        // Add single word
        processedItems.push(words[i]);
        i++;
      }
      
      parsedItems = processedItems;
    }
    
    // Use comprehensive grocery item database for validation
    
    // Non-grocery words to filter out
    const nonGroceryWords = [
      // Articles & determiners
      'a', 'an', 'the', 'this', 'that', 'these', 'those', 'my', 'your', 'our',
      
      // Conjunctions
      'and', 'or', 'but', 'so', 'yet', 'for', 'nor',
      
      // Prepositions
      'of', 'to', 'in', 'on', 'at', 'by', 'for', 'with', 'without', 'from',
      'up', 'down', 'over', 'under', 'above', 'below', 'between', 'through',
      
      // Verbs (common speech verbs)
      'was', 'were', 'is', 'are', 'am', 'be', 'been', 'being', 'have', 'has',
      'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'might',
      'can', 'get', 'getting', 'got', 'need', 'needed', 'want', 'wanted',
      'buy', 'buying', 'bought', 'pick', 'picking', 'picked', 'take', 'taking',
      'took', 'put', 'putting', 'add', 'adding', 'added', 'go', 'going', 'went',
      
      // Thinking/filler words
      'um', 'uh', 'er', 'ah', 'well', 'like', 'you know', 'i mean', 'actually',
      'basically', 'literally', 'really', 'very', 'quite', 'pretty', 'sort of',
      'kind of', 'thinking', 'thought', 'think', 'about', 'maybe', 'perhaps',
      
      // Pronouns
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      
      // Adverbs
      'also', 'too', 'very', 'really', 'quite', 'rather', 'pretty', 'more', 'most',
      'less', 'least', 'much', 'many', 'few', 'little', 'enough', 'too much',
      
      // Quantity words (when standalone)
      'some', 'any', 'all', 'every', 'each', 'both', 'either', 'neither',
      'several', 'many', 'much', 'few', 'little', 'more', 'most', 'less', 'least',
      
      // Time/sequence words
      'now', 'then', 'next', 'first', 'second', 'last', 'finally', 'after',
      'before', 'during', 'while', 'when', 'where', 'why', 'how',
      
      // Common non-grocery phrases
      'lets see', 'let me see', 'what else', 'thats it', 'that is it', 'im done',
      'i am done', 'thats all', 'that is all', 'nothing else', 'no more',
      'stop', 'finish', 'end', 'complete', 'done', 'okay', 'alright', 'right'
    ];
    
    // Clean up and filter items
    const cleanedItems = parsedItems
      .map(item => {
        let cleaned = item.trim();
        
        // Remove leading articles and quantifiers
        cleaned = cleaned.replace(/^(a|an|the|some|few|couple|several)\s+/i, '');
        
        // Remove trailing periods and commas
        cleaned = cleaned.replace(/[.,!?]+$/, '');
        
        // Remove standalone numbers at the beginning
        cleaned = cleaned.replace(/^\d+\s+(?=\w)/g, '');
        
        // Remove extra whitespace
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        return cleaned;
      })
      .filter(item => {
        // Filter out empty items and too short items
        if (!item || item.length < 2) return false;
        
        const lowerItem = item.toLowerCase();
        
        // Filter out non-grocery words first
        if (nonGroceryWords.includes(lowerItem)) return false;
        
        // Use comprehensive grocery database for validation
        return isValidGroceryItem(lowerItem);
      });
    
    // Convert to ShoppingItem objects, avoiding duplicates
    const newItems: ShoppingItem[] = cleanedItems
      .map(itemName => {
        const { quantity, itemName: nameWithoutQuantity } = extractQuantity(itemName);
        const finalName = nameWithoutQuantity || itemName;
        
        // Use the best match from our database for consistency
        const bestMatch = findBestMatch(finalName) || finalName;
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: bestMatch.charAt(0).toUpperCase() + bestMatch.slice(1),
          completed: false,
          quantity: quantity || undefined,
        };
      });

    if (newItems.length > 0) {
      setItems(prevItems => {
        const itemsToAdd = newItems.filter(newItem =>
          !prevItems.some(existing => existing.name.toLowerCase() === newItem.name.toLowerCase())
        );
        
        if (itemsToAdd.length > 0) {
          toast({
            title: `Added ${itemsToAdd.length} item${itemsToAdd.length > 1 ? "s" : ""}`,
            description: itemsToAdd.map(item =>
              item.quantity ? `${item.quantity}x ${item.name}` : item.name
            ).join(", "),
          });
        }
        
        return [...prevItems, ...itemsToAdd];
      });
    } else if (cleanedItems.length === 0) {
      toast({
        title: "No items recognized",
        description: "Try speaking more clearly or use words like 'and' between items",
        variant: "destructive",
      });
    }
  }, [toast, extractQuantity]);

  // Process the debounced transcript
  useEffect(() => {
    if (debouncedTranscript.trim()) {
      parseAndAddItems(debouncedTranscript.trim());
      setAccumulatedTranscript(''); // Clear the accumulated transcript after processing
    }
  }, [debouncedTranscript, parseAndAddItems]);

  // Check off items based on speech
  const checkOffItems = useCallback((transcript: string) => {
    const spokenWords = transcript.toLowerCase().split(' ');
    
    // Find matching items with more precise matching
    const matchedItems = items.filter(item => {
      if (item.completed) return false;
      
      const itemName = item.name.toLowerCase();
      
      // Check for exact word matches first
      const itemWords = itemName.split(' ');
      const exactWordMatch = spokenWords.some(spokenWord => 
        itemWords.some(itemWord => itemWord === spokenWord)
      );
      
      // Check for partial matches (but more strict than before)
      const partialMatch = spokenWords.some(spokenWord => 
        itemName.includes(spokenWord) && spokenWord.length > 2
      );
      
      // Check for compound item matches
      const compoundMatch = spokenWords.some(spokenWord => 
        spokenWord.includes(itemName) && itemName.includes(' ')
      );
      
      return exactWordMatch || partialMatch || compoundMatch;
    });

    if (matchedItems.length > 0) {
      setItems(prev => {
        const updatedItems = prev.map(item => 
          matchedItems.some(matched => matched.id === item.id)
            ? { ...item, completed: true }
            : item
        );
        
        const allCompleted = updatedItems.every(item => item.completed);
        
        if (allCompleted && updatedItems.length > 0) {
          // Play success sound and show completion
          playSuccessSound();
          toast({
            title: "🎉 Shopping Complete!",
            description: "Congratulations! You've completed your shopping list!",
          });
          
          // Add a special celebration effect
          setTimeout(() => {
            toast({
              title: "🎊 Well Done! 🎊",
              description: "You've successfully completed your shopping list!",
              duration: 5000,
            });
          }, 1000);
          
          setTimeout(() => {
            setItems([]);
            setMode('idle');
            shoppingRecognition.stopListening();
          }, 3000);
        } else {
          toast({
            title: "Item found!",
            description: `Checked off: ${matchedItems.map(i => i.name).join(', ')}`,
          });
        }
        
        return updatedItems;
      });
    }
  }, [items, toast, shoppingRecognition]);

  // Play success sound
  const playSuccessSound = () => {
    try {
      // Create a more celebratory sound using Web Audio API
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      
      // Play a sequence of notes for a celebratory effect
      const playNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        // Create an envelope for the sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      // Play a celebratory chord progression
      const now = audioContext.currentTime;
      playNote(523.25, now, 0.2); // C
      playNote(659.25, now + 0.1, 0.2); // E
      playNote(783.99, now + 0.2, 0.3); // G
      playNote(1046.50, now + 0.3, 0.5); // C (octave)
    } catch (error) {
      console.error('Could not play success sound:', error);
    }
  };

  const handleStartAddingItems = () => {
    if (!addItemsRecognition.isSupported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    // Stop any active recognition before starting new one
    if (mode === 'shopping') {
      shoppingRecognition.stopListening();
    }

    setMode('adding');
    addItemsRecognition.resetTranscript();
    // Add a small delay to ensure previous recognition is fully stopped
    setTimeout(() => {
      addItemsRecognition.startListening();
    }, 100);
  };

  const handleStopAddingItems = () => {
    setMode('idle');
    addItemsRecognition.stopListening();
  };

  const handleStartShopping = () => {
    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Add some items to your list first!",
        variant: "destructive",
      });
      return;
    }

    if (!shoppingRecognition.isSupported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    // Stop any active recognition before starting new one
    if (mode === 'adding') {
      addItemsRecognition.stopListening();
    }

    setMode('shopping');
    shoppingRecognition.resetTranscript();
    // Add a small delay to ensure previous recognition is fully stopped
    setTimeout(() => {
      shoppingRecognition.startListening();
    }, 100);
  };

  const handleStopShopping = () => {
    setMode('idle');
    shoppingRecognition.stopListening();
  };

  const handleToggleItem = (id: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearList = () => {
    setItems([]);
    if (mode !== 'idle') {
      if (mode === 'adding') {
        addItemsRecognition.stopListening();
      } else if (mode === 'shopping') {
        shoppingRecognition.stopListening();
      }
      setMode('idle');
    }
  };

  // Save current list to history
  const saveToListHistory = () => {
    if (items.length > 0) {
      setHistory(prev => [items, ...prev.slice(0, 9)]); // Keep only last 10 lists
      toast({
        title: "List Saved",
        description: "Your shopping list has been saved to history.",
      });
    }
  };

  // Load list from history
  const loadFromHistory = (index: number) => {
    const list = history[index];
    if (list) {
      setItems(list);
      toast({
        title: "List Loaded",
        description: "Shopping list loaded from history.",
      });
    }
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    toast({
      title: "History Cleared",
      description: "Shopping list history has been cleared.",
    });
  };

  const getCurrentTranscript = () => {
    if (mode === 'adding') return addItemsRecognition.transcript;
    if (mode === 'shopping') return shoppingRecognition.transcript;
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-3 md:p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="relative">
            <img 
              src={groceryHero} 
              alt="Voice-controlled grocery shopping" 
              className="w-24 h-18 md:w-32 md:h-24 mx-auto rounded-xl shadow-fresh object-cover"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-fresh bg-clip-text text-transparent">
              Voice Grocery List
            </h1>
            <p className="text-muted-foreground text-lg">
              Speak your shopping list, then shop hands-free!
            </p>
          </div>
        </div>

        {/* Mode Indicator */}
        {mode !== 'idle' && (
          <div className="flex justify-center">
            <div className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold",
              mode === 'adding'
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            )}>
              {mode === 'adding' ? '🎤 Adding Items' : '🛒 Shopping Mode'}
            </div>
          </div>
        )}

        {/* Voice Input Card */}
        <Card className="p-4 md:p-6 shadow-card">
          <div className="space-y-4">
            {mode === 'idle' && (
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <VoiceButton
                    isListening={false}
                    isRecording={false}
                    onStartListening={handleStartAddingItems}
                    onStopListening={() => {}}
                    className="w-full md:w-auto"
                    size="default"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Items</span>
                    <span className="sm:hidden">Add</span>
                  </VoiceButton>
                  
                  {items.length > 0 && (
                    <Button
                      onClick={handleStartShopping}
                      variant="secondary"
                      size="default"
                      className="w-full font-semibold"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="hidden sm:inline">Start Shopping</span>
                      <span className="sm:hidden">Shop</span>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {mode === 'adding' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-primary">
                    🎤 Listening for Items
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Say your grocery items separated by "and" or commas
                  </p>
                </div>
                
                <VoiceButton
                  isListening={addItemsRecognition.isListening}
                  isRecording={true}
                  onStartListening={handleStartAddingItems}
                  onStopListening={handleStopAddingItems}
                  className="w-full"
                >
                  Stop Adding Items
                </VoiceButton>
                
                {getCurrentTranscript() && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Current speech:</p>
                    <p className="font-medium">{getCurrentTranscript()}</p>
                  </div>
                )}
              </div>
            )}

            {mode === 'shopping' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-voice-success">
                    🛒 Shopping Mode Active
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Say item names to check them off your list
                  </p>
                </div>
                
                <VoiceButton
                  isListening={shoppingRecognition.isListening}
                  isRecording={true}
                  onStartListening={handleStartShopping}
                  onStopListening={handleStopShopping}
                  className="w-full"
                >
                  Stop Shopping
                </VoiceButton>
                
                {getCurrentTranscript() && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Listening for:</p>
                    <p className="font-medium">{getCurrentTranscript()}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={saveToListHistory}
                variant="ghost"
                size="sm"
                className="flex-1 text-muted-foreground hover:text-primary"
                aria-label="Save current shopping list to history"
              >
                <Save className="w-4 h-4" />
                Save List
              </Button>
              <Button
                onClick={handleClearList}
                variant="ghost"
                size="sm"
                className="flex-1 text-muted-foreground hover:text-destructive"
                aria-label="Clear current shopping list"
              >
                <RotateCcw className="w-4 h-4" />
                Clear List
              </Button>
            </div>
          </div>
        </Card>

        {/* Shopping List */}
        <ShoppingList
          items={items}
          onToggleItem={handleToggleItem}
          onRemoveItem={handleRemoveItem}
          className="animate-slide-up"
        />

        {/* Instructions */}
        <Card className="p-3 md:p-4 bg-muted/50 shadow-card">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Press "Add Items" and speak your grocery list naturally</li>
            <li>• Say "apples and bananas" or "milk, bread, eggs"</li>
            <li>• Use words like "also", "plus", "then" to separate items</li>
            <li>• Press "Start Shopping" to begin voice check-off</li>
            <li>• Say item names while shopping to cross them off</li>
            <li>• Get a celebration when your list is complete!</li>
          </ul>
        </Card>
        
        {/* History Section */}
        {history.length > 0 && (
          <Card className="p-4 md:p-6 shadow-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Saved Lists</h3>
              <Button
                onClick={clearHistory}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                aria-label="Clear all saved shopping lists from history"
              >
                Clear History
              </Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {history.map((list, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                  onClick={() => loadFromHistory(index)}
                >
                  <span className="text-sm">
                    {list.length} item{list.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
