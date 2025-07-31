import { offlineStorage } from './offline-storage'
import { SupabaseStorage } from './supabase-storage'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export class OfflineSync {
  private syncInProgress = false
  private syncInterval: NodeJS.Timeout | null = null

  // Start periodic sync
  startSync(intervalMs: number = 60000): void {
    if (this.syncInterval) return

    // Initial sync
    this.sync()

    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.sync()
    }, intervalMs)

    // Sync when coming back online
    window.addEventListener('online', () => {
      console.log('Back online, syncing...')
      this.sync()
    })
  }

  // Stop periodic sync
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Manual sync
  async sync(): Promise<{ synced: number; failed: number }> {
    if (this.syncInProgress) {
      console.log('Sync already in progress')
      return { synced: 0, failed: 0 }
    }

    if (!navigator.onLine) {
      console.log('Offline, skipping sync')
      return { synced: 0, failed: 0 }
    }

    this.syncInProgress = true
    let synced = 0
    let failed = 0

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user, skipping sync')
        return { synced: 0, failed: 0 }
      }

      // Get pending records
      const pendingRecords = await offlineStorage.getPendingRecords(user.id)
      console.log(`Found ${pendingRecords.length} pending records`)

      // Sync each record
      for (const record of pendingRecords) {
        try {
          // Remove sync-specific fields
          const { syncStatus, syncError, lastAttempt, ...recordData } = record

          // Try to save to Supabase
          const savedRecord = await SupabaseStorage.addRecord(recordData)

          if (savedRecord) {
            // Update local record as synced
            await offlineStorage.updateSyncStatus(record.id, 'synced')
            synced++
            console.log(`Synced record: ${record.id}`)
          } else {
            throw new Error('Failed to save to Supabase')
          }
        } catch (error) {
          console.error(`Failed to sync record ${record.id}:`, error)
          await offlineStorage.updateSyncStatus(
            record.id,
            'error',
            error instanceof Error ? error.message : 'Unknown error'
          )
          failed++
        }
      }

      // Fetch latest records from Supabase
      const remoteRecords = await SupabaseStorage.getRecords()

      // Update local cache with remote records
      for (const record of remoteRecords) {
        await offlineStorage.saveRecord(record, 'synced')
      }

      console.log(`Sync complete: ${synced} synced, ${failed} failed`)

      // Notify UI about sync completion
      window.dispatchEvent(
        new CustomEvent('cupnote-sync-complete', {
          detail: { synced, failed },
        })
      )
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      this.syncInProgress = false
    }

    return { synced, failed }
  }

  // Check if we have pending changes
  async hasPendingChanges(): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    const pendingRecords = await offlineStorage.getPendingRecords(user.id)
    return pendingRecords.length > 0
  }

  // Get sync status
  getSyncStatus(): { inProgress: boolean } {
    return { inProgress: this.syncInProgress }
  }
}

// Singleton instance
export const offlineSync = new OfflineSync()

// Auto-start sync when module loads
if (typeof window !== 'undefined') {
  offlineSync.startSync()
}
