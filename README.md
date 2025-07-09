# Kitbash - Modern React TypeScript App

A modern React application built with the latest technologies, featuring MUI components, Redux Toolkit for state management, and React Router for navigation.

## 🚀 Technologies Used

- **React 18** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - React component library with Material Design
- **Redux Toolkit** - Modern Redux with simplified syntax
- **React-Redux** - Official React bindings for Redux
- **React Router** - Declarative routing for React applications
- **Emotion** - CSS-in-JS library for styling MUI components

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   └── layout/         # Layout components
│       └── Layout.tsx  # Main layout with sidebar navigation
├── pages/              # Page components
│   ├── HomePage.tsx    # Landing page with project overview
│   ├── CounterPage.tsx # Counter demo page
│   └── TodoPage.tsx    # Todo list demo page
├── store/              # Redux store configuration
│   ├── store.ts        # Main store configuration
│   ├── counterSlice.ts # Counter state slice
│   └── todoSlice.ts    # Todo state slice
├── hooks/              # Custom React hooks
│   └── redux.ts        # Typed Redux hooks
├── types/              # TypeScript type definitions
├── App.tsx             # Main App component with routing
└── main.tsx            # Application entry point
```

## 🎯 Features

### Navigation
- **Responsive sidebar navigation** - Collapsible on mobile devices
- **Active route highlighting** - Visual indication of current page
- **Mobile-friendly** - Hamburger menu for mobile navigation

### Home Page
- **Welcome dashboard** - Overview of technologies and features
- **Technology showcase** - Interactive chips showing the tech stack
- **Feature descriptions** - Details about each demo page

### Counter Demo
- **Redux state management** - Increment/decrement operations
- **Custom amount input** - Add specific values to counter
- **Reset functionality** - Clear counter back to zero
- **Modern MUI styling** - Button groups and responsive design

### Todo List Demo
- **Full CRUD operations** - Create, read, update, delete todos
- **Toggle completion** - Mark todos as complete/incomplete
- **Bulk actions** - Clear all completed todos
- **Real-time counters** - Active and completed item counts
- **Persistent state** - Redux maintains state across navigation

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

## 🧭 Navigation

The application features a responsive sidebar navigation with the following routes:

- **Home** (`/`) - Welcome page and project overview
- **Counter Demo** (`/counter`) - Redux counter implementation
- **Todo List Demo** (`/todos`) - Full CRUD todo application

## 🔧 Development

The application uses:
- **Hot Module Replacement (HMR)** for fast development
- **TypeScript strict mode** for type safety
- **Redux DevTools** compatible store
- **Material-UI theming** for consistent styling
- **Client-side routing** with React Router
- **Responsive design** that works on all screen sizes

## 🎨 Styling

The app uses Material-UI's theming system with:
- **Custom primary and secondary colors**
- **Responsive design patterns**
- **Consistent Material Design components**
- **CSS-in-JS with Emotion** for component styling
- **Mobile-first responsive navigation**

## 📱 Responsive Design

The application is fully responsive and includes:
- **Desktop navigation** - Persistent sidebar for large screens
- **Tablet navigation** - Collapsible sidebar for medium screens
- **Mobile navigation** - Hamburger menu for small screens
- **Touch-friendly interactions** - Optimized for mobile devices

## 🏗️ Architecture

The application follows modern React patterns:
- **Component-based architecture** with clear separation of concerns
- **Redux Toolkit** for predictable state management
- **TypeScript** for type safety and developer experience
- **Route-based code splitting** for optimal performance
- **Reusable components** and custom hooks

Built with modern React patterns and TypeScript for scalability and maintainability.
