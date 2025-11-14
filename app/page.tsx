"use client"

import { useState, useEffect, useRef } from "react"
import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, MapPin, FileCode } from 'lucide-react'
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function MapViewer() {
  const { data, mutate } = useSWR("/api/location", fetcher, {
    refreshInterval: 2000,
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [locationInfo, setLocationInfo] = useState<{ city: string; country: string } | null>(null)
  const [countryMetadata, setCountryMetadata] = useState<any>(null)
  const [zoomLevel, setZoomLevel] = useState(7)
  const prevCoordsRef = useRef<{ lat: number; lng: number } | null>(null)
  const prevCountryRef = useRef<string | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await mutate()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const hasLocation = data?.lat != null && data?.lng != null
  const lat = data?.lat
  const lng = data?.lng

  useEffect(() => {
    if (!hasLocation) {
      return
    }

    if (
      !prevCoordsRef.current ||
      (lat !== prevCoordsRef.current.lat && Math.abs(lat - prevCoordsRef.current.lat) > 0.09) ||
      (lng !== prevCoordsRef.current.lng && Math.abs(lng - prevCoordsRef.current.lng) > 0.09)
    ) {
      setCurrentCoords({ lat, lng })
      prevCoordsRef.current = { lat, lng }

      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`, {
        headers: {
          "User-Agent": "MapViewerApp/1.0",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const city =
            data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Unknown"
          const country = data.address?.country || "Unknown"
          setLocationInfo({ city, country })
        })
        .catch((error) => {
          console.error("Reverse geocoding error:", error)
          setLocationInfo({ city: "Unknown", country: "Unknown" })
        })
    }
  }, [lat, lng, hasLocation])

  useEffect(() => {
    if (
      locationInfo?.country &&
      locationInfo.country !== "Unknown" &&
      locationInfo.country !== prevCountryRef.current
    ) {
      prevCountryRef.current = locationInfo.country

      fetch(`/api/country-metadata?country=${encodeURIComponent(locationInfo.country)}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`)
          }
          return res.text()
        })
        .then((html) => {
          setCountryMetadata(html)
        })
        .catch((error) => {
          console.error(" Country metadata fetch error:", error)
          setCountryMetadata(null)
        })
    }
  }, [locationInfo?.country])

  if (!hasLocation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1800px] px-6 py-8 sm:px-8 lg:px-12">
          <Card className="p-4 mb-6">
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">geowoot</h1>
                <p className="text-md text-muted-foreground">Real-time coordinate tracking and meta visualization</p>
              </div>
              <div className="flex gap-2 ml-auto">
                <Link href="/script">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <FileCode className="h-4 w-4" />
                    Script
                  </Button>
                </Link>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-12 flex flex-col items-center justify-center min-h-[600px] gap-6">
            <MapPin className="h-16 w-16 text-muted-foreground animate-pulse" />
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Waiting for Coordinates</h2>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1800px] px-6 py-8 sm:px-8 lg:px-12">
        <Card className="p-4 mb-6">
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">geowoot</h1>
              <p className="text-md text-muted-foreground">Real-time coordinate tracking and meta visualization</p>
            </div>

            {locationInfo && (
              <>
                <div className="rounded-lg p-3 border border-primary/20 min-w-[190px]">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Country:</div>
                  <div className="text-lg font-semibold text-foreground">{locationInfo.country}</div>
                </div>
                <div className="rounded-lg p-3 border border-primary/20 min-w-[190px]">
                  <div className="text-sm font-medium text-muted-foreground mb-1">City:</div>
                  <div className="text-lg font-semibold text-foreground">{locationInfo.city}</div>
                </div>
              </>
            )}
            <div className="rounded-lg p-3 border border-primary/20">
              <label htmlFor="zoom" className="text-xs font-medium text-muted-foreground mb-1 block">
                Map Zoom 1 (world) - 20 (street)
              </label>
              <Input
                id="zoom"
                type="number"
                min="1"
                max="20"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="font-mono"
              />
            </div>
            <div className="flex gap-2 ml-auto">
              <Link href="/script">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <FileCode className="h-4 w-4" />
                  Script
                </Button>
              </Link>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden p-0">
            <iframe
              width="100%"
              height="1000"
              style={{ border: 0, display: "block" }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${currentCoords?.lat},${currentCoords?.lng}&z=${zoomLevel}&output=embed`}
            />
          </Card>

          {countryMetadata && (
            <Card className="overflow-hidden p-0">
              <div
                className="country-metadata-content w-full h-[1000px] overflow-y-auto p-6 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: countryMetadata }}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
