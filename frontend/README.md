# StayHive Frontend — React 19, Vite & Tailwind CSS

The StayHive frontend delivers an ultra-luxurious, responsive, and animated user interface designed for both guest bookings and hotel back-office operations.

---

## 🎨 Design Philosophy & Features

- **Typography**: Plus Jakarta Sans for clean modern luxury.
- **Micro-Animations**: Framer Motion transitions, spring cards, and celebration confetti.
- **Dark & Light Mode**: Seamless global theme toggle with automatic persistence.
- **Glassmorphism**: Backdrop blur headers, frosted cards, and floating quick actions.
- **Live Reactive State**: `DatabaseContext` centralizes state across 19 endpoints with automatic refetches on every mutation.
- **Command Palette (`Ctrl+K`)**: Keyboard-driven navigation across all application views.

---

## 🧭 Project Structure

```
frontend/
├── index.html                # App root with Plus Jakarta Sans & SEO meta tags
├── package.json
├── vite.config.ts            # Vite 8 config
├── tsconfig.json             # TypeScript project config
├── src/
│   ├── index.css             # Tailwind base & glassmorphism utilities
│   ├── main.tsx              # React DOM entry point
│   ├── App.tsx               # Route configurations across all roles
│   ├── api/
│   │   └── client.ts         # Axios instance with JWT interceptor
│   ├── types/
│   │   └── database.ts       # TypeScript interfaces for all 33 database entities
│   ├── context/
│   │   ├── AuthContext.tsx         # User session & 6-role quick switcher
│   │   ├── DatabaseContext.tsx     # Full reactive synchronization with Django REST API
│   │   ├── NotificationContext.tsx # Animated floating toasts
│   │   └── ThemeContext.tsx        # Dark/Light mode engine
│   ├── components/
│   │   ├── ui/               # Button, Badge, Card, Modal, Input, Skeleton, EmptyState
│   │   ├── layout/           # Header, Sidebar, MobileNav, CommandPalette, AppLayout
│   │   ├── dashboard/        # Admin, Reception, Housekeeping, Restaurant, Customer dashboards
│   │   └── room/             # RoomGrid, RoomCard, Status modals
│   └── pages/                # Landing, BookingWizard, Rooms, Invoices, Dining, etc.
```

---

## 🛠️ Development & Production Build

```bash
# Install dependencies
npm install

# Start Vite dev server on port 5173
npm run dev -- --host 127.0.0.1 --port 5173

# Compile TypeScript and bundle production assets
npm run build

# Preview production build
npm run preview
```
