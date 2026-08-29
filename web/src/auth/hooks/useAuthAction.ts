import { useRef, useState } from "react"

import type { AuthFormAction } from "@/auth/types"

/** 认证动作执行期间暴露给页面的提交能力与状态。 */
export interface UseAuthActionResult<TValues> {
  /** 执行当前认证动作；动作缺失或已有提交进行时不重复触发。 */
  execute: (values: TValues) => Promise<void>
  /** 当前认证动作是否尚未完成。 */
  pending: boolean
}

/** 执行可选认证动作，并阻止同一页面在完成前重复提交。 */
export function useAuthAction<TValues>(
  action?: AuthFormAction<TValues>
): UseAuthActionResult<TValues> {
  const [pending, setPending] = useState(false)
  const pendingRef = useRef(false)

  /** 执行已注入的认证动作，并将异常继续交给动作调用链处理。 */
  const execute = async (values: TValues): Promise<void> => {
    if (!action || pendingRef.current) {
      return
    }

    pendingRef.current = true
    setPending(true)

    try {
      await action(values)
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }

  return { execute, pending }
}
