import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";


import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const instrumentSans = localFont({
  src: "./fonts/InstrumentSans-VariableFont_wdth,wght.ttf",
  variable: '--font-instrument-sans',
});

const itInstrumentSans = localFont({
  src: "./fonts/InstrumentSans-Italic-VariableFont_wdth,wght.ttf",
  variable: '--font-instrument-sans',
});

export const metadata: Metadata = {
  title: "dentnotes",
  description: "Create dental clinic notes like never before",
};

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={`${geistSans.variable} ${geistMono.variable}`}>
//         {children}
//       </body>
//     </html>
//   );
// }


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${instrumentSans.variable} ${itInstrumentSans.variable}`}>
        {children}
        {/* <SidebarProvider>
          <AppSidebar />
          <main>
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider> */}
      </body>
    </html>
  )
}
