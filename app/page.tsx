"use client"

import { useState, useEffect, useRef } from "react"
import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, MapPin, FileCode, Moon, Sun, Power, PowerOff } from 'lucide-react'
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
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showInfo, setShowInfo] = useState(true)
  const [showMap, setShowMap] = useState(true)
  const [showMetas, setShowMetas] = useState(true)
  const prevCoordsRef = useRef<{ lat: number; lng: number } | null>(null)
  const prevCountryRef = useRef<string | null>(null)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

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
  
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1800px] px-6 py-8 sm:px-8 lg:px-12">
        <Card className="p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">geowoot</h1>
                <p className="text-md text-muted-foreground">Real-time coordinate tracking and meta visualization</p>
              </div>

              {showInfo && (
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                {hasLocation && (
                  <>
                    {locationInfo && (
                      <>
                        <div className="rounded-lg p-3 border border-primary/20 flex-1">
                          <div className="text-sm font-medium text-muted-foreground mb-1">Country:</div>
                          <div className="text-lg font-semibold text-foreground">{locationInfo.country}</div>
                        </div>
                        <div className="rounded-lg p-3 border border-primary/20 flex-1">
                          <div className="text-sm font-medium text-muted-foreground mb-1">City:</div>
                          <div className="text-lg font-semibold text-foreground">{locationInfo.city}</div>
                        </div>
                      </>
                    )}
                    <div className="rounded-lg p-3 border border-primary/20 flex-1">
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
                  </>
                )}
              </div>
            )}

              <div className="flex flex-col sm:flex-row gap-2 md:ml-auto">
                <Link href="/script">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent w-full sm:w-auto">
                    <FileCode className="h-4 w-4" />
                    Script
                  </Button>
                </Link>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent w-full sm:w-auto"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                onClick={() => setShowInfo(!showInfo)}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                {showInfo ? <Power className="h-4 w-4" />: <PowerOff className="h-4 w-4" />}
                Info
              </Button>
              <Button
                onClick={() => setShowMap(!showMap)}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                {showMap ? <Power className="h-4 w-4" />: <PowerOff className="h-4 w-4" />}
                Map
              </Button>
              <Button
                onClick={() => setShowMetas(!showMetas)}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                {showMetas ? <Power className="h-4 w-4" />: <PowerOff className="h-4 w-4" />}
                Metas
              </Button>
              <Button
                onClick={() => setIsDarkMode(!isDarkMode)}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                {!isDarkMode ? <><Sun className="h-4 w-4" />  Light Mode</> : <><Moon className="h-4 w-4" /> Dark Mode</>}
              </Button>
            </div>
          </div>
        </Card>

        {!hasLocation && (
          <div className="rounded-lg p-6 border border-primary/20 flex-1 flex flex-col items-center justify-center gap-3 h-[50vh]">
            <MapPin className="h-8 w-8 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Waiting for coordinates...</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {showMap && hasLocation && currentCoords && (
            <Card className="overflow-hidden p-0">
              <iframe
                width="100%"
                height="1000"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}&z=${zoomLevel}&output=embed`}
              />
            </Card>
          )}

          {showMetas && hasLocation && countryMetadata && (
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
