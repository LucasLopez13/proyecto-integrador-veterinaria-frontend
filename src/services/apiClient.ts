import { API_CONFIG } from "../constants";

interface RequestOptions extends RequestInit {
  token?: string | null;
}

/**
 * Cliente HTTP unificado para el frontend de la veterinaria.
 * Inyecta automáticamente el token JWT desde localStorage y gestiona errores normalizados.
 */
export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers = {}, ...rest } = options;
  const authToken = token !== undefined ? token : localStorage.getItem("token");

  const combinedHeaders: HeadersInit = {
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...headers,
  };

  const url = endpoint.startsWith("http") ? endpoint : `${API_CONFIG.BASE_URL}${endpoint}`;
  const response = await fetch(url, { headers: combinedHeaders, ...rest });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message =
      errorBody.error ||
      errorBody.message ||
      (Array.isArray(errorBody.errors)
        ? errorBody.errors.map((e: any) => e.message || e).join(". ")
        : null) ||
      `Error de red: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  // Devolver Blob si es un archivo binario o descarga
  const contentType = response.headers.get("content-type");
  if (contentType && !contentType.includes("application/json")) {
    return (await response.blob()) as unknown as T;
  }

  return response.json();
}
