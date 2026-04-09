"use client";

import { useState, useCallback } from "react";

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return { collapsed, mobileOpen, toggleCollapsed, openMobile, closeMobile };
}
