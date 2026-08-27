import {
  Navigate,
  createSearchParams,
  useNavigate,
  useSearchParams,
} from "react-router"

import { useForgetPassword } from "@/auth/hooks/use-forget-password"
import { ForgotPassword } from "@/auth/pages/forget"
import { Login } from "@/auth/pages/login"
import { Register } from "@/auth/pages/register"

export function LoginRoute() {
  const navigate = useNavigate()

  return (
    <Login
      onForgotPassword={() => navigate("/forget")}
      onRegister={() => navigate("/register")}
    />
  )
}

export function RegisterRoute() {
  const navigate = useNavigate()

  return <Register onLogin={() => navigate("/login")} />
}

export function ForgetRoute() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { pending, requestReset, resetPassword } = useForgetPassword()
  const resetToken = searchParams.get("token") ?? undefined

  return (
    <ForgotPassword
      pending={pending}
      resetToken={resetToken}
      onLogin={() => navigate("/login")}
      onRequestReset={async (values) => {
        const token = await requestReset(values)

        navigate(
          {
            pathname: "/forget",
            search: createSearchParams({ token }).toString(),
          },
          { replace: true }
        )
      }}
      onResetPassword={async (values, token) => {
        await resetPassword(values, token)
        navigate("/login", { replace: true })
      }}
    />
  )
}

export function LoginRedirect() {
  return <Navigate replace to="/login" />
}
