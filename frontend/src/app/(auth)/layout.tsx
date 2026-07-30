import "~/styles/globals.css";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "~/components/ui/providers";

export const metadata: Metadata = {
  title: "Music Generator",
  description: "Music Generator",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="flex min-h-svh flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}