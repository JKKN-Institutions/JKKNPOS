'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, User, Plus, Settings, HelpCircle, X } from 'lucide-react';

/**
 * Mobile Bottom Navigation with FAB - Compact Size Preset
 *
 * COMPACT PRESET - Space-efficient design for dense interfaces
 *
 * Spacing Configuration:
 * - Nav bar height: 48px (h-12)
 * - FAB button: 48px × 48px (w-12 h-12)
 * - Bottom offset: 16px (bottom-4)
 * - FAB right gap: 16px (right-4)
 * - Nav right gap: 80px (right-20) = 48px + (16px × 2)
 *
 * SPACING FORMULA: navRightGap = fabSize + (fabGap × 2)
 * Verification: 3rem + (1rem × 2) = 5rem (20 × 0.25rem = 80px) ✓
 */

const SPACING = {
  navHeight: 'h-12',                    // 48px (3rem)
  navBottomOffset: 'bottom-4',          // 16px (1rem)
  navLeftOffset: 'left-4',              // 16px (1rem)
  navRightGap: 'right-20',              // 80px (5rem)

  fabSize: 'w-12 h-12',                 // 48px × 48px (3rem)
  fabBottomOffset: 'bottom-4',          // 16px (1rem)
  fabRightGap: 'right-4',               // 16px (1rem)

  navIconSize: 18,
  fabIconSize: 16,
  fabMenuIconSize: 16,

  contentBottomPadding: 'pb-[calc(4.5rem+env(safe-area-inset-bottom))]',
};

const THEME = {
  navBg: 'from-[rgba(78,46,140,0.95)] to-[rgba(108,66,160,0.85)]',
  fabBg: 'from-[rgba(217,81,100,1)] to-[rgba(217,81,100,0.85)]',
  activeBg: 'bg-[rgba(50,30,90,0.9)]',
  menuBg: 'bg-[rgba(78,46,140,0.98)]',
  border: 'border-white/20',
};

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/products', icon: Package, label: 'Products' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart' },
  { href: '/profile', icon: User, label: 'Profile' },
];

const fabMenuItems = [
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/help', icon: HelpCircle, label: 'Help' },
];

const MobileBottomNav = () => {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setShowMenu(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (!isMounted) return false;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  if (!isMounted) return null;

  return (
    <>
      <nav
        className={`
          fixed ${SPACING.navBottomOffset} ${SPACING.navLeftOffset} ${SPACING.navRightGap}
          bg-gradient-to-r ${THEME.navBg} backdrop-blur-xl
          border ${THEME.border} shadow-[0_8px_32px_rgba(0,0,0,0.3)]
          rounded-full lg:hidden z-50 transform translate-z-0
        `}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className={`flex items-center justify-around ${SPACING.navHeight} px-2`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-95"
              >
                {active ? (
                  <div className={`flex flex-row items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-2xl ${THEME.activeBg} backdrop-blur-md shadow-lg border ${THEME.border} transition-all duration-300`}>
                    <Icon size={SPACING.navIconSize} strokeWidth={2.5} className="text-white transition-all duration-300" />
                    <span className="text-xs font-semibold text-white whitespace-nowrap">{item.label}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-1.5">
                    <Icon size={SPACING.navIconSize} strokeWidth={2} className="text-white/70 hover:text-white/90 transition-all duration-300" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className={`fixed ${SPACING.fabBottomOffset} ${SPACING.fabRightGap} lg:hidden z-50`}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`relative flex items-center justify-center ${SPACING.fabSize} rounded-full bg-gradient-to-br ${THEME.fabBg} shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 border-2 ${THEME.border} transform translate-z-0`}
          aria-label={showMenu ? 'Close menu' : 'Open menu'}
          aria-expanded={showMenu}
        >
          {showMenu ? (
            <X size={SPACING.fabIconSize} strokeWidth={2.5} className="text-white" />
          ) : (
            <Plus size={SPACING.fabIconSize} strokeWidth={2.5} className="text-white" />
          )}
        </button>
      </div>

      {showMenu && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200" onClick={() => setShowMenu(false)}>
          <div
            className={`absolute bottom-[4.5rem] ${SPACING.fabRightGap} ${THEME.menuBg} backdrop-blur-lg rounded-2xl shadow-2xl border ${THEME.border} overflow-hidden animate-in slide-in-from-bottom-4 duration-300 transform translate-z-0`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col p-2 min-w-[160px]">
              {fabMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"
                  >
                    <Icon size={SPACING.fabMenuIconSize} className="text-white/90" />
                    <span className="text-sm font-medium text-white">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;
