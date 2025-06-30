import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export function AuthContainer() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <>
      {showSignup ? (
        <SignupForm onBackToLogin={() => setShowSignup(false)} />
      ) : (
        <LoginForm onShowSignup={() => setShowSignup(true)} />
      )}
    </>
  );
}