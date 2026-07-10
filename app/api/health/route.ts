import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Health check endpoint to verify Supabase database connectivity.
 * It attempts to run a head-only request against the 'factories' table.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Query the database to check if connection is successful
    const { count, error } = await supabase
      .from('factories')
      .select('*', { count: 'exact', head: true });

    if (error) {
      // If there's an error but it's just RLS blocking (e.g. 406 or auth issues), the connection itself is alive.
      // If the error code is related to connection failure or table not existing, we report it.
      return NextResponse.json({
        status: 'degraded',
        message: 'Connected to Supabase, but database query failed (check migrations/RLS)',
        details: error.message,
        code: error.code,
      }, { status: 200 }); // Return 200 so we can inspect details during setup
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Connection to Supabase established successfully',
      factories_count: count ?? 0,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to establish connection to Supabase',
      details: error.message || error,
    }, { status: 500 });
  }
}
