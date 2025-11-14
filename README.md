# geowoot

Real-time coordinate tracking and geolocation metadata visualization application built with Next.js and TypeScript.

## Overview

geowoot is a modern web application that tracks real-time coordinates and displays geographical metadata including maps and country-specific information. It features a responsive UI with live updates, reverse geocoding, and integrated Google Maps visualization.

## Features

- **Real-time Coordinate Tracking**: Monitor and display live geographic coordinates
- **Reverse Geocoding**: Automatically convert coordinates to city and country names using OpenStreetMap's Nominatim
- **Interactive Maps**: Embedded Google Maps with adjustable zoom levels (1-20)
- **Country Metadata**: Display country-specific information fetched from geometas.com
- **Live Updates**: Automatic refresh with SWR for real-time data synchronization
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with PostCSS
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **State Management**: [SWR](https://swr.vercel.app/) for data fetching
- **Icons**: [Lucide React](https://lucide.dev/)

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── country-metadata/     # Fetch country metadata from geometas
│   │   └── location/              # Store and retrieve location coordinates
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Main map viewer page
│   └── script/                    # Script page for integration
├── components/
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── config.ts                  # Configuration
│   └── utils.ts                   # Utility functions
├── public/                        # Static assets
└── next.config.ts                 # Next.js configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd geowoot
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## API Endpoints

### GET `/api/location`
Retrieve the current stored location coordinates.

**Response:**
```json
{
  "lat": 40.7128,
  "lng": -74.0060,
  "timestamp": "2025-11-14T10:30:00.000Z"
}
```

### POST `/api/location`
Update the current location coordinates.

**Request Body:**
```json
{
  "lat": 40.7128,
  "lng": -74.0060
}
```

**Response:**
```json
{
  "success": true,
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "timestamp": "2025-11-14T10:30:00.000Z"
  }
}
```

### GET `/api/country-metadata?country=United%20States`
Fetch country metadata from geometas.com.

**Parameters:**
- `country` (required): Country name to fetch metadata for

**Response:** HTML content containing country information

## Usage

1. **Set Coordinates**: Send location data via POST to `/api/location`
2. **View on Map**: The main page automatically displays:
   - Interactive Google Maps at the provided coordinates
   - Country and city information (from reverse geocoding)
   - Country metadata in a side panel
3. **Adjust Zoom**: Use the zoom input (1-20) to change map detail level
4. **Refresh Data**: Click the refresh button to manually update coordinates

## External APIs

- **Google Maps**: Embedded maps display
- **OpenStreetMap Nominatim**: Reverse geocoding for coordinates to location names
- **geometas.com**: Country metadata source