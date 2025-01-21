import "./globals.css"
import { Bangers, Comic_Neue } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
})

const comicNeue = Comic_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-action-man",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${bangers.variable} ${comicNeue.variable}`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
} 