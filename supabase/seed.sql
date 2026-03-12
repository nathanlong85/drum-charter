-- Clean and stable seed.sql
-- We will let Supabase handle the user creation properly
-- But we can use the 'supabase auth' CLI or just a simple INSERT without identities for now
-- if identities are required, we need all fields.

INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
) VALUES (
    'd739833a-1f81-4b1f-9993-90d56c071644',
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Test User"}',
    'authenticated',
    'authenticated'
);

-- Identity is usually required for login
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'd739833a-1f81-4b1f-9993-90d56c071644',
    '{"sub":"d739833a-1f81-4b1f-9993-90d56c071644","email":"test@example.com"}',
    'email',
    'd739833a-1f81-4b1f-9993-90d56c071644',
    now(),
    now(),
    now()
);

INSERT INTO public.profiles (id, username)
VALUES ('d739833a-1f81-4b1f-9993-90d56c071644', 'testuser');
