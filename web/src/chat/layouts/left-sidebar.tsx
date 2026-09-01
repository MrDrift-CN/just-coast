import { ThreadListPrimitive } from "@assistant-ui/react"
import { NewspaperIcon, SearchIcon, SquarePenIcon } from "lucide-react"
import { useState, type ChangeEvent } from "react"
import { useTranslation } from "react-i18next"
import { NavLink, useMatch } from "react-router"

import brandLogo from "@/assets/just-coast.svg"
import { AccountMenu } from "@/chat/components/account-menu"
import { ThreadList } from "@/chat/components/thread-list"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"

/** 组合 Chat 的品牌、新建、搜索、AI 时讯入口、会话区域和账户菜单。 */
export const LeftSidebar = () => {
  const { t } = useTranslation("chat")
  const { t: tCommon } = useTranslation("common")
  const [searchQuery, setSearchQuery] = useState("")
  const isNewsRouteActive =
    useMatch({ path: "/chat/news", end: false }) !== null

  /** 将搜索框内容同步为线程标题筛选条件。 */
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.currentTarget.value)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="grid h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-1">
          <div className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:hidden">
            <img
              alt=""
              className="size-8 shrink-0 rounded-lg object-cover"
              src={brandLogo}
            />
            <span className="truncate text-2xl leading-8 font-bold">
              {tCommon("app.name")}
            </span>
          </div>
          <SidebarTrigger
            aria-label={t("sidebar.toggle")}
            className="shrink-0 text-sidebar-primary group-data-[collapsible=icon]:mx-auto"
            title={t("sidebar.toggle")}
          />
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<ThreadListPrimitive.New />}
              tooltip={t("sidebar.newConversation")}
            >
              <SquarePenIcon
                aria-hidden="true"
                className="text-sidebar-primary"
              />
              <span>{t("sidebar.newConversation")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="group-data-[collapsible=icon]:hidden">
          <Label className="sr-only" htmlFor="conversation-search">
            {t("sidebar.searchConversations")}
          </Label>
          <InputGroup>
            <InputGroupInput
              autoComplete="off"
              id="conversation-search"
              onChange={handleSearchChange}
              placeholder={t("sidebar.searchPlaceholder")}
              type="search"
              value={searchQuery}
            />
            <InputGroupAddon align="inline-start">
              <SearchIcon aria-hidden="true" className="text-sidebar-primary" />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={isNewsRouteActive}
              render={<NavLink to="/chat/news" />}
              tooltip={t("sidebar.aiNews")}
            >
              <NewspaperIcon
                aria-hidden="true"
                className="text-sidebar-primary"
              />
              <span>{t("sidebar.aiNews")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <ThreadList searchQuery={searchQuery} />
      </SidebarContent>

      <SidebarFooter>
        <AccountMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
