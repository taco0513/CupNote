// Static params generation for Capacitor static export
export async function generateStaticParams() {
  return [
    { mode: 'cafe' },
    { mode: 'homecafe' }
  ]
}

export default function ModeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}