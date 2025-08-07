// Static params generation for Capacitor static export
// Since record IDs are dynamic, we'll return empty array for now
// The app will handle these routes dynamically at runtime
export async function generateStaticParams() {
  return []
}

export default function RecordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}