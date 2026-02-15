import { makeAutoObservable } from 'mobx'
import { usersAPI } from '../services/api'
import type { Dream as ApiDream, User } from '../services/api'

type ProfileTab = 'created' | 'donated' | 'completed'

export class ProfileStore {
  // User profile
  currentUser: User | null = null
  initialLoading = false
  userError: string | null = null

  // Dreams data
  createdDreams: ApiDream[] = []
  donatedDreams: ApiDream[] = []
  completedDreams: ApiDream[] = []

  loadingCreated = false
  loadingDonated = false
  loadingCompleted = false

  error: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  async loadUserProfile(walletAddress: string) {
    this.initialLoading = true
    this.userError = null
    try {
      console.log(`👤 Loading profile for ${walletAddress}...`)
      const userData = await usersAPI.getByWallet(walletAddress)
      if (!userData) {
        console.warn(`⚠️ User not found: ${walletAddress}`)
        this.userError = 'User not found'
        this.currentUser = null
        return
      }
      console.log(`✅ Profile loaded for ${userData.username || userData.walletAddress}`)
      this.currentUser = userData
    } catch (err) {
      this.userError = (err as Error).message
      console.error('❌ Error loading user profile:', err)
      this.currentUser = null
    } finally {
      this.initialLoading = false
    }
  }

  async loadCreatedDreams(walletAddress: string) {
    this.loadingCreated = true
    this.error = null
    try {
      console.log(`📥 Loading created dreams for ${walletAddress}...`)
      this.createdDreams = await usersAPI.getCreatedDreams(walletAddress)
      console.log(`✅ Loaded ${this.createdDreams.length} created dreams`)
    } catch (err) {
      this.error = (err as Error).message
      console.error(`❌ Error loading created dreams:`, err)
      this.createdDreams = []
    } finally {
      this.loadingCreated = false
    }
  }

  async loadDonatedDreams(walletAddress: string) {
    this.loadingDonated = true
    this.error = null
    try {
      console.log(`📥 Loading donated dreams for ${walletAddress}...`)
      const donations = await usersAPI.getDonatedDreams(walletAddress)
      console.log(`✅ Loaded ${donations.length} donations`)

      // Remove duplicates - keep only unique dreams
      const dreamMap = new Map<number, ApiDream>()
      donations.forEach(d => {
        if (d.dream && !dreamMap.has(d.dream.id)) {
          dreamMap.set(d.dream.id, d.dream)
        }
      })
      this.donatedDreams = Array.from(dreamMap.values())
      console.log(`✅ After deduplication: ${this.donatedDreams.length} unique dreams`)
    } catch (err) {
      this.error = (err as Error).message
      console.error(`❌ Error loading donated dreams:`, err)
      this.donatedDreams = []
    } finally {
      this.loadingDonated = false
    }
  }

  async loadCompletedDreams(walletAddress: string) {
    this.loadingCompleted = true
    this.error = null
    try {
      console.log(`📥 Loading completed dreams for ${walletAddress}...`)
      this.completedDreams = await usersAPI.getCompletedDreams(walletAddress)
      console.log(`✅ Loaded ${this.completedDreams.length} completed dreams`)
    } catch (err) {
      this.error = (err as Error).message
      console.error(`❌ Error loading completed dreams:`, err)
      this.completedDreams = []
    } finally {
      this.loadingCompleted = false
    }
  }

  async loadTabDreams(walletAddress: string, tab: ProfileTab) {
    switch (tab) {
      case 'created':
        return this.loadCreatedDreams(walletAddress)
      case 'donated':
        return this.loadDonatedDreams(walletAddress)
      case 'completed':
        return this.loadCompletedDreams(walletAddress)
    }
  }

  getTabDreams(tab: ProfileTab): ApiDream[] {
    switch (tab) {
      case 'created':
        return this.createdDreams
      case 'donated':
        return this.donatedDreams
      case 'completed':
        return this.completedDreams
    }
  }

  isTabLoading(tab: ProfileTab): boolean {
    switch (tab) {
      case 'created':
        return this.loadingCreated
      case 'donated':
        return this.loadingDonated
      case 'completed':
        return this.loadingCompleted
    }
  }

  clearProfileData() {
    this.createdDreams = []
    this.donatedDreams = []
    this.completedDreams = []
    this.error = null
    this.userError = null
  }
}
