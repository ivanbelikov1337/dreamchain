/**
 * Smart Contract Configuration
 * Update CONTRACT_ADDRESS after deployment
 */

export const CONTRACT_CONFIG = {
  // DreamChain Vault Contract
  ADDRESS: (import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  
  // USDC Token (Base Sepolia) - testnet address
  USDC_ADDRESS: (import.meta.env.VITE_USDC_ADDRESS || '0x98fbF25248ca37c195B3fd68F178B2920b1e1ed1') as `0x${string}`,
  
  // Decimals for USDC (same as USDT)
  USDC_DECIMALS: 6,
  
  // Network
  CHAIN_ID: import.meta.env.VITE_CHAIN_ID ? parseInt(import.meta.env.VITE_CHAIN_ID) : 84532, // Base Sepolia by default
}

// DreamChain ABI (Essential functions)
export const DREAM_CHAIN_ABI = [
  {
    name: 'createDream',
    type: 'function',
    inputs: [
      { name: '_dreamId', type: 'uint256' },
      { name: '_title', type: 'string' },
      { name: '_description', type: 'string' },
      { name: '_goal', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    name: 'donate',
    type: 'function',
    inputs: [
      { name: '_dreamId', type: 'uint256' },
      { name: '_amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'withdraw',
    type: 'function',
    inputs: [{ name: '_dreamId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'getDream',
    type: 'function',
    inputs: [{ name: '_dreamId', type: 'uint256' }],
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'owner', type: 'address' },
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'goal', type: 'uint256' },
          { name: 'raised', type: 'uint256' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'fulfilled', type: 'bool' },
          { name: 'withdrawn', type: 'bool' },
        ],
        name: 'dream',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
  },
  {
    name: 'getDreamDonations',
    type: 'function',
    inputs: [{ name: '_dreamId', type: 'uint256' }],
    outputs: [
      {
        components: [
          { name: 'donor', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
        ],
        name: 'donations',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
  },
]

// USDC ABI (Essential functions)
export const USDC_ABI = [
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    name: 'allowance',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: 'remaining', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
  },
]
