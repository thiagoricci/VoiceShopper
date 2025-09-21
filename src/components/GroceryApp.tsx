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

  // Parse speech transcript and add items to list
  const parseAndAddItems = useCallback((transcript: string) => {
    // Split by common separators and clean up
    const rawItems = transcript
      .split(/(?:,|\sand\s|\sor\s|\salso\s|\snext\s)/i)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const newItems: ShoppingItem[] = rawItems
      .filter(item => !items.some(existing => 
        existing.name.toLowerCase() === item.toLowerCase()
      ))
      .map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        completed: false,
      }));

    if (newItems.length > 0) {
      setItems(prev => [...prev, ...newItems]);
      toast({
        title: `Added ${newItems.length} item${newItems.length > 1 ? 's' : ''}`,
        description: newItems.map(item => item.name).join(', '),
      });
    }
  }, [items, toast]);

  // Check off items based on speech
  const checkOffItems = useCallback((transcript: string) => {
    const spokenWords = transcript.toLowerCase().split(' ');
    
    // Find matching items (check if any word in transcript matches item name)
    const matchedItems = items.filter(item => 
      !item.completed && 
      spokenWords.some(word => 
        item.name.toLowerCase().includes(word) || 
        word.includes(item.name.toLowerCase())
      )
    );

    if (matchedItems.length > 0) {
      setItems(prev => 
        prev.map(item => 
          matchedItems.some(matched => matched.id === item.id)
            ? { ...item, completed: true }
            : item
        )
      );

      // Check if all items are now completed
      const newItems = items.map(item => 
        matchedItems.some(matched => matched.id === item.id)
          ? { ...item, completed: true }
          : item
      );
      
      const allCompleted = newItems.every(item => item.completed);
      
      if (allCompleted && newItems.length > 0) {
        // Play success sound and show completion
        playSuccessSound();
        toast({
          title: "🎉 Shopping Complete!",
          description: "All items checked off your list!",
        });
        
        setTimeout(() => {
          setItems([]);
          setMode('idle');
          shoppingRecognition.stopListening();
        }, 2000);
      } else {
        toast({
          title: "Item found!",
          description: `Checked off: ${matchedItems.map(i => i.name).join(', ')}`,
        });
      }
    }
  }, [items, toast, shoppingRecognition]);

  // Play success sound
  const playSuccessSound = () => {
    try {
      // Create a simple success sound using Web Audio API
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 523.25; // C note
      gainNode.gain.value = 0.3;
      oscillator.type = 'sine';
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
      
      // Second note for harmony
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        
        osc2.frequency.value = 659.25; // E note
        gain2.gain.value = 0.3;
        osc2.type = 'sine';
        
        osc2.start();
        osc2.stop(audioContext.currentTime + 0.3);
      }, 150);
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

    setMode('adding');
    addItemsRecognition.resetTranscript();
    addItemsRecognition.startListening();
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

    setMode('shopping');
    shoppingRecognition.resetTranscript();
    shoppingRecognition.startListening();
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
      } else {
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
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="relative">
            <img 
              src={groceryHero} 
              alt="Voice-controlled grocery shopping" 
              className="w-32 h-24 mx-auto rounded-xl shadow-fresh object-cover"
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
        <Card className="p-6 shadow-card">
          <div className="space-y-4">
            {mode === 'idle' && (
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <VoiceButton
                    isListening={false}
                    isRecording={false}
                    onStartListening={handleStartAddingItems}
                    onStopListening={() => {}}
                    className="w-full"
                  >
                    <Plus className="w-5 h-5" />
                    Add Items with Voice
                  </VoiceButton>
                  
                  {items.length > 0 && (
                    <Button
                      onClick={handleStartShopping}
                      variant="secondary"
                      size="lg"
                      className="w-full font-semibold"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Start Shopping
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
        <Card className="p-4 bg-muted/50 shadow-card">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Press "Add Items" and speak your grocery list</li>
            <li>• Use "and", "also", or commas to separate items</li>
            <li>• Press "Start Shopping" to begin voice check-off</li>
            <li>• Say item names while shopping to cross them off</li>
            <li>• Get a celebration when your list is complete!</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};