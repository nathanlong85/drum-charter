import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser() {
  const email = 'test@example.com'
  const password = 'password123'
  const id = 'd739833a-1f81-4b1f-9993-90d56c071644'

  console.log(`Creating/Updating test user: ${email}`)

  // Try to delete if exists to ensure clean state
  const { error: deleteError } = await supabase.auth.admin.deleteUser(id)
  if (deleteError && deleteError.message !== 'User not found') {
      console.warn('Warning deleting user:', deleteError.message)
  }

  const { data, error } = await supabase.auth.admin.createUser({
    id,
    email,
    password,
    email_confirm: true,
    user_metadata: { name: 'Test User' }
  })

  if (error) {
    console.error('Error creating user:', error.message)
    process.exit(1)
  }

  console.log('User created successfully:', data.user.id)
  
  // Ensure profile exists
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: data.user.id, username: 'testuser' })
  
  if (profileError) {
      console.error('Error upserting profile:', profileError.message)
  } else {
      console.log('Profile upserted successfully')
  }
}

createTestUser().catch((error) => {
  console.error('Unhandled error in createTestUser:', error)
  process.exit(1)
})
