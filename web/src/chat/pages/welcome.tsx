import { SuggestionPrimitive, ThreadPrimitive } from "@assistant-ui/react"
import { useTranslation } from "react-i18next"

import logoUrl from "@/assets/just-coast.svg"
import { PromptInput } from "@/chat/components/prompt-input"
import { Button } from "@/components/ui/button"

/** 在新对话中展示品牌欢迎信息和可直接发送的消息输入。 */
export const Welcome = () => {
  const { t } = useTranslation("chat")

  return (
    <section
      aria-labelledby="chat-welcome-title"
      className="flex min-h-0 flex-1 items-center justify-center px-4 py-10 sm:px-6"
    >
      <div className="flex w-full max-w-3xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <img
            alt=""
            aria-hidden="true"
            className="size-20 object-contain"
            height="80"
            src={logoUrl}
            width="80"
          />
          <h1
            className="text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            id="chat-welcome-title"
          >
            {t("welcome.title")}
          </h1>
        </div>

        <PromptInput className="shadow-sm" />

        <div
          aria-label={t("welcome.suggestionsLabel")}
          className="flex w-full flex-wrap justify-center gap-2"
          role="group"
        >
          <ThreadPrimitive.Suggestions>
            {() => (
              <SuggestionPrimitive.Trigger
                render={
                  <Button
                    className="rounded-full px-4"
                    size="lg"
                    type="button"
                    variant="outline"
                  />
                }
              >
                <SuggestionPrimitive.Title />
              </SuggestionPrimitive.Trigger>
            )}
          </ThreadPrimitive.Suggestions>
        </div>
      </div>
    </section>
  )
}
