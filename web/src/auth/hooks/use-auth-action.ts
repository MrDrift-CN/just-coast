import { useState } from "react"

import type { AuthFormAction } from "@/auth/types"

/**
 * 认证表单异步操作状态。
 *
 * @template TValues - 当前认证场景提交的数据类型。
 * @param action - 认证业务操作。
 * @returns 执行函数与提交状态。
 * @internal
 * @since 1.0.0
 */
export function useAuthAction<TValues>(action?: AuthFormAction<TValues>) {
  const [pending, setPending] = useState(false)

  const execute = async (values: TValues) => {
    if (!action) {
      return
    }

    setPending(true)

    try {
      await action(values)
    } finally {
      setPending(false)
    }
  }

  return { execute, pending }
}
