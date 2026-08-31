/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_DATA_SOURCE?: "mock" | "api"
  readonly VITE_BACKEND_ORIGIN?: string
  readonly VITE_BACKEND_PUBLIC_PREFIX?: string
  readonly VITE_BACKEND_IMAGE_PREFIX?: string
  readonly VITE_BACKEND_LINK_CHECK_PATH?: string
  readonly VITE_STREAMDOWN_ALLOWED_LINK_PREFIXES?: string
  readonly VITE_STREAMDOWN_ALLOWED_IMAGE_PREFIXES?: string
  readonly VITE_STREAMDOWN_ALLOWED_PROTOCOLS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
