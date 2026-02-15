import { makeAutoObservable } from 'mobx'

export class UIStore {
  isCreateDreamModalOpen = false

  constructor() {
    makeAutoObservable(this)
  }

  openCreateDreamModal() {
    this.isCreateDreamModalOpen = true
  }

  closeCreateDreamModal() {
    this.isCreateDreamModalOpen = false
  }
}
