-- Clean and stable seed.sql
-- We will let Supabase handle the user creation properly
-- But we can use the 'supabase auth' CLI or just a simple INSERT without identities for now
-- if identities are required, we need all fields.

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'd739833a-1f81-4b1f-9993-90d56c071644',
    'authenticated',
    'authenticated',
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{"name":"Test User"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
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
