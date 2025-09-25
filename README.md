# 🎤 Voice Shopper - AI-Powered Grocery Assistant

A revolutionary voice-controlled grocery shopping application that transforms how you create and manage shopping lists. Simply speak your grocery needs and let AI handle the rest!

![Voice Shopper Demo](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Voice+Shopper+Demo)

## ✨ Key Features

### 🎯 **Smart Voice Recognition**

- **Natural Language Processing**: Speak naturally with support for quantities, compound items, and conversational patterns
- **Advanced Parsing**: Automatically recognizes and separates items using words like "and", "also", "plus", "then"
- **Fast Response**: Optimized 3-second microphone timeout for quick operation
- **Mobile Optimized**: Special optimizations for mobile devices with continuous listening and auto-restart capabilities

### 🛒 **Dual-Mode Operation**

- **Adding Mode**: Voice input for creating shopping lists with real-time feedback
- **Shopping Mode**: Hands-free item check-off while shopping
- **Smart Item Recognition**: Comprehensive grocery database ensures accurate item identification

### 🎉 **Enhanced User Experience**

- **Celebration System**: Audio celebration when shopping list is completed
- **Visual Feedback**: Real-time transcript display and animated UI elements
- **Progress Tracking**: Live completion counter and remaining items display
- **History Management**: Save and reload previous shopping lists

### ⌨️ **Keyboard Shortcuts**

- **A**: Start adding items (when idle)
- **S**: Start shopping mode (when items exist)
- **Escape**: Stop current action

### 📱 **Modern Interface**

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Beautiful Animations**: Smooth transitions and micro-interactions
- **Accessibility**: Full keyboard navigation and screen reader support
- **Clean UI**: Streamlined interface with no unnecessary visual clutter

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with microphone access
- Internet connection for speech recognition

### Installation

1. **Clone the repository**

   ```bash
   git clone <YOUR_GIT_URL>
   cd voice-shopper
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` and grant microphone permissions when prompted.

## 🎤 Voice Commands

### Adding Items

Speak naturally using these patterns:

- **Basic**: "apples and bananas"
- **With quantities**: "2 apples and 3 bananas"
- **Word quantities**: "a dozen eggs and two loaves of bread"
- **Conversational**: "I need milk also some bread and maybe some eggs"
- **Separators**: Use "and", "also", "plus", "then", commas, or just speak clearly

### Shopping Mode

Simply say item names to check them off:

- "apples" (checks off apples)
- "milk" (checks off milk)
- "bread" (checks off bread)

## 🏗️ Technical Architecture

### Frontend Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development with enhanced developer experience
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **shadcn/ui** - High-quality, accessible component library
- **Lucide React** - Beautiful icon library

### Core Technologies

- **Web Speech API** - Browser-native speech recognition
- **Custom Hooks** - Reusable speech recognition logic
- **Context API** - State management for shopping data
- **Local Storage** - Persistent shopping list history
- **Web Audio API** - Celebration sound effects

### Performance Optimizations

- **Debounced Processing** - Optimized speech input handling
- **Mobile-First** - Responsive design with mobile speech optimizations
- **Lazy Loading** - Efficient component rendering
- **Error Handling** - Robust error recovery for speech recognition
- **Fast Microphone Control** - 3-second timeout for quick microphone stopping
- **Aggressive Stop Mechanism** - Multiple stop attempts ensure immediate microphone termination
- **Clean State Management** - Proper cleanup prevents memory leaks and hanging processes

## 📋 Usage Guide

### Getting Started

1. **Grant Permissions**: Allow microphone access when prompted
2. **Add Items**: Click "Add Items" and speak your grocery list
3. **Stop Adding**: Click "Stop Adding" when finished with your list
4. **Review List**: See your items appear with smart categorization
5. **Start Shopping**: Click "Start Shopping" for hands-free check-off
6. **Complete**: Enjoy the celebration when your list is done!

### Tips for Best Results

- **Speak clearly** and at a normal pace
- **Use natural pauses** between items
- **Try different separators** like "and", "also", or commas
- **Include quantities** naturally: "2 apples", "a dozen eggs"
- **Use compound words**: "peanut butter", "orange juice"
- **Click "Stop Adding"** to finish your list (no voice commands needed)

### Supported Item Types

- **Fresh Produce**: fruits, vegetables, herbs
- **Dairy**: milk, cheese, yogurt, eggs
- **Bakery**: bread, pastries, baked goods
- **Meat & Seafood**: beef, chicken, fish, seafood
- **Pantry Staples**: canned goods, pasta, rice, beans
- **Beverages**: juices, sodas, water, coffee, tea
- **Household**: cleaning supplies, paper products
- **Personal Care**: toiletries, medications

### How to Stop Adding Items

- **Button Control**: Click the "Stop Adding" button to finish your list
- **Fast Response**: Microphone stops within 3 seconds maximum
- **Visual Feedback**: Button changes from red to blue when stopped
- **Clean Operation**: No voice commands needed - just use the button

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/voice-shopper.git
cd voice-shopper

# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev) for rapid prototyping
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Speech recognition powered by Web Speech API

## 🆘 Support

Having issues? Check out our [Troubleshooting Guide](TROUBLESHOOTING.md) or create an issue on GitHub.

---

**Made with ❤️ for smarter grocery shopping**
