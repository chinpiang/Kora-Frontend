import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

interface ChallengeResponse {
  challenge: string;
  timestamp: number;
}

/**
 * POST /api/auth/challenge
 * Generates a server-side nonce challenge for wallet ownership verification.
 * The client will sign this challenge with their private key.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ChallengeResponse>> {
  try {
    // Generate a random nonce (32 bytes = 64 hex characters)
    const nonce = randomBytes(32).toString("hex");
    
    // Include timestamp for additional replay attack prevention
    const timestamp = Date.now();
    
    // Create challenge message in a standard format
    const challenge = `Verify wallet ownership\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

    return NextResponse.json({
      challenge,
      timestamp,
    });
  } catch (error) {
    console.error("Error generating challenge:", error);
    return NextResponse.json(
      { error: "Failed to generate challenge" },
      { status: 500 }
    );
  }
}
