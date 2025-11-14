import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

let currentLocation: {
  lat: number
  lng: number
  timestamp: string
} | null = null

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (typeof body.lat !== "number" || typeof body.lng !== "number") {
      return NextResponse.json(
        { error: "Invalid coordinates. Both lat and lng must be numbers." },
        { status: 400, headers: corsHeaders },
      )
    }

    if (body.lat < -90 || body.lat > 90) {
      return NextResponse.json({ error: "Latitude must be between -90 and 90." }, { status: 400, headers: corsHeaders })
    }

    if (body.lng < -180 || body.lng > 180) {
      return NextResponse.json(
        { error: "Longitude must be between -180 and 180." },
        { status: 400, headers: corsHeaders },
      )
    }

    currentLocation = {
      lat: body.lat,
      lng: body.lng,
      timestamp: new Date().toISOString(),
    }

    console.log("Location updated:", currentLocation)

    return NextResponse.json(
      {
        success: true,
        location: currentLocation,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Error parsing request:", error)
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders })
  }
}

export async function GET() {
  return NextResponse.json(currentLocation, { headers: corsHeaders })
}
