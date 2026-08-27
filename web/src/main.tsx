import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "katex/dist/katex.min.css"
import "streamdown/styles.css"
import "./index.css"
import App from "./App.tsx"
import { MarkdownRequestProvider } from "@/components/assistant-ui/streamdown-text"
import { TooltipProvider } from "@/components/ui/tooltip"
import { initializeTheme, ThemeProvider } from "@/theme"

initializeTheme()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <MarkdownRequestProvider>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </MarkdownRequestProvider>
    </ThemeProvider>
  </StrictMode>
)
