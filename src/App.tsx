import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { baseSepolia } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { observer } from 'mobx-react-lite'
import { StoreProvider } from './stores/StoreProvider'
import { useStore } from './stores/StoreContext'
import CreateDreamModal from './components/CreateDreamModal'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import TopDreamsPage from './pages/TopDreamsPage'
import NewDreamsPage from './pages/NewDreamsPage'
import CompletedDreamsPage from './pages/CompletedDreamsPage'
import MyDreamsPage from './pages/MyDreamsPage'
import RatingPage from './pages/RatingPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import ProfilePage from './pages/ProfilePage'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://dashboard.reown.com
// const projectId = process.env.REACT_APP_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID'

// 2. Create a metadata object
const metadata = {
  name: 'DreamChain',
  description: 'Platform of Dreams on Crypto',
  url: 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

// 3. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [baseSepolia],
  projectId: "943eb0d2a0636662a018db9af1d1b917",
  ssr: true,
})

// 4. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [baseSepolia],
  projectId: "943eb0d2a0636662a018db9af1d1b917",
  metadata,
  features: {
    analytics: true,
  },
})

type Page = 'home' | 'top' | 'new' | 'completed' | 'my' | 'rating' | 'about' | 'terms' | 'privacy' | 'contact' | 'profile'

// Wrapper components that use React Router hooks
function HomePageWrapper() {
  const navigate = useNavigate()
  const { uiStore } = useStore()

  const handleOpenProfile = (walletAddress: string) => {
    navigate(`/profile/${walletAddress}`)
  }

  return <HomePage isModalOpen={false} setIsModalOpen={() => uiStore.openCreateDreamModal()} onOpenProfile={handleOpenProfile} />
}

function TopDreamsPageWrapper() {
  const navigate = useNavigate()
  return <TopDreamsPage onOpenProfile={(wallet) => navigate(`/profile/${wallet}`)} />
}

function NewDreamsPageWrapper() {
  const navigate = useNavigate()
  return <NewDreamsPage onOpenProfile={(wallet) => navigate(`/profile/${wallet}`)} />
}

function CompletedDreamsPageWrapper() {
  const navigate = useNavigate()
  return <CompletedDreamsPage onOpenProfile={(wallet) => navigate(`/profile/${wallet}`)} />
}

function ProfilePageWrapper() {
  const { walletAddress } = useParams<{ walletAddress: string }>()
  const navigate = useNavigate()
  
  if (!walletAddress) {
    return <div>Invalid profile URL</div>
  }

  return <ProfilePage walletAddress={walletAddress} onOpenProfile={(wallet) => navigate(`/profile/${wallet}`)} />
}

function AppLayout() {
  const navigate = useNavigate()
  const { uiStore } = useStore()

  const handleNavigate = (page: Page) => {
    const pathMap: { [key in Page]: string } = {
      'home': '/',
      'top': '/top',
      'new': '/new',
      'completed': '/completed',
      'my': '/my',
      'rating': '/rating',
      'about': '/about',
      'terms': '/terms',
      'privacy': '/privacy',
      'contact': '/contact',
      'profile': '/'
    }
    navigate(pathMap[page])
  }

  return (
    <>
      <CreateDreamModal
        isOpen={uiStore.isCreateDreamModalOpen}
        onClose={() => uiStore.closeCreateDreamModal()}
        onDreamCreated={() => {
          uiStore.closeCreateDreamModal()
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex flex-col">
        <Header currentPage="home" setCurrentPage={handleNavigate} onOpenProfile={(wallet) => navigate(`/profile/${wallet}`)} />
        
        <main className="container mx-auto px-4 py-8 flex-1">
          <Routes>
            <Route path="/" element={<HomePageWrapper />} />
            <Route path="/top" element={<TopDreamsPageWrapper />} />
            <Route path="/new" element={<NewDreamsPageWrapper />} />
            <Route path="/completed" element={<CompletedDreamsPageWrapper />} />
            <Route path="/my" element={<MyDreamsPage />} />
            <Route path="/rating" element={<RatingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/profile/:walletAddress" element={<ProfilePageWrapper />} />
          </Routes>
        </main>

        <Footer setCurrentPage={handleNavigate} />
      </div>
    </>
  )
}

const ObservedAppLayout = observer(AppLayout)

export default function App() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <BrowserRouter>
            <ObservedAppLayout />
          </BrowserRouter>
        </StoreProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
