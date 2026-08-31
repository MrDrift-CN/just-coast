import { useEffect, useState } from "react"
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router"
import { useTranslation } from "react-i18next"

import { AuthShell } from "@/auth/components/auth-shell"
import type { FormForgotPasswordValues } from "@/auth/components/form-forgot-password"
import type { FormLoginValues } from "@/auth/components/form-login"
import type { FormRegisterValues } from "@/auth/components/form-register"
import type { FormResetPasswordValues } from "@/auth/components/form-reset-password"
import { QrCodeLoginDialog } from "@/auth/components/qr-code-login-dialog"
import { useSessionController } from "@/auth/useSession"
import { Login, type LoginScene } from "@/auth/pages/login"
import { Register } from "@/auth/pages/register"
import {
  completeGithubSignIn,
  createQrLoginChallenge,
  decideQrLogin,
  getQrLoginStatus,
  markQrLoginScanned,
  registerAccount,
  requestVerificationCode,
  resetPassword,
  signIn,
  startGithubSignIn,
  verifyPasswordReset,
} from "@/auth/services"
import {
  QR_LOGIN_STATUS,
  VERIFICATION_CODE_PURPOSE,
  type GithubCallbackInput,
  type VerificationCodeResult,
} from "@/auth/types"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { LanguageButton } from "@/i18n"

/** GitHub 回调的并发请求缓存，避免 React 开发模式重复消费一次性授权码。 */
const githubCallbackRequests = new Map<
  string,
  ReturnType<typeof completeGithubSignIn>
>()

/** 扫码确认页的并发扫描请求缓存，保证开发模式重复 Effect 仍可完成。 */
const qrScanRequests = new Map<string, ReturnType<typeof markQrLoginScanned>>()

/** 对相同 GitHub 授权码和状态只发起一次完成请求。 */
function completeGithubSignInOnce(
  input: GithubCallbackInput
): ReturnType<typeof completeGithubSignIn> {
  const key = `${input.code}:${input.state}`
  const existingRequest = githubCallbackRequests.get(key)

  if (existingRequest) return existingRequest

  const request = completeGithubSignIn(input)
  githubCallbackRequests.set(key, request)
  return request
}

/** 对相同扫码挑战只创建一个扫描状态请求。 */
function markQrLoginScannedOnce(
  challengeId: string
): ReturnType<typeof markQrLoginScanned> {
  const existingRequest = qrScanRequests.get(challengeId)

  if (existingRequest) return existingRequest

  const request = markQrLoginScanned({ challengeId })
  qrScanRequests.set(challengeId, request)
  return request
}

/** 只接受项目扫码确认页作为登录完成后的返回地址。 */
function readQrLoginReturnPath(value: string | null): string | null {
  if (!value || typeof window === "undefined") return null

  try {
    const url = new URL(value, window.location.origin)
    if (
      url.origin !== window.location.origin ||
      url.pathname !== "/auth/qr-confirm" ||
      !url.searchParams.get("challenge") ||
      url.hash !== ""
    ) {
      return null
    }
    return `${url.pathname}${url.search}`
  } catch {
    return null
  }
}

/** 在认证流程内部导航时保留已经校验过的扫码返回地址。 */
function createAuthPath(
  path: "/login" | "/register" | "/forget",
  returnPath: string | null
): string {
  return returnPath
    ? `${path}?returnTo=${encodeURIComponent(returnPath)}`
    : path
}

/** 将登录、找回密码和设置新密码场景连接到认证服务与路由导航。 */
export const LoginRoute = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { establish } = useSessionController()
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [resetAuthorizationId, setResetAuthorizationId] = useState<
    string | null
  >(null)
  const isPasswordRecovery = location.pathname === "/forget"
  const returnPath = readQrLoginReturnPath(searchParams.get("returnTo"))
  const loginPath = createAuthPath("/login", returnPath)
  const isResetStage = isPasswordRecovery && resetAuthorizationId !== null
  let scene: LoginScene = "login"

  if (isPasswordRecovery) {
    scene = isResetStage ? "resetPassword" : "forgotPassword"
  }

  /** 使用表单凭据建立 Session、保存 JWT 并更新共享认证状态。 */
  const handleSignIn = async (values: FormLoginValues): Promise<void> => {
    const response = await signIn(values)
    establish(response.data)
    if (returnPath) void navigate(returnPath, { replace: true })
  }

  /** 根据当前场景发送用途隔离的邮箱验证码。 */
  const handleRequestVerificationCode = async (
    email: string
  ): Promise<VerificationCodeResult> => {
    const response = await requestVerificationCode({
      email,
      purpose: isPasswordRecovery
        ? VERIFICATION_CODE_PURPOSE.passwordReset
        : VERIFICATION_CODE_PURPOSE.login,
    })
    return response.data
  }

  /** 校验邮箱验证码，并只在当前页面内存中保存短期重置授权。 */
  const handleRequestReset = async (
    values: FormForgotPasswordValues
  ): Promise<void> => {
    const response = await verifyPasswordReset(values)
    setResetAuthorizationId(response.data.authorizationId)
  }

  /** 使用已验证的短期授权提交新密码，完成后返回登录。 */
  const handleResetPassword = async (
    values: FormResetPasswordValues
  ): Promise<void> => {
    if (!resetAuthorizationId) {
      void navigate(createAuthPath("/forget", returnPath), { replace: true })
      return
    }

    await resetPassword({
      authorizationId: resetAuthorizationId,
      newPassword: values.newPassword,
    })
    setResetAuthorizationId(null)
    void navigate(loginPath, { replace: true })
  }

  /** 获取后端 GitHub 授权地址并离开当前页面。 */
  const handleGithubSignIn = async (): Promise<void> => {
    const response = await startGithubSignIn()
    window.location.assign(response.data.authorizationUrl)
  }

  /** 清理未完成的密码重置授权并进入找回密码场景。 */
  const handleForgotPassword = (): void => {
    setResetAuthorizationId(null)
    void navigate(createAuthPath("/forget", returnPath))
  }

  /** 清理未完成的密码重置授权并返回登录场景。 */
  const handleReturnToLogin = (): void => {
    setResetAuthorizationId(null)
    void navigate(loginPath)
  }

  return (
    <>
      <Login
        scene={scene}
        onForgotPassword={handleForgotPassword}
        onGithubLogin={handleGithubSignIn}
        onLogin={handleReturnToLogin}
        onQrCodeLogin={() => setQrDialogOpen(true)}
        onRegister={() =>
          void navigate(createAuthPath("/register", returnPath))
        }
        onRequestReset={handleRequestReset}
        onRequestVerificationCode={handleRequestVerificationCode}
        onResetPassword={handleResetPassword}
        onSubmit={handleSignIn}
      />
      <QrCodeLoginDialog
        onAuthenticated={establish}
        onCreateChallenge={createQrLoginChallenge}
        onGetStatus={getQrLoginStatus}
        onOpenChange={setQrDialogOpen}
        open={qrDialogOpen}
      />
    </>
  )
}

/** 将注册页面连接到认证服务、备选登录方式与登录路由。 */
export const RegisterRoute = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { establish } = useSessionController()
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const returnPath = readQrLoginReturnPath(searchParams.get("returnTo"))
  const loginPath = createAuthPath("/login", returnPath)

  /** 创建账户，并在成功后返回登录。 */
  const handleRegister = async (values: FormRegisterValues): Promise<void> => {
    await registerAccount(values)
    void navigate(loginPath, { replace: true })
  }

  /** 向注册邮箱发送用途隔离的一次性验证码。 */
  const handleRequestVerificationCode = async (
    email: string
  ): Promise<VerificationCodeResult> => {
    const response = await requestVerificationCode({
      email,
      purpose: VERIFICATION_CODE_PURPOSE.registration,
    })
    return response.data
  }

  /** 获取后端 GitHub 授权地址并离开当前页面。 */
  const handleGithubSignIn = async (): Promise<void> => {
    const response = await startGithubSignIn()
    window.location.assign(response.data.authorizationUrl)
  }

  return (
    <>
      <Register
        onGithubLogin={handleGithubSignIn}
        onLogin={() => void navigate(loginPath)}
        onQrCodeLogin={() => setQrDialogOpen(true)}
        onRequestVerificationCode={handleRequestVerificationCode}
        onSubmit={handleRegister}
      />
      <QrCodeLoginDialog
        onAuthenticated={establish}
        onCreateChallenge={createQrLoginChallenge}
        onGetStatus={getQrLoginStatus}
        onOpenChange={setQrDialogOpen}
        open={qrDialogOpen}
      />
    </>
  )
}

/** 完成 GitHub OAuth 回调并把结果写入共享 Session。 */
export const GithubCallbackRoute = () => {
  const { t } = useTranslation("auth")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { establish } = useSessionController()
  const [failed, setFailed] = useState(false)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  /** 消费一次性回调参数，成功后返回登录入口。 */
  useEffect(() => {
    if (!code || !state) return

    let cancelled = false

    void completeGithubSignInOnce({ code, state })
      .then((response) => {
        if (cancelled) return
        establish(response.data)
        toast.add({ title: t("login.feedback.success"), type: "success" })
        void navigate("/login", { replace: true })
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [code, establish, navigate, state, t])

  const callbackInvalid = !code || !state

  return (
    <AuthShell
      actions={<LanguageButton />}
      description={t("githubCallback.description")}
      title={t("githubCallback.title")}
    >
      <div className="flex min-h-36 flex-col items-center justify-center gap-4 text-center">
        {failed || callbackInvalid ? (
          <>
            <p className="text-sm text-destructive">
              {t("githubCallback.failed")}
            </p>
            <Button onClick={() => void navigate("/login")} type="button">
              {t("githubCallback.backToLogin")}
            </Button>
          </>
        ) : (
          <Spinner aria-label={t("githubCallback.loading")} />
        )}
      </div>
    </AuthShell>
  )
}

/** 让移动设备确认或拒绝项目自有扫码登录挑战。 */
export const QrLoginConfirmationRoute = () => {
  const { t } = useTranslation("auth")
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { status: sessionStatus } = useSessionController()
  const challengeId = searchParams.get("challenge")
  const [status, setStatus] = useState<
    "loading" | "ready" | "submitting" | "approved" | "rejected" | "failed"
  >(challengeId ? "loading" : "failed")

  /** 页面打开时通知桌面端二维码已经被扫描。 */
  useEffect(() => {
    if (!challengeId || sessionStatus !== "authenticated") return

    let cancelled = false
    void markQrLoginScannedOnce(challengeId)
      .then(() => {
        if (!cancelled) setStatus("ready")
      })
      .catch(() => {
        if (!cancelled) setStatus("failed")
      })

    return () => {
      cancelled = true
    }
  }, [challengeId, sessionStatus])

  /** 将当前移动端用户的允许或拒绝决定提交给认证服务。 */
  const submitDecision = async (approved: boolean): Promise<void> => {
    if (!challengeId || status === "submitting") return

    setStatus("submitting")
    try {
      const response = await decideQrLogin({ challengeId, approved })
      setStatus(
        response.data.status === QR_LOGIN_STATUS.approved
          ? "approved"
          : "rejected"
      )
    } catch {
      setStatus("failed")
    }
  }

  const decisionFinished = status === "approved" || status === "rejected"
  const sessionLoading =
    sessionStatus === "initializing" || sessionStatus === "refreshing"
  const description = decisionFinished
    ? t(`qrConfirmation.${status}`)
    : t("qrConfirmation.description")

  if (sessionStatus === "anonymous" || sessionStatus === "expired") {
    const returnTo = `${location.pathname}${location.search}`
    return (
      <Navigate
        replace
        to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
      />
    )
  }

  return (
    <AuthShell
      actions={<LanguageButton />}
      description={description}
      title={t("qrConfirmation.title")}
    >
      <div className="flex min-h-36 flex-col items-center justify-center gap-4 text-center">
        {sessionLoading ||
        (sessionStatus === "authenticated" &&
          (status === "loading" || status === "submitting")) ? (
          <Spinner aria-label={t("qrConfirmation.loading")} />
        ) : null}

        {status === "ready" && sessionStatus === "authenticated" ? (
          <div className="grid w-full gap-3 sm:grid-cols-2">
            <Button
              onClick={() => void submitDecision(false)}
              type="button"
              variant="outline"
            >
              {t("qrConfirmation.reject")}
            </Button>
            <Button onClick={() => void submitDecision(true)} type="button">
              {t("qrConfirmation.approve")}
            </Button>
          </div>
        ) : null}

        {status === "failed" || sessionStatus === "unavailable" ? (
          <p className="text-sm text-destructive">
            {t("qrConfirmation.failed")}
          </p>
        ) : null}
      </div>
    </AuthShell>
  )
}

/** 将认证功能的默认入口规范化到登录路由。 */
export const LoginRedirect = () => {
  return <Navigate replace to="/login" />
}
