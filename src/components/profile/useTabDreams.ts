import { useEffect, useState } from 'react'
import { usersAPI } from '../../services/api'
import type { Dream as ApiDream } from '../../services/api'

type ProfileTab = 'created' | 'donated' | 'completed'

export const useTabDreams = (walletAddress: string, activeTab: ProfileTab) => {
  const [tabDreams, setTabDreams] = useState<ApiDream[]>([])
  const [tabLoading, setTabLoading] = useState(false)

  useEffect(() => {
    const loadTabDreams = async () => {
      try {
        setTabLoading(true)
        let dreams: ApiDream[] = []

        switch (activeTab) {
          case 'created': {
            console.log(`📥 Loading created dreams for ${walletAddress}...`)
            dreams = await usersAPI.getCreatedDreams(walletAddress)
            console.log(`✅ Loaded ${dreams.length} created dreams`)
            break
          }
          case 'donated': {
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
            dreams = Array.from(dreamMap.values())
            console.log(`✅ After deduplication: ${dreams.length} unique dreams`)
            break
          }
          case 'completed': {
            console.log(`📥 Loading completed dreams for ${walletAddress}...`)
            dreams = await usersAPI.getCompletedDreams(walletAddress)
            console.log(`✅ Loaded ${dreams.length} completed dreams`)
            break
          }
        }

        setTabDreams(dreams)
      } catch (err) {
        console.error(`❌ Error loading ${activeTab} dreams:`, err)
        setTabDreams([])
      } finally {
        setTabLoading(false)
      }
    }

    loadTabDreams()
  }, [walletAddress, activeTab])

  return { tabDreams, tabLoading }
}
