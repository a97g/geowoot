"use client"

import { BASE_URL } from "@/lib/config"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ArrowLeft } from 'lucide-react'
import { useState } from "react"
import Link from "next/link"

export default function ScriptPage() {
  const [copied, setCopied] = useState(false)

  const scriptContent = `// ==UserScript==
// @name         geowoot
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Receive geoguessr location to any device.
// @author       0x978 modified by a97g
// @match        https://www.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        GM_webRequest
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

// ====================================Overwriting Fetch====================================

var originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
    if (method.toUpperCase() === 'POST' &&
        (url.startsWith('https://maps.googleapis.com/$rpc/google.internal.maps.mapsjs.v1.MapsJsInternalService/GetMetadata') ||
            url.startsWith('https://maps.googleapis.com/$rpc/google.internal.maps.mapsjs.v1.MapsJsInternalService/SingleImageSearch'))) {

        this.addEventListener('load', function () {
            const pattern = /-?\\d+\\.\\d+,-?\\d+\\.\\d+/g;
            const match = this.responseText.match(pattern);
            if (match && match[0]) {
                const [lat, lng] = match[0].split(",").map(Number);
                sendCoords(lat, lng);
            }
        });
    }
    return originalOpen.apply(this, arguments);
};


// ====================================Send To Server====================================
function sendCoords(lat, lng) {
    cleanFetch.fetch("${BASE_URL}/api/location", {
        method: "POST",
        body: JSON.stringify({
            "lat":lat,
            "lng":lng
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });
}

// ====================================Misc====================================
// Let's make sure our fetch is Js fetch and not overwritten.
const frame = document.createElement('iframe');
frame.style.display = 'none';
frame.src = 'about:blank';
document.body.appendChild(frame);
const win = frame.contentWindow;
x = {frame, win}
const cleanFetch = {
    fetch: win.fetch.bind(win),
    Headers: win.Headers,
    Request: win.Request,
    Response: win.Response,
    close: () => frame.remove()
};`

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1400px] px-6 py-8 sm:px-8 lg:px-12">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Map
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Tampermonkey Script</h1>
            <p className="text-sm text-muted-foreground">Copy this script to use with Tampermonkey for GeoGuessr</p>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Script Content</h2>
            <Button onClick={handleCopy} variant="outline" size="sm" className="gap-2">
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy Script"}
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre">
            {scriptContent}
          </pre>
        </Card>
      </div>
    </div>
  )
}
