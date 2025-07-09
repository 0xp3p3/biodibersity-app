"use client"

import { useState } from "react"
import { SpeciesSearch } from "@/components/species-search"
import { SpeciesMap } from "@/components/species-map"
import { TimelineChart } from "@/components/timeline-chart"
import { PopularSpecies } from "@/components/popular-species"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, Database } from "lucide-react"

interface Species {
  key: number
  scientificName: string
  vernacularName: string
  kingdom: string
  phylum: string
  class: string
  order: string
  family: string
  genus: string
  species: string
  rank: string
  taxonomicStatus: string
  datasetKey: string
}

interface TimelineData {
  yearly: Array<{ year: number; count: number }>
  monthly: Array<{ month: string; count: number }>
  total_observations: number
  date_range: {
    earliest: number | null
    latest: number | null
  }
}

export default function Dashboard() {
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null)
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSpeciesSelect = async (species: Species) => {
    setSelectedSpecies(species)
    setLoading(true)
    setError(null)

    try {
      // Only fetch timeline data - map will use dataset key from species data
      const timelineResponse = await fetch(`http://3.88.14.163:8000/api/species/${species.key}/timeline?country=PL`)
      if (!timelineResponse.ok) throw new Error("Failed to fetch timeline data")
      const timeline = await timelineResponse.json()
      setTimelineData(timeline)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleClearSelection = () => {
    setSelectedSpecies(null)
    setTimelineData(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Species Observation Dashboard</h1>
          <p className="text-lg text-gray-600">Explore biodiversity data from Poland using GBIF database</p>
        </div>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Species Search
            </CardTitle>
            <CardDescription>
              Search for species by scientific or common name to view their observations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpeciesSearch onSpeciesSelect={handleSpeciesSelect} />
          </CardContent>
        </Card>

        {/* Selected Species Info */}
        {selectedSpecies && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {selectedSpecies.vernacularName || selectedSpecies.scientificName}
                  </CardTitle>
                  <CardDescription className="text-lg italic">{selectedSpecies.scientificName}</CardDescription>
                </div>
                <button onClick={handleClearSelection} className="text-sm text-gray-500 hover:text-gray-700">
                  Clear Selection
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{selectedSpecies.kingdom}</Badge>
                {selectedSpecies.phylum && <Badge variant="outline">{selectedSpecies.phylum}</Badge>}
                {selectedSpecies.class && <Badge variant="outline">{selectedSpecies.class}</Badge>}
                {selectedSpecies.family && <Badge variant="outline">{selectedSpecies.family}</Badge>}
                {selectedSpecies.datasetKey && (
                  <Badge variant="outline" className="font-mono text-xs">
                    Dataset: {selectedSpecies.datasetKey.substring(0, 8)}...
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading species data...</span>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4">
              <p className="text-red-600">Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Observation Map
                {timelineData && <Badge variant="secondary">{timelineData.total_observations} observations</Badge>}
              </CardTitle>
              <CardDescription>
                {selectedSpecies
                  ? `GBIF observation data for ${selectedSpecies.vernacularName || selectedSpecies.scientificName} in Poland`
                  : "Select a species to view observation locations"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden">
                <SpeciesMap selectedSpecies={selectedSpecies} />
              </div>
            </CardContent>
          </Card>

          {/* Timeline Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Observation Timeline
                {timelineData && <Badge variant="secondary">{timelineData.total_observations} total</Badge>}
              </CardTitle>
              <CardDescription>
                {selectedSpecies
                  ? `When ${selectedSpecies.vernacularName || selectedSpecies.scientificName} has been observed over time`
                  : "Select a species to view observation timeline"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                {timelineData ? (
                  <TimelineChart data={timelineData} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    {selectedSpecies ? "Loading timeline data..." : "No species selected"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Default Content - Popular Species */}
        {!selectedSpecies && (
          <>
            <Separator />
            <PopularSpecies onSpeciesSelect={handleSpeciesSelect} />
          </>
        )}
      </div>
    </div>
  )
}
