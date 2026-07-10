import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * API route to handle atomic signups.
 * It creates a Factory, creates an Auth User, and creates a User profile in public.users.
 * It executes rolling back created resources if any step fails.
 */
export async function POST(request: Request) {
  try {
    const { email, password, factory_name, full_name } = await request.json();

    if (!email || !password || !factory_name || !full_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error: missing Supabase URL or Service Role Key' },
        { status: 500 }
      );
    }

    // Create administrative client to bypass Row Level Security (RLS) for the signup sequence
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    let createdFactoryId: string | null = null;
    let createdAuthUserId: string | null = null;

    try {
      // 1. Create the factory
      const { data: factory, error: factoryError } = await supabaseAdmin
        .from('factories')
        .insert({ name: factory_name })
        .select('id')
        .single();

      if (factoryError || !factory) {
        throw new Error(`Factory creation failed: ${factoryError?.message}`);
      }
      createdFactoryId = factory.id;

      // 2. Create the Auth User
      // email_confirm is set to true to bypass email verification for testing.
      // Set to false in production to enforce email confirmation first.
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { factory_id: createdFactoryId, full_name },
      });

      if (authError || !authUser.user) {
        throw new Error(`Auth user creation failed: ${authError?.message}`);
      }
      createdAuthUserId = authUser.user.id;

      // 3. Create the user profile inside the public schema linked to the factory
      const { error: profileError } = await supabaseAdmin
        .from('users')
        .insert({
          id: createdAuthUserId,
          factory_id: createdFactoryId,
          role: 'owner', // The creator of the factory becomes the owner
          full_name,
        });

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      return NextResponse.json({
        success: true,
        message: 'Signup completed successfully',
        user: { id: createdAuthUserId, email, full_name },
        factory: { id: createdFactoryId, name: factory_name },
      });

    } catch (innerError: any) {
      console.error('Signup step failed, rolling back changes...', innerError);

      // Perform manual rollback of any created resources to keep DB consistent
      if (createdAuthUserId) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId);
        } catch (rollbackErr) {
          console.error('Failed to delete user during rollback:', rollbackErr);
        }
      }
      
      if (createdFactoryId) {
        try {
          await supabaseAdmin.from('factories').delete().eq('id', createdFactoryId);
        } catch (rollbackErr) {
          console.error('Failed to delete factory during rollback:', rollbackErr);
        }
      }

      return NextResponse.json({ error: innerError.message || 'Signup transaction failed' }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error during signup' }, { status: 500 });
  }
}
