import { supabase } from './lib/supabase';
import { useEffect, useState } from 'react';
import Chat from '../components/Chat';
import Auth from '../components/Auth';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = supabase.auth.user();
    setUser(currentUser);

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {user ? <Chat /> : <Auth />}
    </div>
  );
}
