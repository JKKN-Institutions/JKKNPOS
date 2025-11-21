"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCog,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Sparkles,
  Store,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { useSidebarStore } from "@/lib/store/sidebar-store"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Sales",
    href: "/sales",
    icon: ShoppingCart,
    gradient: "from-emerald-500 to-teal-500",
    badge: "POS",
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
    gradient: "from-orange-500 to-amber-500",
  },
  {
    title: "Stores",
    href: "/stores",
    icon: Store,
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    title: "Staff",
    href: "/staff",
    icon: UserCog,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    gradient: "from-slate-500 to-gray-500",
  },
]

interface SidebarProps {
  onSignOut?: () => void
}

// Navigation Item Component
function NavItem({
  item,
  isActive,
  collapsed = false,
  onClick
}: {
  item: typeof menuItems[0]
  isActive: boolean
  collapsed?: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300",
        isActive
          ? "bg-gradient-to-r text-white shadow-lg"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        isActive && item.gradient,
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? item.title : undefined}
    >
      {/* Active indicator glow */}
      {isActive && (
        <div className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-r opacity-20 blur-xl",
          item.gradient
        )} />
      )}

      {/* Icon with gradient background on hover */}
      <div className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300",
        isActive
          ? "bg-white/20"
          : "bg-muted/50 group-hover:bg-gradient-to-br group-hover:text-white",
        !isActive && `group-hover:${item.gradient}`
      )}>
        <item.icon className={cn(
          "h-5 w-5 transition-transform duration-300",
          "group-hover:scale-110",
          isActive && "text-white"
        )} />
      </div>

      {!collapsed && (
        <>
          <span className="relative flex-1">{item.title}</span>
          {item.badge && (
            <Badge
              variant={isActive ? "secondary" : "outline"}
              className={cn(
                "text-[10px] px-1.5 py-0",
                isActive && "bg-white/20 text-white border-white/30"
              )}
            >
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  )
}

// Mobile Bottom Navigation with FAB
function MobileSidebar({ onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setShowMenu(false)
  }, [pathname])

  const isActive = (href: string) => {
    if (!isMounted) return false
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  // Primary nav items (first 4 for bottom nav)
  const primaryNavItems = menuItems.slice(0, 4)
  // Secondary items for FAB menu
  const fabMenuItems = menuItems.slice(4)

  if (!isMounted) return null

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-4 left-4 right-20 bg-gradient-to-r from-primary/90 to-primary/75 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-full lg:hidden z-50"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-12 px-2">
          {primaryNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-95"
              >
                {active ? (
                  <div className="flex flex-row items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/20 transition-all duration-300">
                    <Icon className="h-4 w-4 text-white" />
                    <span className="text-[10px] font-semibold text-white whitespace-nowrap">
                      {item.title}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-2">
                    <Icon className="h-5 w-5 text-white/70 hover:text-white/90 transition-all duration-300" />
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* FAB Button */}
      <div className="fixed bottom-4 right-4 lg:hidden z-50">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 border-2 border-white/20"
          aria-label="More options"
        >
          {showMenu ? (
            <ChevronLeft className="h-5 w-5 text-white rotate-90" />
          ) : (
            <Menu className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      {/* FAB Menu */}
      {showMenu && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute bottom-20 right-4 left-4 md:left-auto md:right-4 bg-background/95 backdrop-blur-lg rounded-2xl shadow-2xl border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col p-2 min-w-[180px]">
              {fabMenuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMenu(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 active:scale-95",
                      active
                        ? "bg-gradient-to-r text-white " + item.gradient
                        : "hover:bg-accent/50"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                )
              })}

              {/* Sign Out in FAB menu */}
              <div className="border-t mt-2 pt-2">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onSignOut?.()
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-destructive hover:bg-destructive/10 transition-all duration-200 active:scale-95"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Desktop Sidebar Component
function DesktopSidebar({ onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const { collapsed, toggleCollapsed } = useSidebarStore()

  return (
    <aside
      className={cn(
        "hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col border-r transition-all duration-300 ease-in-out",
        "bg-gradient-to-b from-background via-background to-muted/20",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Logo Header */}
      <div className={cn(
        "flex h-20 items-center border-b transition-all duration-300",
        collapsed ? "justify-center px-2" : "justify-between px-6"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">JKKN Dental</h1>
              <p className="text-xs text-muted-foreground">Point of Sale</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className={cn(
            "h-10 w-10 rounded-xl transition-all duration-300",
            collapsed && "rotate-180"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Main Menu
          </p>
        )}
        {menuItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
          return (
            <NavItem
              key={item.href}
              item={item}
              isActive={isActive}
              collapsed={collapsed}
            />
          )
        })}

        {!collapsed && (
          <>
            <div className="my-4 border-t" />
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Management
            </p>
          </>
        )}
        {collapsed && <div className="my-2" />}

        {menuItems.slice(4).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <NavItem
              key={item.href}
              item={item}
              isActive={isActive}
              collapsed={collapsed}
            />
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          className={cn(
            "w-full rounded-xl h-12 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300",
            collapsed ? "justify-center px-2" : "justify-start gap-3"
          )}
          onClick={onSignOut}
          title={collapsed ? "Sign Out" : undefined}
        >
          <div className={cn(
            "flex items-center justify-center rounded-lg bg-muted/50",
            collapsed ? "h-10 w-10" : "h-9 w-9"
          )}>
            <LogOut className="h-5 w-5" />
          </div>
          {!collapsed && <span className="font-medium">Sign Out</span>}
        </Button>
      </div>
    </aside>
  )
}

export function Sidebar({ onSignOut }: SidebarProps) {
  return (
    <>
      <MobileSidebar onSignOut={onSignOut} />
      <DesktopSidebar onSignOut={onSignOut} />
    </>
  )
}
