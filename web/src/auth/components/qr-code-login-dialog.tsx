import { CircleAlertIcon, ScanLineIcon } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  QR_LOGIN_STATUS,
  type AuthenticationResult,
  type AuthServiceResponse,
  type QrLoginChallenge,
  type QrLoginChallengeInput,
  type QrLoginStatus,
  type QrLoginStatusResult,
} from "@/auth/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

/** 桌面端轮询扫码登录状态的固定时间间隔。 */
const QR_LOGIN_POLL_INTERVAL_MS = 1_200

/** 创建扫码挑战的页面服务动作。 */
export type CreateQrLoginChallengeAction =
  () => AuthServiceResponse<QrLoginChallenge>

/** 查询扫码挑战状态的页面服务动作。 */
export type GetQrLoginStatusAction = (
  input: QrLoginChallengeInput
) => AuthServiceResponse<QrLoginStatusResult>

/** 扫码登录弹窗的受控状态和认证结果边界。 */
export interface QrCodeLoginDialogProps {
  /** 是否展示扫码登录弹窗。 */
  readonly open: boolean
  /** 弹窗打开状态变化时触发。 */
  readonly onOpenChange: (open: boolean) => void
  /** 移动端确认后接收完整认证结果。 */
  readonly onAuthenticated: (result: AuthenticationResult) => void
  /** 创建一个新的短期扫码登录挑战。 */
  readonly onCreateChallenge: CreateQrLoginChallengeAction
  /** 查询当前扫码登录挑战状态。 */
  readonly onGetStatus: GetQrLoginStatusAction
}

/** 渲染项目自有登录二维码并等待移动设备确认。 */
export const QrCodeLoginDialog = ({
  open,
  onOpenChange,
  onAuthenticated,
  onCreateChallenge,
  onGetStatus,
}: QrCodeLoginDialogProps) => {
  const { t } = useTranslation("auth")
  const [challenge, setChallenge] = useState<QrLoginChallenge | null>(null)
  const [status, setStatus] = useState<QrLoginStatus | null>(null)
  const [hasFailed, setHasFailed] = useState(false)
  const completedRef = useRef(false)
  const challengeEpochRef = useRef(0)
  const challengeRequestRef =
    useRef<ReturnType<CreateQrLoginChallengeAction> | null>(null)

  /** 请求新的二维码挑战，并将异步结果写入当前弹窗状态。 */
  const loadChallenge = useCallback(async (): Promise<void> => {
    const requestEpoch = challengeEpochRef.current

    try {
      const request = challengeRequestRef.current ?? onCreateChallenge()
      challengeRequestRef.current = request
      const response = await request
      if (requestEpoch !== challengeEpochRef.current) return
      setChallenge(response.data)
      setStatus(response.data.status)
    } catch {
      if (requestEpoch !== challengeEpochRef.current) return
      setHasFailed(true)
    }
  }, [onCreateChallenge])

  /** 丢弃当前挑战及其界面状态，保证下一次请求从干净状态开始。 */
  const resetChallengeState = useCallback((): void => {
    challengeEpochRef.current += 1
    challengeRequestRef.current = null
    setChallenge(null)
    setStatus(null)
    setHasFailed(false)
  }, [])

  useEffect(
    /** 弹窗打开后与扫码认证服务建立新的挑战。 */
    function createChallengeWhenOpened() {
      if (open) {
        completedRef.current = false
        void loadChallenge()
      }
    },
    [loadChallenge, open]
  )

  useEffect(
    /** 轮询桌面端挑战，直到用户确认、拒绝或二维码过期。 */
    function manageQrLoginPolling() {
      const isTerminalStatus =
        status === QR_LOGIN_STATUS.rejected ||
        status === QR_LOGIN_STATUS.expired

      if (
        !open ||
        !challenge ||
        hasFailed ||
        isTerminalStatus ||
        completedRef.current
      ) {
        return
      }

      /** 查询当前扫码挑战状态，并在认证完成时关闭弹窗。 */
      const pollStatus = async (): Promise<void> => {
        const pollingEpoch = challengeEpochRef.current

        try {
          const response = await onGetStatus({
            challengeId: challenge.challengeId,
          })
          if (pollingEpoch !== challengeEpochRef.current) return
          setStatus(response.data.status)

          if (response.data.authentication && !completedRef.current) {
            completedRef.current = true
            onAuthenticated(response.data.authentication)
            toast.add({
              title: t("login.feedback.success"),
              type: "success",
            })
            resetChallengeState()
            onOpenChange(false)
          }
        } catch {
          if (pollingEpoch !== challengeEpochRef.current) return
          setHasFailed(true)
        }
      }

      void pollStatus()
      const intervalId = window.setInterval(
        () => void pollStatus(),
        QR_LOGIN_POLL_INTERVAL_MS
      )
      return () => window.clearInterval(intervalId)
    },
    [
      challenge,
      hasFailed,
      onAuthenticated,
      onGetStatus,
      onOpenChange,
      open,
      resetChallengeState,
      status,
      t,
    ]
  )

  /** 在新标签页打开 Mock 移动确认页，方便无后端时演练流程。 */
  const openMockConfirmation = (): void => {
    if (challenge) {
      window.open(challenge.confirmationUrl, "_blank", "noopener,noreferrer")
    }
  }

  /** 关闭时丢弃当前挑战请求，下一次打开会生成新二维码。 */
  const handleOpenChange = (nextOpen: boolean): void => {
    if (!nextOpen) resetChallengeState()
    onOpenChange(nextOpen)
  }

  /** 丢弃已经结束的挑战并请求新的登录二维码。 */
  const handleRetry = (): void => {
    resetChallengeState()
    completedRef.current = false
    void loadChallenge()
  }

  const isLoading = !challenge && !hasFailed
  const canRetry =
    hasFailed ||
    status === QR_LOGIN_STATUS.expired ||
    status === QR_LOGIN_STATUS.rejected
  let statusText = t("qrLogin.status.waitingForScan")

  if (status === QR_LOGIN_STATUS.waitingForConfirmation) {
    statusText = t("qrLogin.status.waitingForConfirmation")
  } else if (status === QR_LOGIN_STATUS.approved) {
    statusText = t("qrLogin.status.approved")
  } else if (status === QR_LOGIN_STATUS.rejected) {
    statusText = t("qrLogin.status.rejected")
  } else if (status === QR_LOGIN_STATUS.expired) {
    statusText = t("qrLogin.status.expired")
  }

  let challengeContent: ReactNode = null
  if (isLoading) {
    challengeContent = <Spinner aria-label={t("qrLogin.status.loading")} />
  } else if (hasFailed) {
    challengeContent = (
      <CircleAlertIcon
        aria-hidden="true"
        className="size-10 text-destructive"
      />
    )
  } else if (challenge) {
    challengeContent = (
      <QRCodeSVG
        aria-label={t("qrLogin.codeLabel")}
        bgColor="#ffffff"
        fgColor="#000000"
        level="M"
        marginSize={2}
        size={220}
        title={t("qrLogin.codeLabel")}
        value={challenge.confirmationUrl}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("qrLogin.title")}</DialogTitle>
          <DialogDescription>{t("qrLogin.description")}</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-lg border bg-background/70 p-5">
          {challengeContent}

          <p
            aria-live="polite"
            className="text-center text-sm text-muted-foreground"
          >
            {hasFailed ? t("qrLogin.status.failed") : statusText}
          </p>

          {challenge?.mockOnly ? (
            <Button onClick={openMockConfirmation} type="button" variant="link">
              <ScanLineIcon aria-hidden="true" data-icon="inline-start" />
              {t("qrLogin.actions.openMockConfirmation")}
            </Button>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="outline"
          >
            {t("qrLogin.actions.cancel")}
          </Button>
          {canRetry ? (
            <Button onClick={handleRetry} type="button">
              {t("qrLogin.actions.retry")}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
