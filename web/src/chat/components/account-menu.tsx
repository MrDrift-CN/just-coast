import { ChevronsUpDownIcon, LogOutIcon, UserCogIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"

import { useSession } from "@/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

/** 展示当前用户信息，并提供账户设置入口和注销操作。 */
export const AccountMenu = () => {
  const { t } = useTranslation("chat")
  const navigate = useNavigate()
  const { logout, session } = useSession()
  const username = session?.user.username ?? t("sidebar.guest")
  const email = session?.user.email ?? t("sidebar.noAccount")

  /** 注销当前 Session 后返回登录页面。 */
  async function handleLogout(): Promise<void> {
    try {
      await logout()
    } finally {
      void navigate("/login", { replace: true })
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex h-12 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                aria-label={t("sidebar.settingsMenu")}
                className="group-data-[collapsible=icon]:justify-center"
                size="lg"
                title={t("sidebar.settingsMenu")}
                type="button"
              />
            }
          >
            <UserCogIcon
              aria-hidden="true"
              className="size-5! text-sidebar-primary"
            />
            <span className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium">{username}</span>
              <span className="truncate text-xs text-muted-foreground">
                {email}
              </span>
            </span>
            <ChevronsUpDownIcon
              aria-hidden="true"
              className="ml-auto text-muted-foreground group-data-[collapsible=icon]:hidden"
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="min-w-56 rounded-lg"
            side="right"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <span className="grid min-w-0 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{username}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => void handleLogout()}
                variant="destructive"
              >
                <LogOutIcon aria-hidden="true" />
                {t("sidebar.logout")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
