import { makeAutoObservable } from 'mobx'
import { dreamsAPI, recordDonation } from '../services/api'
import type { CreateDreamInput, Dream as ApiDream, DreamStats } from '../services/api'

export interface Dream {
  id: string
  title: string
  description: string
  image?: string
  owner: {
    address: string
    rating?: number
  }
  raised: number
  rating: number
  goal?: number
  currency: string
  donorsCount: number
  createdAt: string
  status?: string
  isWithdrawn?: boolean
}

export class DreamStore {
  dreams: Dream[] = []
  isLoading = false
  error: string | null = null
  stats: DreamStats | null = null

  constructor() {
    makeAutoObservable(this)
  }

  private mapDream(apiDream: ApiDream): Dream {
    return {
      id: String(apiDream.id),
      title: apiDream.title,
      description: apiDream.description,
      image: apiDream.imageUrl,
      owner: {
        address: apiDream.user?.walletAddress || 'Unknown',
        rating: apiDream.user?.rating,
      },
      raised: apiDream.totalDonations || 0,
      rating: apiDream.rating || 0,
      goal: apiDream.goal,
      currency: apiDream.currency || 'USDC',
      donorsCount: apiDream._count?.donations || 0,
      createdAt: apiDream.createdAt,
      status: apiDream.status,
      isWithdrawn: apiDream.isWithdrawn,
    }
  }

  async loadDreams(page: number = 1, limit: number = 10) {
    this.isLoading = true
    this.error = null
    try {
      const skip = Math.max(page - 1, 0) * limit
      const data = await dreamsAPI.getAll(skip, limit)
      this.dreams = data.map((dream) => this.mapDream(dream))
      console.log(`✅ Loaded ${data.length} dreams`)
    } catch (err) {
      this.error = (err as Error).message
      console.error('❌ Error loading dreams:', err)
    } finally {
      this.isLoading = false
    }
  }

  async loadDreamsByType(type: 'top' | 'new' | 'random' | 'completed') {
    this.isLoading = true
    this.error = null
    try {
      let data: ApiDream[] = []

      if (type === 'top') {
        data = await dreamsAPI.getTop(10)
        // Filter out completed dreams from top
        data = data.filter(dream => dream.status !== 'COMPLETED')
      } else if (type === 'new') {
        data = await dreamsAPI.getNew(10)
        // Filter out completed dreams from new
        data = data.filter(dream => dream.status !== 'COMPLETED')
      } else if (type === 'random') {
        data = await dreamsAPI.getAll(0, 50)
        data = data.sort(() => Math.random() - 0.5).slice(0, 10)
        // Filter out completed dreams from random
        data = data.filter(dream => dream.status !== 'COMPLETED')
      } else if (type === 'completed') {
        data = await dreamsAPI.getCompleted(10)
      }

      this.dreams = data.map((dream) => this.mapDream(dream))
      console.log(`✅ Loaded ${data.length} ${type} dreams`)
    } catch (err) {
      this.error = (err as Error).message
      console.error(`❌ Error loading ${type} dreams:`, err)
    } finally {
      this.isLoading = false
    }
  }

  async loadUserDreams(userAddress: string) {
    this.isLoading = true
    this.error = null
    try {
      const data = await dreamsAPI.getAll(0, 100)
      const mapped = data.map((dream) => this.mapDream(dream))
      this.dreams = mapped.filter(
        (dream) => dream.owner.address.toLowerCase() === userAddress.toLowerCase(),
      )
      console.log(`✅ Loaded ${this.dreams.length} dreams for user ${userAddress.slice(0, 6)}...`)
    } catch (err) {
      this.error = (err as Error).message
      console.error('❌ Error loading user dreams:', err)
    } finally {
      this.isLoading = false
    }
  }

  async recordDonation(
    dreamId: number,
    amount: string,
    donorAddress: string,
    txHash: string,
    currency: string = 'USDC',
  ) {
    try {
      const result = await recordDonation({
        dreamId: dreamId.toString(),
        amount,
        txHash,
        donor: donorAddress,
        currency,
      })
      
      // Update dream in local state
      const dream = this.dreams.find(d => d.id === dreamId.toString())
      if (dream) {
        const amountValue = parseFloat(amount)
        if (!Number.isNaN(amountValue)) {
          dream.raised += amountValue
          dream.donorsCount += 1
          dream.rating += amountValue
        }
      }
      
      console.log(`✅ Donation recorded in store for dream #${dreamId}`)
      this.loadDreamStats()
      return result
    } catch (err) {
      this.error = (err as Error).message
      console.error('❌ Error recording donation:', err)
      throw err
    }
  }

  async createDream(data: CreateDreamInput, addToStore: boolean = false) {
    this.isLoading = true
    this.error = null
    try {
      const created = await dreamsAPI.create(data)
      if (addToStore) {
        const mapped = this.mapDream(created)
        this.dreams = [mapped, ...this.dreams]
      }
      return created
    } catch (err) {
      this.error = (err as Error).message
      console.error('❌ Error creating dream:', err)
      throw err
    } finally {
      this.isLoading = false
    }
  }

  async getNextDreamId() {
    return dreamsAPI.getNextId()
  }

  async loadDreamStats() {
    try {
      this.stats = await dreamsAPI.getStats()
    } catch (err) {
      console.error('❌ Error loading dream stats:', err)
    }
  }

  addDreamFromApi(created: ApiDream) {
    const mapped = this.mapDream(created)
    this.dreams = [mapped, ...this.dreams]
  }

  getDreamById(id: string): Dream | undefined {
    return this.dreams.find(d => d.id === id)
  }

  async withdrawFunds(dreamId: string) {
    try {
      const result = await dreamsAPI.withdraw(parseInt(dreamId))
      // Update the dream in the local store with the withdrawn status
      const dreamIndex = this.dreams.findIndex(d => d.id === dreamId)
      if (dreamIndex >= 0) {
        this.dreams[dreamIndex] = this.mapDream(result)
      }
      return result
    } catch (err) {
      console.error('❌ Error withdrawing funds:', err)
      throw err
    }
  }

  clearError() {
    this.error = null
  }
}
