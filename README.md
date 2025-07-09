# Species Observation Dashboard

A comprehensive dashboard for visualizing species observations from the GBIF (Global Biodiversity Information Facility) database, focused on Poland's biodiversity data.

## Features

### Core Functionality
- **Species Search**: Search for species by scientific or vernacular names with real-time autocomplete
- **Interactive Map**: Visualize species observation locations on an interactive map of Poland
- **Timeline Analysis**: View temporal patterns of species observations with yearly and monthly trends
- **Popular Species**: Explore commonly observed species as a starting point

### Technical Features
- **FastAPI Backend**: High-performance Python backend with async operations
- **React Frontend**: Modern, responsive user interface built with Next.js
- **Real-time Data**: Direct integration with GBIF API for up-to-date biodiversity data
- **Interactive Visualizations**: Charts and maps for comprehensive data exploration
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Architecture

### Backend (FastAPI)
- **Species Search API**: Proxy to GBIF species search with filtering and formatting
- **Occurrence Data API**: Retrieves and processes species observation data
- **Timeline API**: Aggregates temporal data for visualization
- **Popular Species API**: Provides curated list of commonly observed species
- **CORS Support**: Configured for frontend integration
- **Error Handling**: Comprehensive error handling and logging

### Frontend (React/Next.js)
- **Species Search Component**: Autocomplete search with debounced API calls
- **Interactive Map**: Leaflet-based map with custom markers and popups
- **Timeline Charts**: Recharts-powered visualizations for temporal data
- **Popular Species Grid**: Curated species recommendations
- **Responsive Layout**: Tailwind CSS with shadcn/ui components

## API Endpoints

### Species Search
```
GET /api/species/search?q={query}
```
Search for species by name with autocomplete suggestions.

### Species Occurrences
```
GET /api/species/{species_key}/occurrences?limit=300&country=PL
```
Get observation locations for a specific species.

### Species Timeline
```
GET /api/species/{species_key}/timeline?country=PL
```
Get temporal observation data for timeline visualization.

### Popular Species
```
GET /api/popular-species?country=PL
```
Get list of commonly observed species for default view.

## Installation & Setup

### Backend Setup
1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the FastAPI server:
```bash
python main.py
```
The API will be available at \`http://3.88.14.163:8000\`

### Frontend Setup
1. Install Node.js dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```
The application will be available at \`http://localhost:3000\`

## Data Sources

- **GBIF API**: Global Biodiversity Information Facility
  - Species search: \`https://api.gbif.org/v1/species/search\`
  - Occurrence data: \`https://api.gbif.org/v1/occurrence/search\`
- **Geographic Focus**: Poland (country code: PL)
- **Data Filtering**: Coordinates validated, geospatial issues filtered out

## Performance Optimizations

### Backend Optimizations
- **Async HTTP Client**: Non-blocking API calls to GBIF
- **Request Debouncing**: Prevents excessive API calls during search
- **Data Filtering**: Server-side filtering reduces payload size
- **Error Handling**: Graceful degradation with proper error responses

### Frontend Optimizations
- **Debounced Search**: 300ms delay prevents excessive API calls
- **Lazy Loading**: Components load data only when needed
- **Efficient Re-renders**: React optimization patterns
- **Responsive Images**: Optimized map tiles and markers

## Styling Approach

### Design System
- **Tailwind CSS**: Utility-first CSS framework for rapid development
- **shadcn/ui**: High-quality, accessible component library
- **Responsive Design**: Mobile-first approach with breakpoint-specific layouts
- **Color Palette**: Blue and green theme reflecting nature and data visualization

### Visual Hierarchy
- **Card-based Layout**: Clear content separation and organization
- **Typography Scale**: Consistent text sizing and spacing
- **Interactive Elements**: Hover states and loading indicators
- **Data Visualization**: Color-coded charts and map markers

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Support**: iOS Safari, Chrome Mobile
- **Map Compatibility**: Leaflet.js ensures broad browser support

## Future Enhancements

### Potential Features
- **Advanced Filters**: Date range, observation type, data quality filters
- **Export Functionality**: Download data as CSV/JSON
- **Comparison Mode**: Compare multiple species side-by-side
- **User Preferences**: Save favorite species and search history
- **Offline Support**: Cache popular species data for offline viewing

### Performance Improvements
- **Caching Layer**: Redis for frequently accessed data
- **Database Integration**: Local database for faster queries
- **CDN Integration**: Faster asset delivery
- **Progressive Web App**: Enhanced mobile experience