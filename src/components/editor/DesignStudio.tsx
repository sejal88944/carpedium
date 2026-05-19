'use client'

import { useSearchParams } from 'next/navigation'
import { TeeDesigner } from './TeeDesigner'
import type { TeeColorId } from '@/data/brand'

export function DesignStudio() {
  const params = useSearchParams()
  const color = (params.get('color') as TeeColorId) || 'black'
  return <TeeDesigner initialColorId={color} />
}
