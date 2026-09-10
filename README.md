# JaxCam

Live traffic camera viewer for Jacksonville, Florida. Fetches real-time camera feeds from the Florida Department of Transportation (FDOT) FL511 public service and displays them on an interactive dark-themed map and filterable list.

## Features

- **Live FDOT Camera Feeds** -- Pulls real-time still images from FDOT's public ArcGIS REST service (no API key required)
- **Interactive Map** -- Full-screen Leaflet map with CARTO dark basemap, custom camera markers, and grid-based clustering
- **Search & Filter** -- Text search and highway/road filter chips (I-95, I-295, I-10, US-1, etc.)
- **Near Me** -- Geolocation-based discovery with 30-mile radius sorting
- **Favorites** -- Save cameras to a favorites tab, persisted in localStorage
- **Live Detail View** -- Full-screen camera feed with auto-refresh every 15 seconds, Google Maps directions, and camera metadata
- **PWA Support** -- Installable as a Progressive Web App with offline shell caching
- **Dark Theme** -- Console-style dark UI with slate backgrounds and orange accents

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (bundled with Node.js)

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens the app at `http://localhost:5173` with hot module replacement.

### Production Build

```bash
npm run build
```

Outputs the optimized build to `dist/`.

### Preview Production Build

```bash
npm run preview
```

### Type Check

```bash
npm run typecheck
```

## How It Works

1. On load, the app fetches the complete FDOT FL511 traffic camera catalog via their public ArcGIS Feature Service
2. Cameras are filtered to the Jacksonville metropolitan area (Duval, Clay, St. Johns, and Nassau counties)
3. The map view displays cameras as clustered markers on a dark basemap; the list view shows a searchable, paginated card grid
4. Tapping a camera opens a full-screen live view that auto-refreshes every 15 seconds
5. Users can filter by highway, search by text, find cameras near their location, and save favorites

## Project Structure

```
src/
  api/          API client and FDOT service configuration
  components/   React UI components (map, list, detail, navigation)
  hooks/        Custom React hooks (cameras, favorites, geolocation)
  types/        TypeScript type definitions
  utils/        Formatting, storage, and math utilities
public/         PWA manifest, service worker, icons
```

## Tech Stack

- [React 19](https://react.dev/)
- [TypeScript 6](https://www.typescriptlang.org/)
- [Vite 8](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Leaflet](https://leafletjs.com/) via [react-leaflet](https://react-leaflet.js.org/)
- [Lucide React](https://lucide.dev/) icons

## License

This project uses publicly available data from the Florida Department of Transportation. Camera data is sourced from the [FL511 ArcGIS Feature Service](https://fl511.com).
