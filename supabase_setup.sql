-- ====================================================================================
-- MAILFORGE SUPABASE DATABASE SCHEMA & MOCK DATA
-- ====================================================================================
-- Instructions: Copy all contents of this file and run it in the Supabase SQL Editor.
-- ====================================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================================
-- 2. TABLE DEFINITIONS
-- ====================================================================================

-- USERS TABLE
-- Maps to the Auth/User Microservice
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER CONFIG TABLE
-- 1-to-1 relationship with users table
CREATE TABLE IF NOT EXISTS public.user_config (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    auto_archive BOOLEAN DEFAULT FALSE,
    auto_reply BOOLEAN DEFAULT FALSE,
    auto_reply_message TEXT DEFAULT '',
    encryption_enabled BOOLEAN DEFAULT FALSE,
    signature_enabled BOOLEAN DEFAULT FALSE,
    signature TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MAILS TABLE
-- Stores sent and received emails
CREATE TABLE IF NOT EXISTS public.mails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    is_html BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    hash VARCHAR(255),
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MAIL ATTACHMENTS TABLE
-- Stores metadata/base64 content for mail attachments
CREATE TABLE IF NOT EXISTS public.mail_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mail_id UUID NOT NULL REFERENCES public.mails(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    content TEXT NOT NULL, -- Storing Base64 for simplicity in this architecture
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OTPS TABLE
-- Tracks short-lived verification codes
CREATE TABLE IF NOT EXISTS public.otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ====================================================================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_mails_to_address ON public.mails(to_address);
CREATE INDEX idx_mails_from_address ON public.mails(from_address);
CREATE INDEX idx_otps_email ON public.otps(email);

-- ====================================================================================
-- 4. ROW LEVEL SECURITY (RLS) SETUP
-- ====================================================================================
-- Note: Since the backend Microservices (Spring Boot) will interact with this database
-- using a service role or direct connection, RLS policies are optional but good practice.
-- We enable them here and allow all operations, assuming the microservices validate access.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for the backend (In a real scenario, restrict to service_role)
CREATE POLICY "Allow all access" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.user_config FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.mails FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.mail_attachments FOR ALL USING (true);
CREATE POLICY "Allow all access" ON public.otps FOR ALL USING (true);


-- ====================================================================================
-- 5. MOCK DATA INSERTION
-- ====================================================================================

-- Clear existing data if re-running
TRUNCATE TABLE public.users CASCADE;
TRUNCATE TABLE public.mails CASCADE;

-- Insert Mock Users
INSERT INTO public.users (id, username, email, password_hash, first_name, last_name, is_verified)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'alice', 'alice.recovery@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Alice', 'Smith', TRUE),
    ('22222222-2222-2222-2222-222222222222', 'bob', 'bob.recovery@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Bob', 'Jones', TRUE);

-- Insert Mock User Configs
INSERT INTO public.user_config (user_id, auto_archive, auto_reply, encryption_enabled, signature_enabled, signature)
VALUES 
    ('11111111-1111-1111-1111-111111111111', FALSE, FALSE, TRUE, TRUE, 'Best Regards,\nAlice'),
    ('22222222-2222-2222-2222-222222222222', TRUE, FALSE, FALSE, FALSE, '');

-- Insert Mock Mails
-- Email 1: Plaintext Email from Bob to Alice
INSERT INTO public.mails (id, from_address, to_address, subject, body, is_read, hash, received_at)
VALUES 
    (
        '33333333-3333-3333-3333-333333333333', 
        'bob@mailforge.com', 
        'alice@mailforge.com', 
        'Project Alpha Update', 
        'Hi Alice,\n\nJust wanted to let you know the frontend for Project Alpha is completed.\n\nThanks,\nBob', 
        FALSE, 
        'a1b2c3d4e5f6', 
        NOW() - INTERVAL '2 hours'
    );

-- Email 2: Encrypted Email from Alice to Bob
-- (The body contains mock AES ciphertext generated by CryptoJS)
INSERT INTO public.mails (id, from_address, to_address, subject, body, is_read, hash, received_at)
VALUES 
    (
        '44444444-4444-4444-4444-444444444444', 
        'alice@mailforge.com', 
        'bob@mailforge.com', 
        'Top Secret Payload', 
        '-----BEGIN MAILFORGE ENCRYPTED MESSAGE-----\nU2FsdGVkX1+z/3YfFhP0W+R1C0nL0yI1aGv7Z7A0zQ8=\n-----END MAILFORGE ENCRYPTED MESSAGE-----', 
        TRUE, 
        'f6e5d4c3b2a1', 
        NOW() - INTERVAL '1 day'
    );

-- Email 3: Welcome Email to Alice
INSERT INTO public.mails (id, from_address, to_address, subject, body, is_read, hash, received_at)
VALUES 
    (
        '55555555-5555-5555-5555-555555555555', 
        'system@mailforge.com', 
        'alice@mailforge.com', 
        'Welcome to MailForge!', 
        'Welcome to MailForge! Your secure communication channel is ready.', 
        TRUE, 
        '1a2b3c4d5e6f', 
        NOW() - INTERVAL '3 days'
    );

-- Insert Mock Attachments
INSERT INTO public.mail_attachments (mail_id, name, content_type, content)
VALUES 
    (
        '33333333-3333-3333-3333-333333333333', 
        'report.pdf', 
        'application/pdf', 
        'JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLY31jBUMlWwMDF...'
    );

-- Output Success
SELECT 'MailForge Database Schema and Mock Data initialized successfully!' as status;
