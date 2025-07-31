import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OfflineStorage } from '../offline-storage'
import type { CoffeeRecord } from '@/types/coffee'

// Mock IndexedDB
const mockDB = {
  transaction: vi.fn(() => ({
    objectStore: vi.fn(() => ({
      add: vi.fn(() => ({ onsuccess: null, onerror: null })),
      get: vi.fn(() => ({ onsuccess: null, onerror: null })),
      getAll: vi.fn(() => ({ onsuccess: null, onerror: null })),
      put: vi.fn(() => ({ onsuccess: null, onerror: null })),
      delete: vi.fn(() => ({ onsuccess: null, onerror: null })),
      clear: vi.fn(() => ({ onsuccess: null, onerror: null })),
      index: vi.fn(() => ({
        getAll: vi.fn(() => ({ onsuccess: null, onerror: null })),
      })),
    })),
  })),
  close: vi.fn(),
}

const mockIndexedDB = {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: mockDB,
  })),
  deleteDatabase: vi.fn(),
}

vi.stubGlobal('indexedDB', mockIndexedDB)

describe('OfflineStorage', () => {
  let offlineStorage: OfflineStorage
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
    offlineStorage = new OfflineStorage()
  })

  describe('initialization', () => {
    it('should initialize with correct database name and version', () => {
      expect(mockIndexedDB.open).toHaveBeenCalledWith('CupNoteOffline', 1)
    })
  })

  describe('saveRecord', () => {
    it('should save record with pending sync status by default', async () => {
      const mockTransaction = {
        objectStore: vi.fn(() => ({
          add: vi.fn(() => {
            const request = { onsuccess: null, onerror: null }
            setTimeout(() => request.onsuccess?.({}), 0)
            return request
          }),
        })),
      }
      mockDB.transaction.mockReturnValue(mockTransaction)

      await offlineStorage.saveRecord(mockRecord)

      expect(mockDB.transaction).toHaveBeenCalledWith(['records'], 'readwrite')
      expect(mockTransaction.objectStore).toHaveBeenCalledWith('records')
    })

    it('should save record with custom sync status', async () => {
      const mockTransaction = {
        objectStore: vi.fn(() => ({
          add: vi.fn(() => {
            const request = { onsuccess: null, onerror: null }
            setTimeout(() => request.onsuccess?.({}), 0)
            return request
          }),
        })),
      }
      mockDB.transaction.mockReturnValue(mockTransaction)

      await offlineStorage.saveRecord(mockRecord, 'synced')

      expect(mockDB.transaction).toHaveBeenCalledWith(['records'], 'readwrite')
    })

    it('should handle save errors', async () => {
      const mockTransaction = {
        objectStore: vi.fn(() => ({
          add: vi.fn(() => {
            const request = { onsuccess: null, onerror: null }
            setTimeout(() => request.onerror?.(new Error('Save failed')), 0)
            return request
          }),
        })),
      }
      mockDB.transaction.mockReturnValue(mockTransaction)

      await expect(offlineStorage.saveRecord(mockRecord)).rejects.toThrow('Save failed')
    })
  })

  describe('getRecords', () => {
    it('should retrieve records for user', async () => {
      const mockRecords = [
        { ...mockRecord, syncStatus: 'pending' },
        { ...mockRecord, id: 'test-id-2', syncStatus: 'synced' },
      ]

      const mockTransaction = {
        objectStore: vi.fn(() => ({
          index: vi.fn(() => ({
            getAll: vi.fn(() => {
              const request = { onsuccess: null, onerror: null }
              setTimeout(() => {
                request.onsuccess?.({ target: { result: mockRecords } })
              }, 0)
              return request
            }),
          })),
        })),
      }
      mockDB.transaction.mockReturnValue(mockTransaction)

      const result = await offlineStorage.getRecords('test-user')

      expect(result).toEqual(mockRecords.map(r => ({ ...r, syncStatus: undefined })))
      expect(mockTransaction.objectStore).toHaveBeenCalledWith('records')
    })

    it('should handle retrieval errors', async () => {
      const mockTransaction = {
        objectStore: vi.fn(() => ({
          index: vi.fn(() => ({
            getAll: vi.fn(() => {
              const request = { onsuccess: null, onerror: null }
              setTimeout(() => request.onerror?.(new Error('Retrieval failed')), 0)
              return request
            }),
          })),
        })),
      }
      mockDB.transaction.mockReturnValue(mockTransaction)

      await expect(offlineStorage.getRecords('test-user')).rejects.toThrow('Retrieval failed')
    })
  })

  describe('getPendingRecords', () => {
    it('should retrieve only pending records', async () => {
      const mockPendingRecords = [
        { ...mockRecord, syncStatus: 'pending' },
      ]

      const mockTransaction = {
        objectStore: vi.fn(() => ({
          index: vi.fn(() => ({
            getAll: vi.fn(() => {
              const request = { onsuccess: null, onerror: null }
              setTimeout(() => {
                request.onsuccess?.({ target: { result: mockPendingRecords } })
              }, 0)
              return request
            }),
          })),
        })),
      }
      mockDB.transaction.mockReturnValue(mockTransaction)

      const result = await offlineStorage.getPendingRecords()

      expect(result).toEqual(mockPendingRecords.map(r => ({ ...r, syncStatus: undefined })))
    })
  })

  describe('updateSyncStatus', () => {
    it('should update record sync status', async () => {
      const mockTransaction = {
        objectStore: vi.fn(() => ({
          get: vi.fn(() => {
            const request = { onsuccess: null, onerror: null }
            setTimeout(() => {
              request.onsuccess?.({ target: { result: { ...mockRecord, syncStatus: 'pending' } } })
            }, 0)
            return request
          }),
          put: vi.fn(() => {
            const request = { onsuccess: null, onerror: null }
            setTimeout(() => request.onsuccess?.({}), 0)
            return request
          }),
        })),
      }
      mockDB.transaction.mockReturnValue(mockTransaction)

      await offlineStorage.updateSyncStatus('test-id', 'synced')

      expect(mockTransaction.objectStore).toHaveBeenCalledWith('records')
    })
  })

  describe('deleteRecord', () => {
    it('should delete record by id', async () => {
      const mockTransaction = {
        objectStore: vi.fn(() => ({
          delete: vi.fn(() => {
            const request = { onsuccess: null, onerror: null }
            setTimeout(() => request.onsuccess?.({}), 0)
            return request
          }),
        })),
      }
      mockDB.transaction.mockReturnValue(mockTransaction)

      await offlineStorage.deleteRecord('test-id')

      expect(mockTransaction.objectStore).toHaveBeenCalledWith('records')
    })
  })

  describe('clear', () => {
    it('should clear all records', async () => {
      const mockTransaction = {
        objectStore: vi.fn(() => ({
          clear: vi.fn(() => {
            const request = { onsuccess: null, onerror: null }
            setTimeout(() => request.onsuccess?.({}), 0)
            return request
          }),
        })),
      }
      mockDB.transaction.mockReturnValue(mockTransaction)

      await offlineStorage.clear()

      expect(mockTransaction.objectStore).toHaveBeenCalledWith('records')
    })
  })
})