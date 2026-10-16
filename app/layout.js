import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The title is rendered directly in <head> below (not via metadata) so it lives in the root
// layout, which never unmounts. Via metadata it sits in the page segment and briefly
// disappears on every client navigation, flashing the URL in the tab.
export const metadata = {
  description: "Valida Studio",
};

// Runs before first paint so the chosen theme never flashes.
const themeScript = `
(function(){try{
  var t=localStorage.getItem("theme");
  if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);
  if(localStorage.getItem("reduce-motion")==="1")document.documentElement.setAttribute("data-reduce-motion","");
}catch(e){}})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <title>Valida Studio</title>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
