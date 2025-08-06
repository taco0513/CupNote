/**
 * Custom hook for managing coffee records
 * 중복되는 레코드 로딩 로직을 통합
 */
import { useState, useEffect } from 'react'
import { CoffeeRecord } from '../types/coffee'
import { SupabaseStorage } from '../lib/supabase-storage'

interface RecordsState {
  records: CoffeeRecord[]
  loading: boolean
  error: Error | null
}

interface RecordsStats {
  total: number
  thisMonth: number
  avgRating: number
}

export function useRecords() {
  const [state, setState] = useState<RecordsState>({
    records: [],
    loading: true,
    error: null
  })

  const [stats, setStats] = useState<RecordsStats>({
    total: 0,
    thisMonth: 0,
    avgRating: 0
  })

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const records = await SupabaseStorage.getRecords()
      
      if (records && records.length > 0) {
        setState(prev => ({ ...prev, records, loading: false }))
        
        // Calculate stats
        const now = new Date()
        const thisMonth = records.filter(r => {
          const recordDate = new Date(r.date)
          return recordDate.getMonth() === now.getMonth() && 
                 recordDate.getFullYear() === now.getFullYear()
        }).length
        
        const avgRating = records.reduce((sum, r) => {
          const rating = r.rating || r.overall || 0
          return sum + rating
        }, 0) / records.length
        
        setStats({ 
          total: records.length, 
          thisMonth, 
          avgRating: avgRating || 0 
        })
      } else {
        setState(prev => ({ ...prev, records: [], loading: false }))
      }
    } catch (error) {
      console.error('Failed to load records:', error)
      setState(prev => ({ 
        ...prev, 
        error: error as Error, 
        loading: false 
      }))
    }
  }

  const refresh = () => {
    loadRecords()
  }

  return {
    records: state.records,
    loading: state.loading,
    error: state.error,
    stats,
    refresh
  }
}

export function useRecentRecords(limit = 3) {
  const { records, loading, error, stats } = useRecords()
  
  const recentRecords = records
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
  
  return {
    recentRecords,
    loading,
    error,
    stats
  }
}