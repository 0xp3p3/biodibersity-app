"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2 } from "lucide-react"

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

interface SpeciesSearchProps {
  onSpeciesSelect: (species: Species) => void
}

export function SpeciesSearch({ onSpeciesSelect }: SpeciesSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Species[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const searchSpecies = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`http://3.88.14.163:8000/api/species/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) throw new Error("Search failed")

      const data = await response.json()
      setResults(data.results || [])
      setShowResults(true)
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchSpecies(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, searchSpecies])

  const handleSpeciesClick = (species: Species) => {
    onSpeciesSelect(species)
    setShowResults(false)
    setQuery(species.vernacularName || species.scientificName)
  }

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true)
    }
  }

  const handleInputBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => setShowResults(false), 200)
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search for species (e.g., 'Passer domesticus', 'House Sparrow', 'Quercus')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="pl-10 pr-10 h-12 text-lg"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
        )}
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {results.map((species) => (
              <div
                key={species.key}
                className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                onClick={() => handleSpeciesClick(species)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{species.vernacularName || species.scientificName}</h3>
                    {species.vernacularName && <p className="text-gray-600 italic">{species.scientificName}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {species.kingdom}
                      </Badge>
                      {species.family && (
                        <Badge variant="outline" className="text-xs">
                          {species.family}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {species.rank}
                      </Badge>
                      {species.datasetKey && (
                        <Badge variant="outline" className="text-xs font-mono">
                          Dataset: {species.datasetKey.substring(0, 8)}...
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {showResults && results.length === 0 && query.length >= 2 && !loading && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50">
          <CardContent className="p-4 text-center text-gray-500">No species found for "{query}"</CardContent>
        </Card>
      )}
    </div>
  )
}
