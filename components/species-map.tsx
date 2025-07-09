"use client";

import { useMemo } from "react";

interface Species {
  key: number;
  scientificName: string;
  vernacularName: string;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
  rank: string;
  taxonomicStatus: string;
  datasetKey: string;
}

interface SpeciesMapProps {
  selectedSpecies: Species | null;
}

export function SpeciesMap({ selectedSpecies }: SpeciesMapProps) {
  // Generate tile URLs for Poland region (zoom level 6)
  const generateTileGrid = () => {
    const zoom = 6;
    const tiles = [];

    // Poland roughly covers these tile coordinates at zoom 6
    for (let y = 12; y <= 14; y++) {
      for (let x = 69; x <= 72; x++) {
        tiles.push({ x, y, z: zoom });
      }
    }
    return tiles;
  };

  const tiles = useMemo(() => generateTileGrid(), []);

  if (!selectedSpecies || !selectedSpecies.datasetKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center space-y-2">
          <div className="text-4xl">🗺️</div>
          <p className="text-gray-600">
            {!selectedSpecies
              ? "Select a species to view observation locations"
              : "No dataset key available for this species"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-blue-50 rounded-lg p-4">
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            GBIF Observation Map - Poland
          </h3>
          <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
            Dataset: {selectedSpecies.datasetKey.substring(0, 8)}...
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Showing observations for:</span>
          <span className="font-medium">
            {selectedSpecies.vernacularName || selectedSpecies.scientificName}
          </span>
        </div>

        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
          <div className="font-mono">
            Dataset Key: {selectedSpecies.datasetKey}
          </div>
        </div>
      </div>

      <div className="relative">
        {/* GBIF Tile Map */}
        <div className="border border-gray-300 rounded bg-white overflow-hidden">
          <div
            className="grid grid-cols-4 gap-0"
            style={{ width: "320px", height: "240px", position: "absolute", zIndex: 2}}
          >
            {tiles.map((tile) => (
              <img
                key={`${tile.z}-${tile.x}-${tile.y}`}
                src={`http://3.88.14.163:8000/api/map/${tile.z}/${tile.x}/${tile.y}?dataset_key=${selectedSpecies.datasetKey}`}
                alt={`Map tile ${tile.x},${tile.y}`}
                className="w-full h-full object-cover"
                style={{ width: "80px", height: "80px" }}
                // onError={(e) => {
                //   // Fallback to base map if observation tile fails to load
                //   const target = e.target as HTMLImageElement;
                //   target.src = `http://3.88.14.163:8000/api/map/tile/${tile.z}/${tile.x}/${tile.y}`;
                //   target.style.backgroundColor = "#f3f4f6";
                // }}
              />
            ))}
          </div>

          <div
            className="grid grid-cols-4 gap-0"
            style={{ width: "320px", height: "240px", zIndex: 1 }}
          >
            {tiles.map((tile) => (
              <img
                key={`${tile.z}-${tile.x}-${tile.y}`}
                src={`http://3.88.14.163:8000/api/map/tile/${tile.z}/${tile.x}/${tile.y}?dataset_key=${selectedSpecies.datasetKey}`}
                alt={`Map tile ${tile.x},${tile.y}`}
                className="w-full h-full object-cover"
                style={{ width: "80px", height: "80px" }}
                onError={(e) => {
                  // Fallback to base map if observation tile fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = `http://3.88.14.163:8000/api/map/tile/${tile.z}/${tile.x}/${tile.y}`;
                  target.style.backgroundColor = "#f3f4f6";
                }}
              />
            ))}
          </div>

          <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs">
            GBIF Observation Data
          </div>
          <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs">
            Zoom Level: 6
          </div>
        </div>
      </div>

      {/* Map Info */}
      <div className="mt-4 p-3 bg-white rounded border">
        <h4 className="font-medium mb-2">Map Information:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>• Observation density shown as colored circles</div>
          <div>• Larger/darker circles indicate more observations</div>
          <div>• Data filtered by dataset key from GBIF</div>
          <div>• Source: Global Biodiversity Information Facility (GBIF)</div>
        </div>
      </div>
    </div>
  );
}
