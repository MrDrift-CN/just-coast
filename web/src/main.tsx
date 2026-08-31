import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@/i18n"
import "katex/dist/katex.min.css"
import "streamdown/styles.css"
import "@/index.css"
import { App } from "@/app"
import { initializeTheme } from "@/theme"

initializeTheme()

/** Vite HTML 模板中承载 React 应用的根节点。 */
const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error("Application root element is missing")
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
