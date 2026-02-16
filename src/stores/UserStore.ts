import { makeAutoObservable } from 'mobx'
import { usersAPI } from '../services/api'
import type { User } from '../services/api'

export type UserLevel = 'Dreamer' | 'Supporter' | 'Angel' | 'Visionary'

export interface UserRating extends User {
  totalDonated: number
  totalReceived: number
  dreamsCreated: number
  level: UserLevel
}

export class UserStore {
  users: User[] = []
  usersLoading = false
  usersError: string | null = null

  currentUser: User | null = null
  currentUserLoading = false
  currentUserError: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  private getLevel(totalDonated: number): UserLevel {
    if (totalDonated >= 1000) return 'Visionary'
    if (totalDonated >= 500) return 'Angel'
    if (totalDonated >= 100) return 'Supporter'
    return 'Dreamer'
  }

  get userRatings(): UserRating[] {
    return [...this.users]
      .map((user) => {
        const totalDonated = user.totalDonated || 0
        return {
          ...user,
          totalDonated,
          totalReceived: user.totalReceived || 0,
          dreamsCreated: user.dreams?.length || 0,
          level: this.getLevel(totalDonated),
        }
      })
      .sort((a, b) => b.totalDonated - a.totalDonated)
  }

  async loadUsers() {
    this.usersLoading = true
    this.usersError = null
    try {
      this.users = await usersAPI.getAll()
    } catch (err) {
      this.usersError = err instanceof Error ? err.message : 'Failed to load users'
      console.error('Error fetching users:', err)
    } finally {
      this.usersLoading = false
    }
  }

  async getOrCreateUserByWallet(address: string, username?: string) {
    this.currentUserLoading = true
    this.currentUserError = null
    try {
      let user = await usersAPI.getByWallet(address).catch(() => null)

      if (!user) {
        user = await usersAPI.create({
          walletAddress: address,
          username,
        })
      }

      this.currentUser = user
      return user
    } catch (err) {
      this.currentUserError = err instanceof Error ? err.message : 'Failed to load user'
      console.error('Error fetching user:', err)
      throw err
    } finally {
      this.currentUserLoading = false
    }
  }

  async updateUsername(address: string, username: string) {
    try {
      const user = await usersAPI.updateUsername(address, username)
      if (this.currentUser?.walletAddress === address) {
        this.currentUser = user
      }
      return user
    } catch (err) {
      throw err
    }
  }

  async refreshCurrentUser(address: string) {
    this.currentUserLoading = true
    this.currentUserError = null
    try {
      const user = await usersAPI.getByWallet(address)
      if (user) {
        this.currentUser = user
      }
      return user
    } catch (err) {
      this.currentUserError = err instanceof Error ? err.message : 'Failed to refresh user'
      console.error('Error refreshing user:', err)
      throw err
    } finally {
      this.currentUserLoading = false
    }
  }
}
