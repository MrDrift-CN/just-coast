import {
  unstable_defaultDirectiveFormatter,
  type SuggestionConfig,
} from "@assistant-ui/react"
import type { TFunction } from "i18next"

/** 建议写入输入框时使用的指令类型，仅用于保留可视化高亮。 */
const SUGGESTION_DIRECTIVE_TYPE = "recommendation"

/**
 * 创建欢迎页交给 assistant-ui 管理的建议配置。
 *
 * @remarks
 * 页面不拥有建议来源；后续接入多来源召回或排序算法时，只需替换此边界的
 * 数据生成方式，并继续输出 assistant-ui 的 `SuggestionConfig`。
 */
export const createWelcomeSuggestions = (
  translate: TFunction<"chat">
): SuggestionConfig[] =>
  [
    translate("welcome.suggestions.analyzeProblem"),
    translate("welcome.suggestions.summarizeDocument"),
    translate("welcome.suggestions.createPlan"),
    translate("welcome.suggestions.explainConcept"),
  ].map((title) => {
    return {
      title,
      label: "",
      prompt: unstable_defaultDirectiveFormatter.serialize({
        id: title,
        label: title,
        type: SUGGESTION_DIRECTIVE_TYPE,
      }),
    }
  })
