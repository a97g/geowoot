import https from 'https'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const country = searchParams.get("country")

  if (!country) {
    return Response.json({ error: "Country parameter required" }, { status: 400 })
  }

  const formattedCountry = country.toLowerCase().replace(/ /g, "_")

  try {
    const url = `https://geometas.com/metas/countries/${formattedCountry}/`

    // Use a Promise wrapper around https.get
    const html = await new Promise<string>((resolve, reject) => {
      const options = {
        headers: {
          "User-Agent": "MapViewerApp/1.0",
        },
        rejectUnauthorized: false // Disable SSL verification
      }

      https.get(url, options, (res) => {
        let data = ''

        if (res.statusCode === 404) {
          resolve('<p>No metadata available for this country.</p>')
          return
        }

        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`))
          return
        }

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          resolve(data)
        })
      }).on('error', (err) => {
        reject(err)
      })
    })

    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    const mainContent = mainMatch ? mainMatch[1] : html

    return new Response(mainContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("Country metadata fetch error:", error)
    return new Response(
      `<p class="text-muted-foreground">Unable to load metadata for this country.</p>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
