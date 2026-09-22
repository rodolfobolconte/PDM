const ORIGIN_PERMITIDA = "*";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ORIGIN_PERMITIDA,
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function jsonResponse(body, init = {}) {
  return Response.json(body, {
    ...init,
    headers: { ...CORS_HEADERS, ...(init.headers || {}) },
  });
}

export function optionsResponse() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
