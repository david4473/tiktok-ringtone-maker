module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/app/api/audio/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "runtime",
    ()=>runtime
]);
const runtime = "nodejs";
const ALLOWED_AUDIO_HOST_PATTERNS = [
    "tikcdn.io",
    "tiktokcdn.com",
    "tiktokcdn-us.com",
    "tiktokv.com",
    "byteoversea.com"
];
function isAllowedAudioUrl(value) {
    try {
        const url = new URL(value);
        if (![
            "http:",
            "https:"
        ].includes(url.protocol)) {
            return false;
        }
        return ALLOWED_AUDIO_HOST_PATTERNS.some((host)=>url.hostname === host || url.hostname.endsWith(`.${host}`));
    } catch  {
        return false;
    }
}
async function GET(request) {
    const sourceUrl = request.nextUrl.searchParams.get("src");
    if (!sourceUrl || !isAllowedAudioUrl(sourceUrl)) {
        return new Response("Invalid audio source", {
            status: 400
        });
    }
    const range = request.headers.get("range");
    try {
        const upstream = await fetch(sourceUrl, {
            headers: range ? {
                Range: range
            } : undefined,
            redirect: "follow",
            cache: "no-store"
        });
        if (!upstream.ok && upstream.status !== 206) {
            return new Response("Failed to fetch audio", {
                status: upstream.status
            });
        }
        const responseHeaders = new Headers();
        const contentType = upstream.headers.get("content-type") ?? "audio/mpeg";
        const contentLength = upstream.headers.get("content-length");
        const contentRange = upstream.headers.get("content-range");
        const acceptRanges = upstream.headers.get("accept-ranges");
        const cacheControl = upstream.headers.get("cache-control");
        responseHeaders.set("Content-Type", contentType);
        if (contentLength) {
            responseHeaders.set("Content-Length", contentLength);
        }
        if (contentRange) {
            responseHeaders.set("Content-Range", contentRange);
        }
        if (acceptRanges) {
            responseHeaders.set("Accept-Ranges", acceptRanges);
        }
        responseHeaders.set("Cache-Control", cacheControl ?? "no-store");
        return new Response(upstream.body, {
            status: upstream.status,
            headers: responseHeaders
        });
    } catch (error) {
        console.error("Audio proxy failed", error);
        return new Response("Audio proxy failed", {
            status: 502
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__88b4ced5._.js.map