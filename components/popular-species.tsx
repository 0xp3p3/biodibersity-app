"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Eye } from "lucide-react"

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
  observationCount: number
}

interface PopularSpeciesProps {
  onSpeciesSelect: (species: Species) => void
}

export function PopularSpecies({ onSpeciesSelect }: PopularSpeciesProps) {
  const [species, setSpecies] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPopularSpecies = async () => {
      try {
        const response = await fetch("http://3.88.14.163:8000/api/popular-species")
        if (!response.ok) throw new Error("Failed to fetch popular species")

        const data = await response.json()
        setSpecies(data.species || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load popular species")
      } finally {
        setLoading(false)
      }
    }

    fetchPopularSpecies()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Popular Species in Poland</CardTitle>
          <CardDescription>Explore commonly observed species</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading popular species...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Popular Species in Poland</CardTitle>
          <CardDescription>Explore commonly observed species</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Species in Poland</CardTitle>
        <CardDescription>Explore commonly observed species to get started with the dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {species.map((speciesItem) => (
            <Card key={speciesItem.key} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{speciesItem.vernacularName || speciesItem.scientificName}</CardTitle>
                {speciesItem.vernacularName && (
                  <CardDescription className="italic">{speciesItem.scientificName}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {speciesItem.kingdom}
                  </Badge>
                  {speciesItem.family && (
                    <Badge variant="outline" className="text-xs">
                      {speciesItem.family}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {speciesItem.rank}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <Eye className="h-4 w-4 inline mr-1" />
                    {speciesItem.observationCount.toLocaleString()} observations
                  </div>
                </div>

                {speciesItem.datasetKey && (
                  <div className="text-xs text-gray-500 font-mono bg-gray-50 p-1 rounded">
                    Dataset: {speciesItem.datasetKey.substring(0, 8)}...
                  </div>
                )}

                <Button onClick={() => onSpeciesSelect(speciesItem)} className="w-full" size="sm">
                  View Observations
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
