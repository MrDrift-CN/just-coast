import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import * as React from "react"

/**
 * 密码输入字段属性。
 *
 * @public
 * @since 1.0.0
 */
export interface PasswordFieldProps extends Omit<
  React.ComponentProps<typeof InputGroupInput>,
  "id" | "type"
> {
  /** 输入框与标签共享的唯一标识。 */
  id: string

  /** 输入字段标签。 */
  label: string

  /** 输入字段错误信息。 */
  error?: string
}

/**
 * 渲染带可见性切换按钮的密码字段。
 *
 * @param props - 密码输入字段属性。
 * @returns 密码输入字段。
 *
 * @public
 * @since 1.0.0
 */
export function PasswordField({
  error,
  id,
  label,
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
