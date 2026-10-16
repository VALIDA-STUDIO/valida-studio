import { Suspense } from "react";
import Shell from "../Shell";

// The sidebar lives in the layout so it stays mounted while pages swap underneath it.
export default function AppLayout({ children }) {
  return (
    <Suspense fallback={null}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
