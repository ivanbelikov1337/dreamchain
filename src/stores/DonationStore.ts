import { makeAutoObservable } from 'mobx'
import { donationsAPI } from '../services/api'
import type { Donation } from '../services/api'

export class DonationStore {
  donationsByWallet: Donation[] = []
  donationsLoading = false
  donationsError: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  async loadByWallet(address: string) {
    this.donationsLoading = true
    this.donationsError = null
    try {
      this.donationsByWallet = await donationsAPI.getByWallet(address)
    } catch (err) {
      this.donationsError = err instanceof Error ? err.message : 'Failed to load donations'
      console.error('Error fetching donations:', err)
    } finally {
      this.donationsLoading = false
    }
  }
}
