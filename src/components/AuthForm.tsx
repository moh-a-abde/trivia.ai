'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

interface AuthFormProps {
  darkMode?: boolean;
}

const AuthForm = ({ darkMode = false }: AuthFormProps) => {
  const { data: session, status } = useSession();

  console.log('AuthForm status:', status);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session) {
    console.log('AuthForm session:', session);
    return (
      <div>
        <p>Welcome, {session.user?.name}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div className="mx-auto">
        <button
        onClick={() => signIn('google')}
        className="flex items-center justify-center gap-2 bg-white text-black py-2 px-4 rounded shadow-sm hover:bg-gray-100 transition-colors"
        >
        <img
            src="/googlesymbol.png"
            alt="Google logo"
            className="h-6 w-6"
        />
        Sign in with Google
        </button>
    </div>
  );
};

export default AuthForm;
