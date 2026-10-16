"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import FileTree from "./FileTree";
import styles from "./SidebarNav.module.css";

const SlidersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
    <path d="M1 14h6M9 8h6M17 16h6" />
  </svg>
);

const CanvasIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="6" height="6" x="3" y="3" rx="1.5" />
    <rect width="6" height="6" x="15" y="15" rx="1.5" />
    <rect width="6" height="6" x="15" y="3" rx="1.5" />
    <path d="M9 6h6M6 9v6a3 3 0 0 0 3 3h6" />
  </svg>
);

// Project-level navigation; only meaningful once a project exists.
export default function SidebarNav({ project, nodes }) {
  const pathname = usePathname();
  if (!project) return null;

  const items = [
    { href: "/", label: "Project Canvas", Icon: CanvasIcon },
    { href: "/project/settings", label: "Project Settings", Icon: SlidersIcon },
  ];

  const link = ({ href, label, Icon }) => {
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
  };

  return (
    <nav className={styles.nav} aria-label="Project">
      <FileTree
        projectId={project.id}
        nodes={nodes}
        selectedId={pathname.startsWith("/file/") ? pathname.slice("/file/".length) : null}
        root={{ label: "Project Canvas", icon: <CanvasIcon /> }}
      />
      {link(items[1])}
    </nav>
  );
}
