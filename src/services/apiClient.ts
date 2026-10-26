import { API_CONFIG } from "../constants";

interface RequestOptions extends RequestInit {
  token?: string | null;
}

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
    let message = errorBody.error || errorBody.message;

    if (Array.isArray(errorBody.errors) && errorBody.errors.length > 0) {
      const detailedErrors = errorBody.errors
        .map((e: any) => (typeof e === "string" ? e : e.message || `${e.field}: inválido`))
        .join(". ");

      if (message) {
        if (!message.includes(detailedErrors)) {
          message = message.toLowerCase().includes("validaci") && !message.includes(":")
            ? `${message}: ${detailedErrors}`
            : `${message}. ${detailedErrors}`;
        }
      } else {
        message = detailedErrors;
      }
    }

    if (!message) {
      message = `Error de red: ${response.status} ${response.statusText}`;
    }

    throw new Error(message);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && !contentType.includes("application/json")) {
    return (await response.blob()) as unknown as T;
  }

  return response.json();
}
