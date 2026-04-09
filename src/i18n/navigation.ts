/**
 * Typed navigation utilities from next-intl.
 * Import `useRouter`, `usePathname`, `Link`, and `redirect` from here
 * instead of `next/navigation` when you need locale-aware navigation.
 *
 * This ensures locale is automatically preserved in all navigation calls.
 */
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
