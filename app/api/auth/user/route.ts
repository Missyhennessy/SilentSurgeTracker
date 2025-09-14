import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // For now, return mock data until we migrate the auth system
    return NextResponse.json({ 
      id: "44606826", 
      email: "thennessy01@gmail.com",
      name: "User"
    })
  } catch (error) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
}