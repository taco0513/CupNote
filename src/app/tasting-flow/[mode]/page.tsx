/**
 * Mode Entry Point - App Router Optimized
 * /tasting-flow/[mode] 접근 시 적절한 첫 번째 단계로 리다이렉트
 */
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

// Route Segment Config
export const dynamic = 'auto'
export const revalidate = false // Static generation for valid modes

// Generate static params for known modes
export async function generateStaticParams() {
  return [
    { mode: 'cafe' },
    { mode: 'homecafe' }
  ]
}

// Generate metadata for each mode
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ mode: string }> 
}): Promise<Metadata> {
  const { mode } = await params
  
  const modeNames = {
    cafe: '카페 모드',
    homecafe: '홈카페 모드'
  } as const

  const modeName = modeNames[mode as keyof typeof modeNames] || '테이스팅 플로우'
  
  return {
    title: `${modeName} - CupNote`,
    description: `${modeName}로 커피를 기록하세요. 전문적인 테이스팅 노트와 개인적인 감상을 남길 수 있습니다.`,
    openGraph: {
      title: `${modeName} - CupNote`,
      description: `${modeName}로 커피를 기록하세요.`,
    }
  }
}

interface ModeEntryPageProps {
  params: Promise<{
    mode: string
  }>
}

export default async function ModeEntryPage({ params }: ModeEntryPageProps) {
  const { mode } = await params

  // Server-side validation and redirect for invalid modes
  if (mode !== 'cafe' && mode !== 'homecafe') {
    redirect('/tasting-flow')
  }

  // For valid modes, redirect to first step
  redirect(`/tasting-flow/${mode}/coffee-info`)
}