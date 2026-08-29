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

/** 带标签、错误提示和可见性切换的密码输入属性。 */
export interface PasswordFieldProps extends Omit<
  ComponentProps<typeof InputGroupInput>,
  "id" | "type"
> {
  /** 连接标签、输入框和错误提示的唯一标识。 */
  id: string

  /** 密码输入框的可见标签。 */
  label: string

  /** 当前校验错误；存在时同步设置无效状态和描述关系。 */
  error?: string
}

/** 渲染具备可访问标签、错误反馈和明文切换的密码输入框。 */
export function PasswordField({
  error,
  id,
  label,
  minLength = PASSWORD_MIN_LENGTH,
  ...inputProps
}: PasswordFieldProps) {
  const { t } = useTranslation("auth")
  const [visible, setVisible] = useState(false)
  const invalid = Boolean(error) || Boolean(inputProps["aria-invalid"])
  const errorId = `${id}-error`
  const labelId = `${id}-label`

  return (
    <Field
      data-disabled={inputProps.disabled || undefined}
      data-invalid={invalid || undefined}
    >
      <FieldLabel htmlFor={id} id={labelId}>
        {label}
      </FieldLabel>
      <InputGroup className="auth-input-group">
        <InputGroupInput
          {...inputProps}
          aria-describedby={error ? errorId : inputProps["aria-describedby"]}
          aria-invalid={invalid || undefined}
          aria-labelledby={inputProps["aria-labelledby"] ?? labelId}
          id={id}
          minLength={minLength}
          type={visible ? "text" : "password"}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label={
              visible ? t("fields.password.hide") : t("fields.password.show")
            }
            aria-pressed={visible}
            disabled={inputProps.disabled}
            onClick={() => setVisible((current) => !current)}
            size="icon-xs"
          >
            {visible ? (
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
