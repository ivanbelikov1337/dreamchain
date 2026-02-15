import React, { createContext } from 'react'
import { RootStore, rootStore } from './RootStore'

export const StoreContext = createContext<RootStore>(rootStore)

export const useStore = () => {
  const store = React.useContext(StoreContext)
  if (!store) {
    throw new Error('useStore must be used within StoreProvider')
  }
  return store
}
