import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data for now - will replace with actual database query
    const mockAssets = [
      {
        id: 1,
        symbol: "BTC",
        name: "Bitcoin", 
        price: 45000,
        sssScore: 85.5,
        change24h: 2.5,
        volume: 1000000
      },
      {
        id: 2,
        symbol: "ETH",
        name: "Ethereum",
        price: 3000,
        sssScore: 78.2,
        change24h: -1.2,
        volume: 500000
      }
    ]

    return NextResponse.json(mockAssets)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}