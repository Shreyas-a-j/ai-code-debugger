import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../config/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;
  padding: 30px;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  position: relative;
`;

const ProfileImageContainer = styled.div`
  position: relative;
`;

const ProfileImage = styled.img`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const EditImageButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: all 0.3s ease;

  &:hover {
    background: #0056b3;
    transform: scale(1.1);
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h1`
  margin: 0;
  color: #2d3436;
  font-size: 2.5rem;
  font-weight: 600;
`;

const ProfileBio = styled.p`
  color: #636e72;
  margin: 15px 0;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const ProfileStats = styled.div`
  display: flex;
  gap: 30px;
  margin-top: 20px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3436;
`;

const StatLabel = styled.div`
  color: #636e72;
  font-size: 0.9rem;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  background: #fff;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const Tab = styled.button`
  padding: 12px 24px;
  border: none;
  background: ${props => props.active ? '#007bff' : 'transparent'};
  color: ${props => props.active ? '#fff' : '#2d3436'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }
`;

const TabContent = styled.div`
  background: #fff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
`;

const ConnectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const ConnectionCard = styled.div`
  padding: 20px;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  background: #fff;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const ConnectionImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ConnectionName = styled.h3`
  margin: 10px 0;
  color: #2d3436;
  font-size: 1.2rem;
`;

const ConnectionBio = styled.p`
  color: #636e72;
  font-size: 0.9rem;
  margin: 0;
`;

const ChatContainer = styled.div`
  display: flex;
  height: 600px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
`;

const ChatList = styled.div`
  width: 300px;
  border-right: 1px solid #e1e8ed;
  overflow-y: auto;
  background: #f8f9fa;
`;

const ChatItem = styled.div`
  padding: 15px;
  border-bottom: 1px solid #e1e8ed;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #fff;
  }

  ${props => props.active && `
    background: #fff;
    border-left: 4px solid #007bff;
  `}
`;

const ChatWindow = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #fff;
`;

const ChatInputContainer = styled.div`
  padding: 20px;
  border-top: 1px solid #e1e8ed;
  background: #fff;
`;

const ChatInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.1);
  }
`;

const AppointmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const AppointmentCard = styled.div`
  padding: 20px;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  background: #fff;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
`;

const AppointmentTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #2d3436;
  font-size: 1.2rem;
`;

const AppointmentDetails = styled.div`
  display: flex;
  gap: 20px;
  color: #636e72;
  font-size: 0.9rem;
`;

const NotesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const NoteCard = styled.div`
  padding: 20px;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  background: #fff;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
`;

const UploadButton = styled.button`
  padding: 12px 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 20px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: #218838;
    transform: translateY(-2px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 1.2rem;
  color: #2d3436;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 1.2rem;
  color: #e74c3c;
`;

const SearchContainer = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 20px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.1);
  }
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  margin-top: 5px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const SearchResultItem = styled.div`
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }
`;

const EditProfileForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-weight: 500;
  color: #2d3436;
`;

const FormInput = styled.input`
  padding: 10px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.1);
  }
`;

const FormTextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.1);
  }
`;

const SaveButton = styled.button`
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: #0056b3;
    transform: translateY(-2px);
  }
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
`;

const Message = styled.div`
  padding: 10px 15px;
  border-radius: 8px;
  max-width: 70%;
  ${props => props.isOwn ? `
    background: #007bff;
    color: white;
    align-self: flex-end;
  ` : `
    background: #f8f9fa;
    color: #2d3436;
    align-self: flex-start;
  `}
`;

const MessageTime = styled.span`
  font-size: 0.8rem;
  color: #636e72;
  align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
`;

const AppointmentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
`;

const ShareNoteButton = styled.button`
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 10px;
  transition: all 0.3s ease;

  &:hover {
    background: #5a6268;
    transform: translateY(-2px);
  }
`;

const ShareNoteModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  width: 90%;
  max-width: 500px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #636e72;
  transition: color 0.3s ease;

  &:hover {
    color: #2d3436;
  }
`;

const UserProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [connections, setConnections] = useState([]);
  const [chats, setChats] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    location: '',
    avatar_url: ''
  });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    date: '',
    time: ''
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [shareWithUser, setShareWithUser] = useState('');
  const [sharedNotes, setSharedNotes] = useState([]);

  useEffect(() => {
    console.log('UserProfile mounted, user:', user);
    if (user) {
      initializeProfile();
      fetchSharedNotes();
    } else {
      console.log('No user found, setting loading to false');
      setLoading(false);
    }
  }, [user]);

  const initializeProfile = async () => {
    try {
      console.log('Initializing profile for user:', user.id);
      setLoading(true);
      setError(null);

      // First, check if profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Profile fetch result:', { existingProfile, profileError });

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw profileError;
      }

      if (!existingProfile) {
        console.log('No existing profile found, creating new profile');
        // Create new profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              avatar_url: user.user_metadata?.avatar_url,
              bio: user.user_metadata?.bio || 'No bio yet',
              location: user.user_metadata?.location || 'Not specified',
              email: user.email,
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        console.log('Profile creation result:', { newProfile, createError });

        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        console.log('Using existing profile:', existingProfile);
        setProfile(existingProfile);
      }

      // Fetch other data
      console.log('Fetching additional data...');
      await Promise.all([
        fetchConnections(),
        fetchChats(),
        fetchAppointments(),
        fetchNotes()
      ]);

    } catch (err) {
      console.error('Error initializing profile:', err);
      setError('Failed to load profile. Please try again later.');
    } finally {
      console.log('Profile initialization complete');
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching connections:', error);
      return;
    }

    setConnections(data || []);
  };

  const fetchChats = async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching chats:', error);
      return;
    }

    setChats(data || []);
  };

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching appointments:', error);
      return;
    }

    setAppointments(data || []);
  };

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching notes:', error);
      return;
    }

    setNotes(data || []);
  };

  const fetchSharedNotes = async () => {
    const { data, error } = await supabase
      .from('shared_notes')
      .select(`
        *,
        notes (
          *,
          profiles (
            full_name,
            avatar_url
          )
        )
      `)
      .eq('shared_with', user.id);

    if (error) {
      console.error('Error fetching shared notes:', error);
      return;
    }

    setSharedNotes(data || []);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('notes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            user_id: user.id,
            title: file.name,
            file_path: filePath,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      fetchNotes();
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again.');
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('full_name', `%${query}%`)
      .neq('id', user.id)
      .limit(5);

    if (error) {
      console.error('Error searching users:', error);
      return;
    }

    setSearchResults(data);
  };

  const handleConnect = async (userId) => {
    const { error } = await supabase
      .from('connections')
      .insert([
        {
          user_id: user.id,
          connected_user_id: userId,
          status: 'pending'
        }
      ]);

    if (error) {
      console.error('Error creating connection:', error);
      return;
    }

    fetchConnections();
    setSearchResults([]);
  };

  const handleEditProfile = () => {
    setEditForm({
      full_name: profile.full_name,
      bio: profile.bio,
      location: profile.location,
      avatar_url: profile.avatar_url
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('profiles')
      .update(editForm)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return;
    }

    setProfile(data);
    setIsEditing(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          chat_id: activeChat.id,
          sender_id: user.id,
          content: newMessage,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error sending message:', error);
      return;
    }

    setMessages([...messages, data[0]]);
    setNewMessage('');
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          user_id: user.id,
          ...newAppointment,
          status: 'pending'
        }
      ]);

    if (error) {
      console.error('Error creating appointment:', error);
      return;
    }

    setAppointments([...appointments, data[0]]);
    setNewAppointment({
      title: '',
      description: '',
      date: '',
      time: ''
    });
  };

  const handleShareNote = async (noteId) => {
    setSelectedNote(noteId);
    setShowShareModal(true);
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!shareWithUser.trim()) return;

    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', shareWithUser)
        .single();

      if (userError || !userData) {
        setError('User not found. Please check the email address.');
        return;
      }

      // Create the share record
      const { error: shareError } = await supabase
        .from('shared_notes')
        .insert([
          {
            note_id: selectedNote,
            shared_by: user.id,
            shared_with: userData.id
          }
        ]);

      if (shareError) throw shareError;

      // Update the note's is_shared status
      const { error: updateError } = await supabase
        .from('notes')
        .update({ is_shared: true })
        .eq('id', selectedNote);

      if (updateError) throw updateError;

      setShowShareModal(false);
      setShareWithUser('');
      fetchNotes();
      fetchSharedNotes();
    } catch (err) {
      console.error('Error sharing note:', err);
      setError('Failed to share note. Please try again.');
    }
  };

  if (loading) {
    return (
      <ProfileContainer>
        <LoadingContainer>
          Loading your profile...
        </LoadingContainer>
      </ProfileContainer>
    );
  }

  if (error) {
    return (
      <ProfileContainer>
        <ErrorContainer>
          {error}
        </ErrorContainer>
      </ProfileContainer>
    );
  }

  if (!user) {
    return (
      <ProfileContainer>
        <LoadingContainer>
          Please sign in to view your profile
        </LoadingContainer>
      </ProfileContainer>
    );
  }

  if (!profile) {
    return (
      <ProfileContainer>
        <LoadingContainer>
          Profile not found
        </LoadingContainer>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <ProfileImageContainer>
          <ProfileImage src={profile.avatar_url || 'https://via.placeholder.com/150'} alt="Profile" />
          <EditImageButton onClick={handleEditProfile}>📷</EditImageButton>
        </ProfileImageContainer>
        <ProfileInfo>
          {isEditing ? (
            <EditProfileForm onSubmit={handleSaveProfile}>
              <FormGroup>
                <FormLabel>Full Name</FormLabel>
                <FormInput
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Bio</FormLabel>
                <FormTextArea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Location</FormLabel>
                <FormInput
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </FormGroup>
              <SaveButton type="submit">Save Changes</SaveButton>
            </EditProfileForm>
          ) : (
            <>
              <ProfileName>{profile.full_name}</ProfileName>
              <ProfileBio>{profile.bio}</ProfileBio>
              <ProfileStats>
                <StatItem>
                  <StatValue>{connections.length}</StatValue>
                  <StatLabel>Connections</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{appointments.length}</StatValue>
                  <StatLabel>Appointments</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{notes.length}</StatValue>
                  <StatLabel>Notes</StatLabel>
                </StatItem>
              </ProfileStats>
            </>
          )}
        </ProfileInfo>
      </ProfileHeader>

      <TabsContainer>
        <Tab active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
          Profile
        </Tab>
        <Tab active={activeTab === 'search'} onClick={() => setActiveTab('search')}>
          Search Users
        </Tab>
        <Tab active={activeTab === 'connections'} onClick={() => setActiveTab('connections')}>
          Connections
        </Tab>
        <Tab active={activeTab === 'chat'} onClick={() => setActiveTab('chat')}>
          Chat
        </Tab>
        <Tab active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')}>
          Appointments
        </Tab>
        <Tab active={activeTab === 'notes'} onClick={() => setActiveTab('notes')}>
          Notes
        </Tab>
      </TabsContainer>

      <TabContent>
        {activeTab === 'search' && (
          <div>
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchResults.length > 0 && (
                <SearchResults>
                  {searchResults.map(result => (
                    <SearchResultItem key={result.id}>
                      <img
                        src={result.avatar_url || 'https://via.placeholder.com/40'}
                        alt={result.full_name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                      />
                      <div>
                        <h4>{result.full_name}</h4>
                        <p>{result.bio}</p>
                      </div>
                      <button onClick={() => handleConnect(result.id)}>
                        Connect
                      </button>
                    </SearchResultItem>
                  ))}
                </SearchResults>
              )}
            </SearchContainer>
          </div>
        )}

        {activeTab === 'chat' && (
          <ChatContainer>
            <ChatList>
              {chats.map(chat => (
                <ChatItem 
                  key={chat.id} 
                  active={activeChat?.id === chat.id}
                  onClick={() => setActiveChat(chat)}
                >
                  <h4>{chat.other_user_name}</h4>
                  <p>{chat.last_message}</p>
                </ChatItem>
              ))}
            </ChatList>
            <ChatWindow>
              <ChatMessages>
                <MessageContainer>
                  {messages.map(message => (
                    <div key={message.id}>
                      <Message isOwn={message.sender_id === user.id}>
                        {message.content}
                      </Message>
                      <MessageTime isOwn={message.sender_id === user.id}>
                        {format(new Date(message.created_at), 'MMM d, h:mm a')}
                      </MessageTime>
                    </div>
                  ))}
                </MessageContainer>
              </ChatMessages>
              <ChatInputContainer>
                <form onSubmit={handleSendMessage}>
                  <ChatInput
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                </form>
              </ChatInputContainer>
            </ChatWindow>
          </ChatContainer>
        )}

        {activeTab === 'appointments' && (
          <div>
            <AppointmentForm onSubmit={handleCreateAppointment}>
              <h3>Schedule New Appointment</h3>
              <FormGroup>
                <FormLabel>Title</FormLabel>
                <FormInput
                  type="text"
                  value={newAppointment.title}
                  onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Description</FormLabel>
                <FormTextArea
                  value={newAppointment.description}
                  onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Date</FormLabel>
                <FormInput
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Time</FormLabel>
                <FormInput
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                />
              </FormGroup>
              <SaveButton type="submit">Schedule Appointment</SaveButton>
            </AppointmentForm>

            <AppointmentsList>
              {appointments.map(appointment => (
                <AppointmentCard key={appointment.id}>
                  <AppointmentTitle>{appointment.title}</AppointmentTitle>
                  <AppointmentDetails>
                    <span>Date: {new Date(appointment.date).toLocaleDateString()}</span>
                    <span>Time: {appointment.time}</span>
                    <span>Status: {appointment.status}</span>
                  </AppointmentDetails>
                  <p>{appointment.description}</p>
                </AppointmentCard>
              ))}
            </AppointmentsList>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h2>Profile Information</h2>
            <p>Email: {profile.email}</p>
            <p>Location: {profile.location}</p>
            <p>Bio: {profile.bio}</p>
          </div>
        )}

        {activeTab === 'connections' && (
          <ConnectionsGrid>
            {connections.map(connection => (
              <ConnectionCard key={connection.id}>
                <ConnectionImage src={connection.avatar_url || 'https://via.placeholder.com/100'} alt="Connection" />
                <ConnectionName>{connection.full_name}</ConnectionName>
                <ConnectionBio>{connection.bio}</ConnectionBio>
              </ConnectionCard>
            ))}
          </ConnectionsGrid>
        )}

        {activeTab === 'notes' && (
          <div>
            <UploadButton onClick={() => document.getElementById('file-upload').click()}>
              Upload Note
            </UploadButton>
            <input
              type="file"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            
            <h3>My Notes</h3>
            <NotesContainer>
              {notes.map(note => (
                <NoteCard key={note.id}>
                  <h3>{note.title}</h3>
                  <p>Created: {new Date(note.created_at).toLocaleDateString()}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a 
                      href={`${supabase.storage.from('notes').getPublicUrl(note.file_path).data.publicUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                    <ShareNoteButton onClick={() => handleShareNote(note.id)}>
                      Share
                    </ShareNoteButton>
                  </div>
                </NoteCard>
              ))}
            </NotesContainer>

            <h3>Shared with Me</h3>
            <NotesContainer>
              {sharedNotes.map(shared => (
                <NoteCard key={shared.id}>
                  <h3>{shared.notes.title}</h3>
                  <p>Shared by: {shared.notes.profiles.full_name}</p>
                  <p>Created: {new Date(shared.notes.created_at).toLocaleDateString()}</p>
                  <a 
                    href={`${supabase.storage.from('notes').getPublicUrl(shared.notes.file_path).data.publicUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                </NoteCard>
              ))}
            </NotesContainer>
          </div>
        )}

        {showShareModal && (
          <>
            <ModalOverlay onClick={() => setShowShareModal(false)} />
            <ShareNoteModal>
              <CloseButton onClick={() => setShowShareModal(false)}>&times;</CloseButton>
              <h3>Share Note</h3>
              <form onSubmit={handleShareSubmit}>
                <FormGroup>
                  <FormLabel>Share with (email)</FormLabel>
                  <FormInput
                    type="email"
                    value={shareWithUser}
                    onChange={(e) => setShareWithUser(e.target.value)}
                    placeholder="Enter user's email"
                  />
                </FormGroup>
                <SaveButton type="submit">Share</SaveButton>
              </form>
            </ShareNoteModal>
          </>
        )}
      </TabContent>
    </ProfileContainer>
  );
};

export default UserProfile; 