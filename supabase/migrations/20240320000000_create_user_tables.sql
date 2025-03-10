-- Drop existing tables if they exist
DROP TABLE IF EXISTS shared_notes CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id)
);

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    connected_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, connected_user_id)
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    other_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, other_user_id)
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create shared_notes table
CREATE TABLE IF NOT EXISTS shared_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    shared_with UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(note_id, shared_with)
);

-- Drop existing bucket if it exists
DELETE FROM storage.buckets WHERE id = 'notes';

-- Create storage bucket for notes
INSERT INTO storage.buckets (id, name, public) VALUES ('notes', 'notes', false);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view shared notes" ON storage.objects;

-- Set up storage policies
CREATE POLICY "Users can upload their own notes"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own notes"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view shared notes"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'notes' AND
        EXISTS (
            SELECT 1 FROM notes n
            JOIN shared_notes sn ON n.id = sn.note_id
            WHERE n.file_path = name
            AND sn.shared_with = auth.uid()
        )
    );

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their connections" ON connections;
DROP POLICY IF EXISTS "Users can create connections" ON connections;
DROP POLICY IF EXISTS "Users can update their connections" ON connections;
DROP POLICY IF EXISTS "Users can view their chats" ON chats;
DROP POLICY IF EXISTS "Users can create chats" ON chats;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their appointments" ON appointments;
DROP POLICY IF EXISTS "Users can view their notes" ON notes;
DROP POLICY IF EXISTS "Users can create notes" ON notes;
DROP POLICY IF EXISTS "Users can update their notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their notes" ON notes;
DROP POLICY IF EXISTS "Users can view shared notes" ON shared_notes;
DROP POLICY IF EXISTS "Users can share notes" ON shared_notes;
DROP POLICY IF EXISTS "Users can remove shared notes" ON shared_notes;

-- Create RLS policies
CREATE POLICY "Users can view all profiles"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can view their connections"
    ON connections FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can create connections"
    ON connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their connections"
    ON connections FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can view their chats"
    ON chats FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = other_user_id);

CREATE POLICY "Users can create chats"
    ON chats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view messages in their chats"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chats c
            WHERE c.id = chat_id
            AND (c.user_id = auth.uid() OR c.other_user_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their chats"
    ON chat_messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their appointments"
    ON appointments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their appointments"
    ON appointments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their notes"
    ON notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create notes"
    ON notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their notes"
    ON notes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their notes"
    ON notes FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared notes"
    ON shared_notes FOR SELECT
    USING (auth.uid() = shared_with);

CREATE POLICY "Users can share notes"
    ON shared_notes FOR INSERT
    WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "Users can remove shared notes"
    ON shared_notes FOR DELETE
    USING (auth.uid() = shared_by); 