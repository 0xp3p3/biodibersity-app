from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import httpx
import asyncio
from typing import List, Optional, Dict, Any
import json
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Species Dashboard API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GBIF API base URLs
GBIF_API_BASE = "https://api.gbif.org/v1"
GBIF_MAP_BASE = "https://api.gbif.org/v2/map/occurrence/density"
GBIF_TILE_BASE = "https://tile.gbif.org/4326/omt"


@app.on_event("shutdown")
async def shutdown_event():
    pass  # No need to close client here as it's managed within async with blocks


@app.get("/")
async def root():
    return {"message": "Species Dashboard API", "version": "1.0.0"}


@app.get("/api/species/search")
async def search_species(q: str = Query(..., min_length=2)):
    """Search for species using GBIF API"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{GBIF_API_BASE}/species/search",
                params={"q": q, "status": "ACCEPTED"},
            )
            response.raise_for_status()
            data = response.json()

            # Filter and format results
            results = []
            for result in data.get("results", []):
                if result.get("taxonomicStatus") == "ACCEPTED":
                    results.append(
                        {
                            "key": result.get("key"),
                            "scientificName": result.get("scientificName", ""),
                            "vernacularName": result.get("vernacularNames", [{}])[
                                0
                            ].get("vernacularName")
                            if result.get("vernacularNames")
                            else None,
                            "kingdom": result.get("kingdom", ""),
                            "phylum": result.get("phylum", ""),
                            "class": result.get("class", ""),
                            "order": result.get("order", ""),
                            "family": result.get("family", ""),
                            "genus": result.get("genus", ""),
                            "species": result.get("species", ""),
                            "rank": result.get("rank", ""),
                            "taxonomicStatus": result.get("taxonomicStatus", ""),
                            "datasetKey": result.get("datasetKey", ""),
                        }
                    )

            return {"results": results}

    except httpx.RequestError as e:
        logger.error(f"Request error: {e}")
        raise HTTPException(status_code=500, detail="Failed to search species")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/map/tile/{z}/{x}/{y}")
async def get_map_tile(z: int, x: int, y: int, dataset_key: Optional[str] = None):
    """Get map tiles from GBIF using dataset key"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            if dataset_key:
                url = f"{GBIF_TILE_BASE}/{z}/{x}/{y}@1x.png"
                response = await client.get(url, params={"style": "gbif-tuatara"})

            response.raise_for_status()

            return StreamingResponse(
                iter([response.content]),
                media_type="image/png",
                headers={
                    "Cache-Control": "public, max-age=3600",
                    "Access-Control-Allow-Origin": "*",
                },
            )

    except httpx.RequestError as e:
        logger.error(f"Request error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch map tile")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/map/{z}/{x}/{y}")
async def get_map_tile(z: int, x: int, y: int, dataset_key: Optional[str] = None):
    """Get map tiles from GBIF"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Get observation tiles
            params = {
                "srs": "EPSG:4326",
                "bin": "hex",  # Adding bin as hex
                "hexPerTile": "179",  # Adding hexPerTile as 179
                "dataset_key": dataset_key,  # Fixed datasetKey
                "country": "PL",  # Replace "PL" with the actual country code
                "style": "classic.poly",  # Original style as requested
            }

            url = f"{GBIF_MAP_BASE}/{z}/{x}/{y}@1x.png"
            response = await client.get(url, params=params)

            # Get base map tiles (fallback logic can be added if needed)
            # Uncomment and modify the following lines if needed
            # if response.status_code != 200:
            #     base_url = f"{GBIF_TILE_BASE}/{z}/{x}/{y}@1x.png"
            #     response = await client.get(base_url, params={"style": "gbif-geyser-en", "srs": "EPSG:4326"})

            response.raise_for_status()

            return StreamingResponse(
                iter([response.content]),
                media_type="image/png",
                headers={
                    "Cache-Control": "public, max-age=3600",
                    "Access-Control-Allow-Origin": "*",
                },
            )

    except httpx.RequestError as e:
        logger.error(f"Request error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch map tile")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/species/{species_key}/timeline")
async def get_species_timeline(species_key: int, country: str = "PL"):
    """Get timeline data for species observations"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Get occurrence search to build timeline
            response = await client.get(
                f"{GBIF_API_BASE}/occurrence/search",
                params={
                    "taxon_key": species_key,
                    "country": country,
                    # "limit": 300,
                    "hasCoordinate": True,
                    "hasGeospatialIssue": False,
                },
            )
            response.raise_for_status()
            data = response.json()

            # Process timeline data
            yearly_counts = {}
            monthly_counts = {}
            total_observations = data.get("count", 0)
            earliest_year = None
            latest_year = None

            for result in data.get("results", []):
                year = result.get("year")
                month = result.get("month")

                if year:
                    yearly_counts[year] = yearly_counts.get(year, 0) + 1
                    if earliest_year is None or year < earliest_year:
                        earliest_year = year
                    if latest_year is None or year > latest_year:
                        latest_year = year

                if month:
                    month_names = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ]
                    month_name = (
                        month_names[month - 1] if 1 <= month <= 12 else str(month)
                    )
                    monthly_counts[month_name] = monthly_counts.get(month_name, 0) + 1

            # Format timeline data
            yearly_data = [
                {"year": year, "count": count}
                for year, count in sorted(yearly_counts.items())
            ]
            monthly_data = [
                {"month": month, "count": count}
                for month, count in monthly_counts.items()
            ]

            return {
                "yearly": yearly_data,
                "monthly": monthly_data,
                "total_observations": total_observations,
                "date_range": {"earliest": earliest_year, "latest": latest_year},
            }

    except httpx.RequestError as e:
        logger.error(f"Request error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch timeline data")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/popular-species")
async def get_popular_species():
    """Get popular species from Poland for default display"""
    popular_species_keys = [
        2492010,  # Passer domesticus (House Sparrow)
        2492048,  # Turdus merula (Common Blackbird)
        2492584,  # Corvus cornix (Hooded Crow)
        2492321,  # Sturnus vulgaris (European Starling)
        2492670,  # Pica pica (Eurasian Magpie)
        2492017,  # Passer montanus (Eurasian Tree Sparrow)
    ]

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            tasks = []
            for key in popular_species_keys:
                task = client.get(f"{GBIF_API_BASE}/species/{key}")
                tasks.append(task)

            responses = await asyncio.gather(*tasks, return_exceptions=True)

            species_list = []
            for i, response in enumerate(responses):
                if isinstance(response, Exception):
                    continue

                try:
                    response.raise_for_status()
                    data = response.json()

                    # Get observation count for Poland
                    count_response = await client.get(
                        f"{GBIF_API_BASE}/occurrence/search",
                        params={
                            "taxonKey": popular_species_keys[i],
                            "country": "PL",
                        },
                    )
                    count_data = count_response.json()
                    observation_count = count_data.get("count", 0)

                    species_info = {
                        "key": data.get("key"),
                        "scientificName": data.get("scientificName", ""),
                        "vernacularName": data.get("vernacularNames", [{}])[0].get(
                            "vernacularName"
                        )
                        if data.get("vernacularNames")
                        else None,
                        "kingdom": data.get("kingdom", ""),
                        "phylum": data.get("phylum", ""),
                        "class": data.get("class", ""),
                        "order": data.get("order", ""),
                        "family": data.get("family", ""),
                        "genus": data.get("genus", ""),
                        "species": data.get("species", ""),
                        "rank": data.get("rank", ""),
                        "taxonomicStatus": data.get("taxonomicStatus", ""),
                        "datasetKey": data.get("datasetKey", ""),
                        "observationCount": observation_count,
                    }
                    species_list.append(species_info)

                except Exception as e:
                    logger.error(
                        f"Error processing species {popular_species_keys[i]}: {e}"
                    )
                    continue

            return {"species": species_list}

    except Exception as e:
        logger.error(f"Error fetching popular species: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch popular species")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
