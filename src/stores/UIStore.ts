import { makeAutoObservable } from 'mobx'

export class UIStore {
  isCreateDreamModalOpen = false
  isNoChancesModalOpen = false

  constructor() {
    makeAutoObservable(this)
  }

  openCreateDreamModal() {
    this.isCreateDreamModalOpen = true
  }

  closeCreateDreamModal() {
    this.isCreateDreamModalOpen = false
  }

  openNoChancesModal() {
    this.isNoChancesModalOpen = true
  }

  closeNoChancesModal() {
    this.isNoChancesModalOpen = false
  }
}
