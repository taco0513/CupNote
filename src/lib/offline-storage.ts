import { CoffeeRecord } from '../types/coffee'

const DB_NAME = 'cupnote-offline'
const DB_VERSION = 1
const STORE_NAME = 'coffee_records'

interface OfflineRecord extends CoffeeRecord {
  syncStatus: 'pending' | 'synced' | 'error'
  syncError?: string
  lastAttempt?: Date
}

export class OfflineStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create coffee records store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('syncStatus', 'syncStatus', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('userId', 'userId', { unique: false })
        }
      }
    })
  }

  async saveRecord(
    record: CoffeeRecord,
    syncStatus: 'pending' | 'synced' = 'pending'
  ): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const offlineRecord: OfflineRecord = {
        ...record,
        syncStatus,
        lastAttempt: syncStatus === 'pending' ? undefined : new Date(),
      }

      const request = store.put(offlineRecord)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getRecords(userId: string): Promise<OfflineRecord[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('userId')
      const request = index.getAll(userId)

      request.onsuccess = () => {
        const records = request.result as OfflineRecord[]
        resolve(
          records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        )
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingRecords(userId: string): Promise<OfflineRecord[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const records: OfflineRecord[] = []

      const request = store.openCursor()
      request.onsuccess = event => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const record = cursor.value as OfflineRecord
          if (record.userId === userId && record.syncStatus === 'pending') {
            records.push(record)
          }
          cursor.continue()
        } else {
          resolve(records)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async updateSyncStatus(
    recordId: string,
    status: 'synced' | 'error',
    error?: string
  ): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(recordId)

      request.onsuccess = () => {
        const record = request.result as OfflineRecord
        if (record) {
          record.syncStatus = status
          record.lastAttempt = new Date()
          if (error) record.syncError = error

          const updateRequest = store.put(record)
          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async deleteRecord(recordId: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(recordId)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage()
