import React, { useState, useCallback, useRef } from 'react';
import { VoiceButton } from './VoiceButton';
import { ShoppingList, type ShoppingItem } from './ShoppingList';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import groceryHero from '@/assets/grocery-hero.jpg';

type AppMode = 'adding' | 'shopping' | 'idle';

export const GroceryApp: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [mode, setMode] = useState<AppMode>('idle');
  const { toast } = useToast();
  const completionAudioRef = useRef<HTMLAudioElement | null>(null);

  // Speech recognition for adding items
  const addItemsRecognition = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    onResult: (transcript, isFinal) => {
      if (isFinal && transcript.trim()) {
        parseAndAddItems(transcript.trim());
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
    
    // Apply all separators
    let parsedItems = [normalized];
    separators.forEach(separator => {
      parsedItems = parsedItems.flatMap(item => 
        item.split(separator).filter(part => part.trim().length > 0)
      );
    });
    
    // Enhanced parsing for space-separated items
    // Always try to split space-separated items, not just when there's only one item
    const allWords: string[] = [];
    parsedItems.forEach(item => {
      allWords.push(...item.split(' '));
    });
    
    // Common grocery items and compound words that should stay together
    const compoundItems = [
      'ice cream', 'olive oil', 'peanut butter', 'orange juice', 'apple juice',
      'ground beef', 'chicken breast', 'hot dogs', 'potato chips', 'corn flakes',
      'green beans', 'sweet potato', 'bell pepper', 'black beans', 'brown rice',
      'whole wheat', 'greek yogurt', 'coconut milk', 'almond milk', 'soy sauce',
      'maple syrup', 'baking soda', 'vanilla extract', 'cream cheese', 'cottage cheese'
    ];
    
    // Try to identify compound items first
    let processedWords = [...allWords];
    const identifiedItems: string[] = [];
    
    // Check for compound items
    for (let i = 0; i < processedWords.length - 1; i++) {
      const twoWordPhrase = `${processedWords[i]} ${processedWords[i + 1]}`;
      if (compoundItems.includes(twoWordPhrase)) {
        identifiedItems.push(twoWordPhrase);
        processedWords.splice(i, 2); // Remove both words
        i--; // Adjust index
      }
    }
    
    // Add remaining single words as individual items
    identifiedItems.push(...processedWords);
    
    // Use space-based parsing to ensure items are separated
    // This is more aggressive than the original logic
    parsedItems = identifiedItems;
    
    // Clean up each item
    const cleanedItems = parsedItems
      .map(item => {
        let cleaned = item.trim();
        
        // Remove leading articles and quantifiers
        cleaned = cleaned.replace(/^(a|an|the|some|few|couple)\s+/i, '');
        
        // Remove trailing periods and commas
        cleaned = cleaned.replace(/[.,]+$/, '');
        
        // Handle quantities - keep them if they're part of the item name
        // But remove standalone numbers at the beginning
        cleaned = cleaned.replace(/^\d+\s+(?=\w)/g, '');
        
        // Remove extra whitespace
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        return cleaned;
      })
      .filter(item => {
        // Filter out empty items and common non-items
        if (!item || item.length < 2) return false;
        
        const nonItems = [
          'and', 'or', 'also', 'plus', 'then', 'next', 'um', 'uh',
          'well', 'okay', 'alright', 'let me see', 'what else', 'that\'s it',
          'i\'m done', 'that\'s all', 'nothing else', 'no more', 'stop', 'finish',
          'end', 'complete', 'done', 'thats it', 'im done'
        ];
        
        return !nonItems.includes(item.toLowerCase());
      });
    
    // Convert to ShoppingItem objects, avoiding duplicates
    const newItems: ShoppingItem[] = cleanedItems
      .filter(itemName => 
        !items.some(existing => 
          existing.name.toLowerCase() === itemName.toLowerCase()
        )
      )
      .map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        completed: false,
      }));

    if (newItems.length > 0) {
      setItems(prev => [...prev, ...newItems]);
      toast({
        title: `Added ${newItems.length} item${newItems.length > 1 ? "s" : ""}`,
        description: newItems.map(item => item.name).join(", "),
      });
    } else if (cleanedItems.length === 0) {
      toast({
        title: "No items recognized",
        description: "Try speaking more clearly or use words like 'and' between items",
        variant: "destructive",
      });
    }
  }, [items, toast]);

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

            {items.length > 0 && (
              <Button
                onClick={handleClearList}
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="w-4 h-4" />
                Clear List
              </Button>
            )}
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
      </div>
    </div>
  );
};
