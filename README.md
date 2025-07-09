# Kitbash

A modern React TypeScript application - a place to slap things together. Built with Vite, MUI, Redux Toolkit, and React Router.

**🔗 [Live Demo](https://taco429.github.io/kitbash) | [GitHub Repository](https://github.com/taco429/kitbash)**

## 🚀 Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **Material-UI (MUI)** - React component library
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Emotion** - CSS-in-JS styling

## 📁 Project Structure

```
src/
├── components/          # React components
│   └── layout/         # Layout components
├── pages/              # Page components
│   ├── HomePage.tsx    # Landing page
│   ├── CounterPage.tsx # Counter demo
│   └── TodoPage.tsx    # Todo list demo
├── store/              # Redux store
│   ├── store.ts        # Store configuration
│   ├── counterSlice.ts # Counter state
│   └── todoSlice.ts    # Todo state
├── hooks/              # Custom React hooks
├── types/              # TypeScript definitions
├── App.tsx             # Main App component
└── main.tsx            # Entry point
```

## ✨ Features

### 🏠 Home Page
- Technology showcase with interactive chips
- Project overview and feature descriptions

### 🔢 Counter Demo
- Redux state management with increment/decrement
- Custom amount input and reset functionality
- Modern MUI button groups

### ✅ Todo List Demo
- Full CRUD operations (Create, Read, Update, Delete)
- Toggle completion status
- Bulk actions (clear completed)
- Real-time counters for active/completed items

### 📱 Responsive Design
- **Desktop** - Persistent sidebar navigation
- **Tablet** - Collapsible sidebar
- **Mobile** - Hamburger menu with touch-friendly interactions

## 🏃 Getting Started

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/taco429/kitbash.git
   cd kitbash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser to** `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run lint` - Run TypeScript type checking

## 🧭 Routes

- **Home** (`/`) - Welcome page and project overview
- **Counter** (`/counter`) - Redux counter implementation
- **Todos** (`/todos`) - Todo list with CRUD operations

## 🔧 Development Features

- **Hot Module Replacement** for fast development
- **TypeScript strict mode** for type safety
- **Redux DevTools** compatible
- **Material-UI theming** for consistent styling
- **Route-based code splitting** for performance

---

Built with modern React patterns and TypeScript for scalability and maintainability.
