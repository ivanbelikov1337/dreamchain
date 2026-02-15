/**
 * Smart Contract Service
 * Handles all interactions with DreamChain contract
 * Uses wagmi + viem for Web3 interactions
 */

import type { PublicClient, WalletClient } from 'viem'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACT_CONFIG, DREAM_CHAIN_ABI, USDC_ABI } from '../config/contracts'
import * as api from './api'

// Types
export interface DonateParams {
  dreamId: number
  amount: string // Amount in USDC with decimals (e.g., "100" for 100 USDC)
  userAddress: string
  publicClient: PublicClient
  walletClient: WalletClient
  // Optional dream info for auto-creation if dream doesn't exist in contract
  dreamTitle?: string
  dreamDescription?: string
  dreamGoal?: string
}

export interface DonationResult {
  txHash: string
  amount: string
  dreamId: number
  donor: string
}

/**
 * Parse USDC amount to contract format (with decimals)
 */
export const parseUSDC = (amount: string): bigint => {
  return parseUnits(amount, CONTRACT_CONFIG.USDC_DECIMALS)
}

/**
 * Format contract amount to USDC (remove decimals)
 */
export const formatUSDC = (amount: bigint | string): string => {
  const value = typeof amount === 'string' ? BigInt(amount) : amount
  return formatUnits(value, CONTRACT_CONFIG.USDC_DECIMALS)
}

/**
 * Approve USDC spending
 */
export const approveUSDC = async (
  walletClient: WalletClient,
  publicClient: PublicClient,
  amount: string
): Promise<string> => {
  try {
    const parsedAmount = parseUSDC(amount)

    const txHash = (await walletClient.writeContract({
      address: CONTRACT_CONFIG.USDC_ADDRESS as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [CONTRACT_CONFIG.ADDRESS as `0x${string}`, parsedAmount],
      gas: 100000n,
      chain: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as string

    console.log(`📝 Approval TX sent: ${txHash}`)
    console.log(`⏳ Waiting for confirmation...`)
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` })
    if (receipt.status === 'reverted') {
      throw new Error('USDC approval transaction reverted')
    }

    console.log('✅ USDC approval confirmed:', txHash)
    return txHash
  } catch (error) {
    console.error('❌ USDC approval failed:', error)
    throw error
  }
}

/**
 * Check USDC allowance
 */
export const checkUSDCAllowance = async (
  publicClient: PublicClient,
  userAddress: string
): Promise<string> => {
  try {
    const allowance = (await publicClient.readContract({
      address: CONTRACT_CONFIG.USDC_ADDRESS as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'allowance',
      args: [userAddress as `0x${string}`, CONTRACT_CONFIG.ADDRESS as `0x${string}`],
    })) as bigint

    return formatUSDC(allowance)
  } catch (error) {
    console.error('❌ Failed to check allowance:', error)
    throw error
  }
}

/**
 * Get USDC balance
 */
export const getUSDCBalance = async (
  publicClient: PublicClient,
  userAddress: string
): Promise<string> => {
  try {
    const balance = (await publicClient.readContract({
      address: CONTRACT_CONFIG.USDC_ADDRESS as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`],
    })) as bigint

    return formatUSDC(balance)
  } catch (error) {
    console.error('❌ Failed to get USDC balance:', error)
    throw error
  }
}

/**
 * Create a dream in the contract
 */
export const createDreamInContract = async (
  walletClient: WalletClient,
  publicClient: PublicClient,
  dreamId: number,
  title: string,
  description: string,
  goalAmount: string,
  userAddress?: string,
  skipDatabaseSync?: boolean
): Promise<string> => {
  try {
    const parsedGoal = parseUSDC(goalAmount)
    console.log(
      `📝 Creating dream #${dreamId} in contract...\n` +
      `   Title: ${title}\n` +
      `   Description: ${description}\n` +
      `   Goal: ${goalAmount} USDC\n` +
      `   Creator: ${userAddress}`
    )

    const txHash = (await walletClient.writeContract({
      address: CONTRACT_CONFIG.ADDRESS as `0x${string}`,
      abi: DREAM_CHAIN_ABI,
      functionName: 'createDream',
      args: [BigInt(dreamId), title, description, parsedGoal],
      gas: 300000n,
      chain: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as string

    console.log(`📝 Create dream TX sent: ${txHash}`)
    console.log(`⏳ Waiting for confirmation...`)
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` })
    if (receipt.status === 'reverted') {
      throw new Error('Failed to create dream in contract')
    }

    console.log(`✅ Dream #${dreamId} created in contract!\n   TX: ${txHash}`)

    // Also create in backend database (unless skipped - e.g., already created in modal)
    if (userAddress && !skipDatabaseSync) {
      try {
        console.log(`🔄 Syncing dream #${dreamId} to backend...`)
        
        // Get or create user
        let user = await api.usersAPI.getByWallet(userAddress).catch(() => null)

        if (!user) {
          console.log(`   Creating new user: ${userAddress}`)
          user = await api.usersAPI.create({
            walletAddress: userAddress,
          })
          console.log(`   ✅ User created: ID=${user.id}`)
        } else {
          console.log(`   ✅ User found: ID=${user.id}`)
        }

        // Create dream in database
        const createdDream = await api.dreamsAPI.create({
          title,
          description,
          goal: parseFloat(goalAmount),
          userId: user.id,
        })
        console.log(
          `✅ Dream #${dreamId} synced to backend!\n` +
          `   Database ID: ${createdDream.id}\n` +
          `   Owner: ${user.walletAddress}`
        )
      } catch (dbError) {
        console.warn('⚠️ Failed to sync dream to database:', dbError)
        // Continue anyway, blockchain transaction succeeded
      }
    } else if (skipDatabaseSync) {
      console.log(`⏭️ Skipping database sync (already created in modal)`)
    }

    return txHash
  } catch (error) {
    console.error('❌ Failed to create dream:', error)
    throw error
  }
}

/**
 * Donate USDC to a dream
 */
export const donateToDream = async ({
  dreamId,
  amount,
  userAddress,
  publicClient,
  walletClient,
}: DonateParams): Promise<DonationResult> => {
  try {
    // Check allowance first
    console.log(`\n🔍 Checking USDC allowance for ${userAddress}...`)
    const allowance = await checkUSDCAllowance(publicClient, userAddress)
    const allowanceNum = parseFloat(allowance)
    const amountNum = parseFloat(amount)
    console.log(`   Current allowance: ${allowance} USDC`)

    if (allowanceNum < amountNum) {
      console.log(`   ⚠️ Allowance too low (need ${amountNum}), requesting approval...`)
      await approveUSDC(walletClient, publicClient, amount)
      console.log(`   ✅ USDC approval confirmed`)
      // Wait a moment for approval to be mined
      await new Promise(resolve => setTimeout(resolve, 2000))
    } else {
      console.log(`   ✅ Allowance sufficient`)
    }

    // Donate
    const parsedAmount = parseUSDC(amount)
    console.log(`\n💰 Donating ${amount} USDC to dream #${dreamId}...`)

    const txHash = (await walletClient.writeContract({
      address: CONTRACT_CONFIG.ADDRESS as `0x${string}`,
      abi: DREAM_CHAIN_ABI,
      functionName: 'donate',
      args: [BigInt(dreamId), parsedAmount],
      gas: 300000n,
      chain: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as string

    console.log(`📝 TX sent: ${txHash}`)
    console.log(`⏳ Waiting for transaction confirmation...`)

    // Wait for transaction receipt to confirm it actually succeeded
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` })
    
    if (receipt.status === 'reverted') {
      throw new Error(`Transaction reverted: Dream may not exist in contract`)
    }

    console.log(`✅ Donation successful: ${txHash}`)

    // Sync with backend
    try {
      console.log(`\n🔄 Syncing donation to backend...`)
      await api.recordDonation({
        dreamId: String(dreamId),
        amount: amount,
        txHash: txHash,
        donor: userAddress,
        currency: 'USDC',
      })
      console.log(`✅ Backend sync completed successfully!`)
    } catch (backendError) {
      console.warn(
        `⚠️ Backend sync failed (transaction still valid):\n` +
        `   ${backendError instanceof Error ? backendError.message : String(backendError)}`
      )
    }

    return {
      txHash: txHash,
      amount,
      dreamId,
      donor: userAddress,
    }
  } catch (error) {
    console.error(`❌ Donation failed:`, error)
    throw error
  }
}

/**
 * Get dream info from contract
 */
export const getDreamFromContract = async (
  publicClient: PublicClient,
  dreamId: number
) => {
  try {
    const dream = await publicClient.readContract({
      address: CONTRACT_CONFIG.ADDRESS as `0x${string}`,
      abi: DREAM_CHAIN_ABI,
      functionName: 'getDream',
      args: [BigInt(dreamId)],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dreamData = dream as any

    return {
      id: dreamData.id,
      owner: dreamData.owner,
      title: dreamData.title,
      description: dreamData.description,
      goal: formatUSDC(dreamData.goal),
      raised: formatUSDC(dreamData.raised),
      createdAt: new Date(Number(dreamData.createdAt) * 1000),
      fulfilled: dreamData.fulfilled,
      withdrawn: dreamData.withdrawn,
    }
  } catch (error) {
    console.error('❌ Failed to get dream from contract:', error)
    throw error
  }
}

/**
 * Get donations for a dream
 */
export const getDreamDonations = async (
  publicClient: PublicClient,
  dreamId: number
) => {
  try {
    const donations = await publicClient.readContract({
      address: CONTRACT_CONFIG.ADDRESS as `0x${string}`,
      abi: DREAM_CHAIN_ABI,
      functionName: 'getDreamDonations',
      args: [BigInt(dreamId)],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (donations as any).map((d: any) => ({
      donor: d.donor,
      amount: formatUSDC(d.amount),
      timestamp: new Date(Number(d.timestamp) * 1000),
    }))
  } catch (error) {
    console.error('❌ Failed to get donations:', error)
    throw error
  }
}

/**
 * Withdraw funds from a dream (owner only)
 */
export const withdrawDream = async (
  walletClient: WalletClient,
  publicClient: PublicClient,
  dreamId: number
): Promise<string> => {
  try {
    console.log(`💸 Withdrawing dream #${dreamId}...`)

    const txHash = (await walletClient.writeContract({
      address: CONTRACT_CONFIG.ADDRESS as `0x${string}`,
      abi: DREAM_CHAIN_ABI,
      functionName: 'withdraw',
      args: [BigInt(dreamId)],
      gas: 300000n,
      chain: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as string

    console.log(`📝 Withdraw TX sent: ${txHash}`)
    console.log(`⏳ Waiting for confirmation...`)
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` })
    if (receipt.status === 'reverted') {
      throw new Error('Withdrawal failed')
    }

    console.log('✅ Withdrawal successful:', txHash)
    return txHash
  } catch (error) {
    console.error('❌ Withdrawal failed:', error)
    throw error
  }
}

/**
 * Отримати усі мрії з контракту
 */
export const getAllDreamsFromContract = async (publicClient: PublicClient) => {
  try {
    console.log(`\n📋 Завантажую усі мрії з контракту...`)
    
    // Отримуємо загальну кількість мрій
    const totalDreams = (await publicClient.readContract({
      address: CONTRACT_CONFIG.ADDRESS as `0x${string}`,
      abi: DREAM_CHAIN_ABI,
      functionName: 'dreamCounter',
    })) as bigint

    console.log(`✅ Знайдено мрій: ${totalDreams}`)

    const dreams = []

    // Читаємо кожну мрію по одній
    for (let i = 1n; i <= totalDreams; i++) {
      try {
        const dream = (await publicClient.readContract({
          address: CONTRACT_CONFIG.ADDRESS as `0x${string}`,
          abi: DREAM_CHAIN_ABI,
          functionName: 'getDream',
          args: [i],
        })) as any

        dreams.push({
          id: Number(dream.id),
          owner: dream.owner,
          title: dream.title,
          description: dream.description,
          goal: formatUSDC(dream.goal),
          raised: formatUSDC(dream.raised),
          createdAt: new Date(Number(dream.createdAt) * 1000),
          fulfilled: dream.fulfilled,
          withdrawn: dream.withdrawn,
        })
      } catch (err) {
        console.warn(`⚠️ Помилка при читанні мрії #${i}:`, err)
      }
    }

    console.log(`📊 Усього завантажено мрій: ${dreams.length}`)
    console.table(dreams)

    return dreams
  } catch (error) {
    console.error('❌ Помилка при отриманні мрій з контракту:', error)
    throw error
  }
}
