"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CanvasNav from "./CanvasNav";
import styles from "./SidebarNav.module.css";

const SlidersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
    <path d="M1 14h6M9 8h6M17 16h6" />
  </svg>
);

const ITEMS = [{ href: "/project/settings", label: "Project Settings", Icon: SlidersIcon }];

// Project-level navigation; only meaningful once a project exists.
export default function SidebarNav({ project }) {
  const pathname = usePathname();
  if (!project) return null;

  return (
    <nav className={styles.nav} aria-label="Project">
      <CanvasNav projectId={project.id} />
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className={styles.item} data-active={active || undefined} aria-current={active ? "page" : undefined}>
            <span className={styles.caretSlot} aria-hidden="true" />
            <span className={styles.icon}>
              <Icon />
            </span>
            <span className={styles.label}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
