import { NextRequest } from "next/server";

export const runtime = "nodejs";

const ALLOWED_AUDIO_HOST_PATTERNS = [
  "tikcdn.io",
  "tiktokcdn.com",
  "tiktokcdn-us.com",
  "tiktokv.com",
  "byteoversea.com",
];

function isAllowedAudioUrl(value: string) {
  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    return ALLOWED_AUDIO_HOST_PATTERNS.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const sourceUrl = request.nextUrl.searchParams.get("src");

  if (!sourceUrl || !isAllowedAudioUrl(sourceUrl)) {
    return new Response("Invalid audio source", { status: 400 });
  }

  const range = request.headers.get("range");

  try {
    const upstream = await fetch(sourceUrl, {
      headers: {
        ...(range ? { Range: range } : {}),
        // Ask the CDN for an uncompressed byte stream so Range math stays valid.
        "Accept-Encoding": "identity",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new Response("Failed to fetch audio", { status: upstream.status });
    }

    const responseHeaders = new Headers();
    const contentType =
      upstream.headers.get("content-type") ?? "audio/mpeg";
    const contentLength = upstream.headers.get("content-length");
    const contentRange = upstream.headers.get("content-range");
    const acceptRanges = upstream.headers.get("accept-ranges");
    const cacheControl = upstream.headers.get("cache-control");
    const contentDisposition = upstream.headers.get("content-disposition");
    const etag = upstream.headers.get("etag");
    const lastModified = upstream.headers.get("last-modified");

    responseHeaders.set("Content-Type", contentType);

    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    responseHeaders.set("Accept-Ranges", acceptRanges ?? "bytes");

    if (contentDisposition) {
      responseHeaders.set("Content-Disposition", contentDisposition);
    }

    if (etag) {
      responseHeaders.set("ETag", etag);
    }

    if (lastModified) {
      responseHeaders.set("Last-Modified", lastModified);
    }

    responseHeaders.set("Cache-Control", cacheControl ?? "no-store");

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Audio proxy failed", error);
    return new Response("Audio proxy failed", { status: 502 });
  }
}
