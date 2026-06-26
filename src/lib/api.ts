/**
 * lib/api.ts — URL base de la VINT-API (FastAPI Python).
 *
 * En desarrollo apunta a http://127.0.0.1:8000
 * En producción se lee de NEXT_PUBLIC_API_URL (ej. https://vint-api-production.up.railway.app)
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
