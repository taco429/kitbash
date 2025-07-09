# Kitbash - Modern React TypeScript App

A modern React application built with the latest technologies, featuring MUI components and Redux Toolkit for state management.

## 🚀 Technologies Used

- **React 18** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - React component library with Material Design
- **Redux Toolkit** - Modern Redux with simplified syntax
- **React-Redux** - Official React bindings for Redux
- **Emotion** - CSS-in-JS library for styling MUI components

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # App header with navigation
│   ├── Counter.tsx     # Counter demo component
│   └── TodoList.tsx    # Todo list demo component
├── store/              # Redux store configuration
│   ├── store.ts        # Main store configuration
│   ├── counterSlice.ts # Counter state slice
│   └── todoSlice.ts    # Todo state slice
├── hooks/              # Custom React hooks
│   └── redux.ts        # Typed Redux hooks
├── types/              # TypeScript type definitions
├── App.tsx             # Main App component
└── main.tsx            # Application entry point
```

## 🎯 Features

### Counter Demo
- Increment/decrement counter
- Add custom amounts
- Reset functionality
- Modern MUI button groups and styling

### Todo List Demo
- Add new todos
- Mark todos as complete/incomplete
- Delete individual todos
- Clear all completed todos
- Real-time counters for active and completed items

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run TypeScript type checking

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`

## 🔧 Development

The application uses:
- **Hot Module Replacement (HMR)** for fast development
- **TypeScript strict mode** for type safety
- **Redux DevTools** compatible store
- **Material-UI theming** for consistent styling

## 🎨 Styling

The app uses Material-UI's theming system with:
- Custom primary and secondary colors
- Responsive design patterns
- Consistent Material Design components
- CSS-in-JS with Emotion for styling

## 📱 Responsive Design

The application is fully responsive and works well on:
- Desktop computers
- Tablets
- Mobile devices

Built with modern React patterns and TypeScript for scalability and maintainability.
