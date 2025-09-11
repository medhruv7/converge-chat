-- Create both application databases
CREATE DATABASE converge_users;
CREATE DATABASE converge_chat;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE converge_users TO postgres;
GRANT ALL PRIVILEGES ON DATABASE converge_chat TO postgres;

-- Connect to converge_users database and insert demo data
\c converge_users;

-- Wait for the users table to be created by TypeORM (this will fail initially but that's ok)
-- Note: This script runs before the app starts, so we'll create the table structure manually

-- Create users table (matching the TypeORM User entity)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE NOT NULL,
    "firstName" VARCHAR NOT NULL,
    "lastName" VARCHAR NOT NULL,
    "phoneNumber" VARCHAR NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo users
INSERT INTO users (id, email, "firstName", "lastName", "phoneNumber", "isActive") VALUES
('550e8400-e29b-41d4-a716-446655440001', 'alice.johnson@email.com', 'Alice', 'Johnson', '+1-555-0101', true),
('550e8400-e29b-41d4-a716-446655440002', 'bob.smith@email.com', 'Bob', 'Smith', '+1-555-0102', true),
('550e8400-e29b-41d4-a716-446655440003', 'carol.davis@email.com', 'Carol', 'Davis', '+1-555-0103', true),
('550e8400-e29b-41d4-a716-446655440004', 'david.wilson@email.com', 'David', 'Wilson', '+1-555-0104', true),
('550e8400-e29b-41d4-a716-446655440005', 'emma.brown@email.com', 'Emma', 'Brown', '+1-555-0105', true),
('550e8400-e29b-41d4-a716-446655440006', 'frank.miller@email.com', 'Frank', 'Miller', '+1-555-0106', true),
('550e8400-e29b-41d4-a716-446655440007', 'grace.taylor@email.com', 'Grace', 'Taylor', '+1-555-0107', true),
('550e8400-e29b-41d4-a716-446655440008', 'henry.anderson@email.com', 'Henry', 'Anderson', '+1-555-0108', true),
('550e8400-e29b-41d4-a716-446655440009', 'ivy.thomas@email.com', 'Ivy', 'Thomas', '+1-555-0109', true),
('550e8400-e29b-41d4-a716-446655440010', 'jack.martinez@email.com', 'Jack', 'Martinez', '+1-555-0110', true)
ON CONFLICT (email) DO NOTHING;

-- Connect to converge_chat database
\c converge_chat;

-- Create chat-related tables (matching TypeORM entities)
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description VARCHAR,
    type VARCHAR DEFAULT 'group',
    "isActive" BOOLEAN DEFAULT true,
    "participantIds" TEXT[],
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    type VARCHAR DEFAULT 'text',
    "isEdited" BOOLEAN DEFAULT false,
    "editedAt" TIMESTAMP,
    "isDeleted" BOOLEAN DEFAULT false,
    "deletedAt" TIMESTAMP,
    "sequenceNumber" BIGINT NOT NULL,
    "chatId" UUID REFERENCES chats(id) ON DELETE CASCADE,
    "senderId" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient message ordering
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages("chatId", "createdAt");

-- Insert demo chats
INSERT INTO chats (id, name, description, type, "participantIds") VALUES
('660e8400-e29b-41d4-a716-446655440001', 'General Discussion', 'General chat for everyone', 'group', 
 ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004']),
('660e8400-e29b-41d4-a716-446655440002', 'Project Team', 'Team collaboration chat', 'group',
 ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006']),
('660e8400-e29b-41d4-a716-446655440003', 'Coffee Chat', 'Casual conversations', 'group',
 ARRAY['550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440010'])
ON CONFLICT (id) DO NOTHING;

-- Insert demo messages
INSERT INTO messages (id, content, type, "sequenceNumber", "chatId", "senderId") VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Welcome everyone to the general discussion!', 'text', 1, '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', 'Thanks Alice! Great to be here.', 'text', 2, '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440003', 'Looking forward to collaborating with everyone!', 'text', 3, '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440004', 'Hi team! Ready to start the project?', 'text', 1, '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440005', 'Absolutely! Let''s discuss the requirements first.', 'text', 2, '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005'),
('770e8400-e29b-41d4-a716-446655440006', 'Anyone up for coffee? ☕', 'text', 1, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007'),
('770e8400-e29b-41d4-a716-446655440007', 'Count me in! What time?', 'text', 2, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008'),
('770e8400-e29b-41d4-a716-446655440008', 'How about 3 PM at the usual spot?', 'text', 3, '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440009')
ON CONFLICT (id) DO NOTHING;
