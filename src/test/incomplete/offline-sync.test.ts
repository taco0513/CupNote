import { describe, it, expect, beforeEach, vi } from 'vitest'

import { OfflineStorage } from '../offline-storage'
import { OfflineSync } from '../offline-sync'

import type { CoffeeRecord } from '@/types/coffee'

// Mock dependencies
vi.mock('../offline-storage')
vi.mock('../supabase-storage')

const mockOfflineStorage = {
  getPendingRecords: vi.fn(),
  updateSyncStatus: vi.fn(),
  deleteRecord: vi.fn(),
}

const mockSupabaseStorage = {
  saveRecord: vi.fn(),
  updateRecord: vi.fn(),
}

vi.mocked(OfflineStorage).mockImplementation(() => mockOfflineStorage as any)

describe('OfflineSync', () => {
  let offlineSync: OfflineSync
  const mockRecord: CoffeeRecord = {
    id: 'test-id',
    userId: 'test-user',
    coffeeName: 'Test Coffee',
    roastery: 'Test Roastery',
    origin: 'Ethiopia',
    roastLevel: 'Medium',
    brewMethod: 'V60',
    taste: 'Fruity',
    memo: 'Great coffee',
    rating: 4,
    mode: 'cafe',
    createdAt: '2025-01-31T10:00:00Z',
    updatedAt: '2025-01-31T10:00:00Z',
    images: [],
    matchScore: {
      overall: 85,
      flavorMatching: 80,
      expressionAccuracy: 90,
      consistency: 85,
      strengths: ['Good flavor description'],
      improvements: ['More detailed notes'],
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    offlineSync = new OfflineSync()
  })

  describe('sync', () => {
    it('should sync pending records successfully', async () => {
      const pendingRecords = [mockRecord]
      mockOfflineStorage.getPendingRecords.mockResolvedValue(pendingRecords)
      mockSupabaseStorage.saveRecord.mockResolvedValue(mockRecord)

      const result = await offlineSync.sync()

      expect(result).toEqual({ synced: 1, failed: 0 })
      expect(mockOfflineStorage.getPendingRecords).toHaveBeenCalled()
      expect(mockSupabaseStorage.saveRecord).toHaveBeenCalledWith(mockRecord)
      expect(mockOfflineStorage.updateSyncStatus).toHaveBeenCalledWith('test-id', 'synced')
    })

    it('should handle sync failures gracefully', async () => {
      const pendingRecords = [mockRecord]
      mockOfflineStorage.getPendingRecords.mockResolvedValue(pendingRecords)
      mockSupabaseStorage.saveRecord.mockRejectedValue(new Error('Network error'))

      const result = await offlineSync.sync()

      expect(result).toEqual({ synced: 0, failed: 1 })
      expect(mockOfflineStorage.updateSyncStatus).not.toHaveBeenCalled()
    })

    it('should return zero counts when no pending records', async () => {
      mockOfflineStorage.getPendingRecords.mockResolvedValue([])

      const result = await offlineSync.sync()

      expect(result).toEqual({ synced: 0, failed: 0 })
      expect(mockSupabaseStorage.saveRecord).not.toHaveBeenCalled()
    })

    it('should handle mixed success and failure scenarios', async () => {
      const pendingRecords = [
        mockRecord,
        { ...mockRecord, id: 'test-id-2' },
        { ...mockRecord, id: 'test-id-3' },
      ]
      mockOfflineStorage.getPendingRecords.mockResolvedValue(pendingRecords)
      mockSupabaseStorage.saveRecord
        .mockResolvedValueOnce(mockRecord) // First record succeeds
        .mockRejectedValueOnce(new Error('Network error')) // Second record fails
        .mockResolvedValueOnce({ ...mockRecord, id: 'test-id-3' }) // Third record succeeds

      const result = await offlineSync.sync()

      expect(result).toEqual({ synced: 2, failed: 1 })
      expect(mockOfflineStorage.updateSyncStatus).toHaveBeenCalledTimes(2)
      expect(mockOfflineStorage.updateSyncStatus).toHaveBeenCalledWith('test-id', 'synced')
      expect(mockOfflineStorage.updateSyncStatus).toHaveBeenCalledWith('test-id-3', 'synced')
    })

    it('should handle offline storage errors', async () => {
      mockOfflineStorage.getPendingRecords.mockRejectedValue(new Error('Storage error'))

      await expect(offlineSync.sync()).rejects.toThrow('Storage error')
    })
  })

  describe('schedulePeriodic', () => {
    it('should schedule periodic sync', () => {
      const mockSetInterval = vi.fn()
      vi.stubGlobal('setInterval', mockSetInterval)

      offlineSync.schedulePeriodic(30000) // 30 seconds

      expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 30000)
    })

    it('should use default interval when not specified', () => {
      const mockSetInterval = vi.fn()
      vi.stubGlobal('setInterval', mockSetInterval)

      offlineSync.schedulePeriodic()

      expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 300000) // 5 minutes
    })
  })

  describe('stopPeriodic', () => {
    it('should stop periodic sync', () => {
      const mockClearInterval = vi.fn()
      vi.stubGlobal('clearInterval', mockClearInterval)
      
      // Start periodic sync first
      const mockSetInterval = vi.fn(() => 'interval-id')
      vi.stubGlobal('setInterval', mockSetInterval)
      offlineSync.schedulePeriodic()

      // Then stop it
      offlineSync.stopPeriodic()

      expect(mockClearInterval).toHaveBeenCalledWith('interval-id')
    })

    it('should handle stopping when no periodic sync is active', () => {
      const mockClearInterval = vi.fn()
      vi.stubGlobal('clearInterval', mockClearInterval)

      expect(() => offlineSync.stopPeriodic()).not.toThrow()
    })
  })

  describe('getStatus', () => {
    it('should return sync status', async () => {
      const pendingRecords = [mockRecord, { ...mockRecord, id: 'test-id-2' }]
      mockOfflineStorage.getPendingRecords.mockResolvedValue(pendingRecords)

      const status = await offlineSync.getStatus()

      expect(status).toEqual({
        isPending: true,
        pendingCount: 2,
        lastSync: null,
        isOnline: true,
      })
    })

    it('should return no pending status when no records', async () => {
      mockOfflineStorage.getPendingRecords.mockResolvedValue([])

      const status = await offlineSync.getStatus()

      expect(status).toEqual({
        isPending: false,
        pendingCount: 0,
        lastSync: null,
        isOnline: true,
      })
    })

    it('should handle offline status', async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })

      mockOfflineStorage.getPendingRecords.mockResolvedValue([])

      const status = await offlineSync.getStatus()

      expect(status.isOnline).toBe(false)
    })
  })
})