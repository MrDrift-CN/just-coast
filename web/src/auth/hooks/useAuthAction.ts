import { useRef, useState } from "react"

import type { AuthFormAction } from "@/auth/types"
import { toast } from "@/components/ui/toast"

/** 认证动作完成后向用户展示的本地化反馈文案。 */
export interface AuthActionFeedback {
  /** 动作成功完成时展示的简短结果。 */
  readonly success?: string

  /** 动作失败时展示的安全、可操作提示。 */
  readonly error: string
}

/** 认证动作执行期间暴露给页面的提交能力与状态。 */
export interface UseAuthActionResult<TValues> {
  /** 执行当前认证动作；动作缺失或已有提交进行时不重复触发。 */
  readonly execute: (values: TValues) => Promise<void>

  /** 当前认证动作是否尚未完成。 */
  readonly pending: boolean
}

/** 执行可选认证动作，并统一处理重复提交、等待状态和浮层反馈。 */
export function useAuthAction<TValues>(
  action: AuthFormAction<TValues> | undefined,
  feedback: AuthActionFeedback
): UseAuthActionResult<TValues> {
  const [pending, setPending] = useState(false)
  const pendingRef = useRef(false)

  /** 执行已注入动作，并把原始异常收敛为不泄露服务端细节的通知。 */
  const execute = async (values: TValues): Promise<void> => {
    if (!action || pendingRef.current) {
      return
    }

    pendingRef.current = true
    setPending(true)

    try {
      await action(values)
      if (feedback.success) {
        toast.add({ title: feedback.success, type: "success" })
      }
    } catch {
      toast.add({
        title: feedback.error,
        type: "error",
        priority: "high",
      })
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }

  return { execute, pending }
}
