"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/types";

interface NavigationProps {
  items: NavItem[];
  mobile?: boolean;
  onClose?: () => void;
}

export function Navigation({ items, mobile = false, onClose }: NavigationProps) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  if (mobile) {
    return (
      <nav className="flex flex-col gap-1 py-4">
        {items.map((item) => (
          <div key={item.href}>
            {item.children ? (
              <>
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === item.label ? null : item.label)
                  }
                  className="flex w-full items-center justify-between px-4 py-2.5 text-text hover:text-primary hover:bg-background-neutral rounded-lg transition-colors"
                >
                  <span className="font-medium">{item.label}</span>
                  <span
                    className={cn(
                      "transition-transform duration-200",
                      openDropdown === item.label ? "rotate-180" : ""
                    )}
                  >
                    ▾
                  </span>
                </button>
                {openDropdown === item.label && (
                  <div className="pl-4 mt-1 flex flex-col gap-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm transition-colors",
                          pathname === child.href
                            ? "bg-primary text-white font-semibold"
                            : "text-text-secondary hover:text-primary hover:bg-background-neutral"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "block px-4 py-2.5 rounded-lg font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-white"
                    : "text-text hover:text-primary hover:bg-background-neutral"
                )}
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-1">
      {items.map((item) => (
        <div key={item.href} className="relative group">
          {item.children ? (
            <>
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-text hover:text-primary hover:bg-background-neutral font-medium transition-colors text-sm">
                {item.label}
                <span className="text-xs opacity-60 group-hover:rotate-180 transition-transform duration-200">
                  ▾
                </span>
              </button>
              <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-background-neutral rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-1.5 flex flex-col gap-0.5">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "block px-3 py-2 rounded-lg text-sm transition-colors",
                        pathname === child.href
                          ? "bg-primary text-white font-semibold"
                          : "text-text hover:text-primary hover:bg-background-neutral"
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <Link
              href={item.href}
              className={cn(
                "block px-3 py-2 rounded-lg font-medium text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary text-white"
                  : "text-text hover:text-primary hover:bg-background-neutral"
              )}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
