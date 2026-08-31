import { useEffect, useRef, useState, type MouseEvent } from "react"
import { useTranslation } from "react-i18next"

import type { AuthFormAction, VerificationCodeResult } from "@/auth/types"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { toast } from "@/components/ui/toast"

/** 验证码发送动作读取邮箱时使用的表单字段名。 */
const EMAIL_FIELD_NAME = "email"

/** 认证验证码允许输入的固定字符数。 */
const VERIFICATION_CODE_LENGTH = 6

/** 获取验证码后再次发送需要等待的秒数。 */
const VERIFICATION_CODE_COOLDOWN_SECONDS = 60

/** 认证验证码输入与发送交互的属性。 */
export interface FieldVerificationCodeProps {
  /** 连接标签与输入框的唯一标识。 */
  id: string

  /** 是否因认证提交而禁用验证码输入与发送入口。 */
  disabled?: boolean

  /** 请求向当前表单邮箱发送验证码。 */
  onRequest?: AuthFormAction<string, VerificationCodeResult>
}

/** 渲染认证验证码输入框，并管理发送状态与重新获取倒计时。 */
export const FieldVerificationCode = ({
  disabled = false,
  id,
  onRequest,
}: FieldVerificationCodeProps) => {
  const { t } = useTranslation("auth")
  const [countdownSeconds, setCountdownSeconds] = useState(0)
  const [isRequesting, setIsRequesting] = useState(false)
  const requestPendingRef = useRef(false)
  const labelId = `${id}-label`
  const isRequestDisabled =
    disabled || !onRequest || isRequesting || countdownSeconds > 0

  useEffect(
    /** 安排下一次倒计时更新，并在重新调度或卸载时清理计时器。 */
    function scheduleCountdownTick() {
      if (countdownSeconds === 0) {
        return
      }

      const timeoutId = window.setTimeout(
        () => setCountdownSeconds((currentSeconds) => currentSeconds - 1),
        1000
      )

      return () => window.clearTimeout(timeoutId)
    },
    [countdownSeconds]
  )

  /** 校验所属表单邮箱并请求验证码；成功后启动冷却倒计时。 */
  const requestVerificationCode = async (
    form: HTMLFormElement | null
  ): Promise<void> => {
    if (isRequestDisabled || requestPendingRef.current || !onRequest) {
      return
    }

    const emailInput = form?.elements.namedItem(EMAIL_FIELD_NAME)

    if (!(emailInput instanceof HTMLInputElement)) {
      return
    }

    if (!emailInput.reportValidity()) {
      return
    }

    requestPendingRef.current = true
    setIsRequesting(true)

    try {
      const result = await onRequest(emailInput.value.trim())
      setCountdownSeconds(VERIFICATION_CODE_COOLDOWN_SECONDS)
      toast.add({
        title: result.previewCode
          ? t("verificationCode.feedback.mockSent", {
              code: result.previewCode,
            })
          : t("verificationCode.feedback.sent"),
        type: "success",
      })
    } catch {
      toast.add({
        title: t("verificationCode.errors.requestFailed"),
        type: "error",
        priority: "high",
      })
    } finally {
      requestPendingRef.current = false
      setIsRequesting(false)
    }
  }

  /** 从获取按钮所属表单启动验证码请求。 */
  const handleRequest = (event: MouseEvent<HTMLButtonElement>): void => {
    void requestVerificationCode(event.currentTarget.form)
  }

  let requestLabel = t("verificationCode.actions.get")

  if (isRequesting) {
    requestLabel = t("verificationCode.actions.sending")
  } else if (countdownSeconds > 0) {
    requestLabel = t("verificationCode.actions.countdown", {
      seconds: countdownSeconds,
    })
  }

  return (
    <Field data-disabled={disabled || undefined}>
      <InputGroup className="auth-input-group">
        <InputGroupAddon
          align="inline-start"
          className="min-w-24 shrink-0 justify-start border-e border-border/60 px-3"
        >
          <FieldLabel
            className="cursor-text whitespace-nowrap"
            htmlFor={id}
            id={labelId}
          >
            {t("fields.verificationCode.label")}
          </FieldLabel>
        </InputGroupAddon>
        <InputGroupInput
          aria-labelledby={labelId}
          autoComplete="one-time-code"
          disabled={disabled}
          id={id}
          inputMode="numeric"
          maxLength={VERIFICATION_CODE_LENGTH}
          minLength={VERIFICATION_CODE_LENGTH}
          name="verificationCode"
          pattern={`[0-9]{${VERIFICATION_CODE_LENGTH}}`}
          placeholder={t("fields.verificationCode.placeholder")}
          required
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            className="min-w-20"
            disabled={isRequestDisabled}
            onClick={handleRequest}
            type="button"
          >
            {requestLabel}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}
