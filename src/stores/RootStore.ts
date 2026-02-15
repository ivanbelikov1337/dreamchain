import { makeAutoObservable } from 'mobx'
import { DreamStore } from './DreamStore'
import { UserStore } from './UserStore'
import { DonationStore } from './DonationStore'
import { ProfileStore } from './ProfileStore'
import { UIStore } from './UIStore'

export class RootStore {
  dreamStore: DreamStore
  userStore: UserStore
  donationStore: DonationStore
  profileStore: ProfileStore
  uiStore: UIStore

  constructor() {
    this.dreamStore = new DreamStore()
    this.userStore = new UserStore()
    this.donationStore = new DonationStore()
    this.profileStore = new ProfileStore()
    this.uiStore = new UIStore()
    makeAutoObservable(this)
  }
}

// Create singleton instance
export const rootStore = new RootStore()
