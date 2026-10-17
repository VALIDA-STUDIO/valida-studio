// Sidebar search; it doesn't search anything yet.
import styles from "./SearchBar.module.css";

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export default function SearchBar() {
  return (
    <label className={styles.search}>
      <SearchIcon />
      <input type="search" placeholder="Search" aria-label="Search" autoComplete="off" spellCheck={false} />
      <kbd className={styles.kbd}>⌘K</kbd>
    </label>
  );
}
