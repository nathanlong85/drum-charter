export function login(formData: FormData) {
  // Mock login action since we're setting up the UI
  // Real implementation will use lib/supabase/server.ts
  console.log('Login attempt:', formData.get('email'))
}

export function signup(formData: FormData) {
  console.log('Signup attempt:', formData.get('email'))
}
