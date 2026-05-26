export const metadata = {
  title: 'FSHOST - Free CS2 Server Hosting',
  description: 'Free Counter-Strike 2 server hosting powered by Coolify',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}