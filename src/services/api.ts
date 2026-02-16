const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Types
export interface Dream {
  id: number
  title: string
  description: string
  goal: number
  totalDonations: number
  rating?: number
  status?: string
  isWithdrawn?: boolean
  category?: string
  imageUrl?: string
  currency?: string
  createdAt: string
  updatedAt?: string
  userId: number
  user?: User
  _count?: {
    donations: number
  }
  donations?: Donation[]
}

export interface User {
  id: number
  walletAddress: string
  username?: string
  rating: number
  totalDonated?: number
  totalReceived?: number
  avatar?: string
  chances?: number
  createdAt: string
  updatedAt?: string
  dreams?: Dream[]
  donations?: Donation[]
}

export interface Donation {
  id: number
  amount: number
  fromWallet: string
  txHash: string
  dreamId: number
  userId?: number
  currency: string
  blockNumber?: number
  dream?: Dream
  donor?: User
  createdAt: string
}

export interface CreateDreamInput {
  id?: number
  title: string
  description: string
  goal: number
  userId: number
  imageUrl?: string
  category?: string
}

export interface DreamStats {
  totalDreams: number
  totalRaised: number
  activeDonors: number
  completedDreams: number
}

export interface CreateUserInput {
  walletAddress: string
  username?: string
  avatar?: string
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  // Handle empty responses (null from database)
  const contentLength = response.headers.get('content-length')
  if (contentLength === '0' || response.status === 204) {
    return null as unknown as T
  }

  // Try to parse the response text
  const text = await response.text()
  if (!text) {
    return null as unknown as T
  }

  return JSON.parse(text) as T
}

// Dreams API
export const dreamsAPI = {
  getNextId: async () =>
    apiCall<number>(`/dreams/next-id`),

  getStats: async () =>
    apiCall<DreamStats>(`/dreams/stats`),

  getAll: async (skip = 0, take = 10) =>
    apiCall<Dream[]>(
      `/dreams?skip=${skip}&take=${take}`,
    ),

  getTop: async (limit = 10) =>
    apiCall<Dream[]>(`/dreams/top?limit=${limit}`),

  getNew: async (limit = 10) =>
    apiCall<Dream[]>(`/dreams/new?limit=${limit}`),

  getRandom: async () =>
    apiCall<Dream>(`/dreams/random`),

  getCompleted: async (limit = 10) =>
    apiCall<Dream[]>(`/dreams/completed?limit=${limit}`),

  getById: async (id: number) =>
    apiCall<Dream>(`/dreams/${id}`),

  getByUserId: async (userId: number) =>
    apiCall<Dream[]>(`/dreams/user/${userId}`),

  create: async (data: CreateDreamInput) =>
    apiCall<Dream>(`/dreams`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  withdraw: async (id: number) =>
    apiCall<Dream>(`/dreams/${id}/withdraw`, {
      method: 'POST',
    }),
}

// Users API
export const usersAPI = {
  getAll: async () =>
    apiCall<User[]>(`/users`),

  getById: async (id: number) =>
    apiCall<User>(`/users/${id}`),

  getByWallet: async (address: string) =>
    apiCall<User>(`/users/wallet/${address}`),

  getCreatedDreams: async (address: string) =>
    apiCall<Dream[]>(`/users/wallet/${address}/dreams/created`),

  getDonatedDreams: async (address: string) =>
    apiCall<any[]>(`/users/wallet/${address}/dreams/donated`),

  getCompletedDreams: async (address: string) =>
    apiCall<Dream[]>(`/users/wallet/${address}/dreams/completed`),

  create: async (data: CreateUserInput) =>
    apiCall<User>(`/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRating: async (id: number) =>
    apiCall<User>(`/users/${id}/update-rating`, {
      method: 'POST',
    }),

  updateUsername: async (address: string, username: string) =>
    apiCall<User>(`/users/wallet/${address}`, {
      method: 'PUT',
      body: JSON.stringify({ username }),
    }),
}

// Donations API
export const donationsAPI = {
  getAll: async (skip = 0, take = 10) =>
    apiCall<Donation[]>(
      `/donations?skip=${skip}&take=${take}`,
    ),

  getById: async (id: number) =>
    apiCall<Donation>(`/donations/${id}`),

  getByDreamId: async (dreamId: number) =>
    apiCall<Donation[]>(`/donations/dream/${dreamId}`),

  getByWallet: async (address: string) =>
    apiCall<Donation[]>(`/donations/wallet/${address}`),

  getByTxHash: async (txHash: string) =>
    apiCall<Donation>(`/donations/tx/${txHash}`),

  create: async (data: Omit<Donation, 'id' | 'createdAt'>) =>
    apiCall<Donation>(`/donations`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

/**
 * Record a donation from blockchain transaction
 */
export const recordDonation = async (data: {
  dreamId: string
  amount: string
  txHash: string
  donor: string
  currency: string
}) => {
  try {
    console.log(
      `\n📤 Recording donation to backend...\n` +
      `   Dream ID: ${data.dreamId}\n` +
      `   Amount: ${data.amount} ${data.currency}\n` +
      `   Donor: ${data.donor}\n` +
      `   TX: ${data.txHash}`
    )

    const response = await fetch(`${API_BASE_URL}/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    console.log(
      `\n📥 Backend response status: ${response.status} ${response.statusText}`
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        `❌ Backend error response:\n` +
        `   Status: ${response.status}\n` +
        `   Body: ${errorText}`
      )
      throw new Error(`Backend error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log(
      `✅ Donation recorded in backend!\n` +
      `   ID: ${result.id}`
    )
    return result
  } catch (error) {
    console.error(
      `❌ Error recording donation:\n` +
      `   ${error instanceof Error ? error.message : String(error)}`
    )
    throw error
  }
}

// Blockchain API
export const blockchainAPI = {
  verifyDonation: async (txHash: string) =>
    apiCall<{ valid: boolean }>(`/blockchain/verify-donation`, {
      method: 'POST',
      body: JSON.stringify({ txHash }),
    }),

  getBalance: async (address: string) =>
    apiCall<{ address: string; balance: string }>(
      `/blockchain/balance/${address}`,
    ),

  canCreateDream: async (address: string) =>
    apiCall<{ address: string; canCreateDream: boolean }>(
      `/blockchain/can-create-dream/${address}`,
    ),

  getDonationCount: async (address: string) =>
    apiCall<{ address: string; count: number }>(
      `/blockchain/donation-count/${address}`,
    ),
}

// Auth API
export const authAPI = {
  login: async (walletAddress: string) =>
    apiCall<{ token: string }>(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    }),

  verify: async (token: string) =>
    apiCall<{ valid: boolean }>(`/auth/verify`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
}
