import { useState, type ComponentProps } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

/** 认证密码输入默认使用的浏览器最少字符约束。 */
const PASSWORD_MIN_LENGTH = 8

/** 带标签、错误反馈和可见性切换的密码输入属性。 */
export interface FieldPasswordProps extends Omit<
  ComponentProps<typeof InputGroupInput>,
  "id" | "type"
> {
  /** 连接标签、输入框和错误提示的唯一标识。 */
  id: string

  /** 密码输入框的可见标签。 */
  label: string

  /** 当前校验错误；存在时同步设置无效状态和描述关系。 */
  error?: string

  /** 是否将标签放入输入框左侧，形成紧凑的认证字段。 */
  labelInsideInput?: boolean
}

/** 渲染具备可访问标签、错误反馈和明文切换的密码输入框。 */
export const FieldPassword = ({
  error,
  id,
  label,
  labelInsideInput = false,
  minLength = PASSWORD_MIN_LENGTH,
  ...inputProps
}: FieldPasswordProps) => {
  const { t } = useTranslation("auth")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const isInvalid = Boolean(error) || Boolean(inputProps["aria-invalid"])
  const errorId = `${id}-error`
  const labelId = `${id}-label`

  /** 切换密码明文与密文显示状态。 */
  const handleVisibilityToggle = (): void => {
    setIsPasswordVisible((currentVisibility) => !currentVisibility)
  }

  return (
    <Field
      data-disabled={inputProps.disabled || undefined}
      data-invalid={isInvalid || undefined}
    >
      {!labelInsideInput ? (
        <FieldLabel htmlFor={id} id={labelId}>
          {label}
        </FieldLabel>
      ) : null}
      <InputGroup className="auth-input-group">
        {labelInsideInput ? (
          <InputGroupAddon
            align="inline-start"
            className="min-w-24 shrink-0 justify-start border-e border-border/60 px-3"
          >
            <FieldLabel
              className="cursor-text whitespace-nowrap"
              htmlFor={id}
              id={labelId}
            >
              {label}
            </FieldLabel>
          </InputGroupAddon>
        ) : null}
        <InputGroupInput
          {...inputProps}
          aria-describedby={error ? errorId : inputProps["aria-describedby"]}
          aria-invalid={isInvalid || undefined}
          aria-labelledby={inputProps["aria-labelledby"] ?? labelId}
          id={id}
          minLength={minLength}
          type={isPasswordVisible ? "text" : "password"}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label={
              isPasswordVisible
                ? t("fields.password.hide")
                : t("fields.password.show")
            }
            aria-pressed={isPasswordVisible}
            disabled={inputProps.disabled}
            onClick={handleVisibilityToggle}
            size="icon-xs"
            type="button"
          >
            {isPasswordVisible ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </Field>
  )
}
