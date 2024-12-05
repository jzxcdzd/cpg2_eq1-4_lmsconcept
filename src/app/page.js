'use client';
import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';

const providers = [{ id: 'credentials', name: 'Email and Password' }];

const signIn = async (provider, formData, router) => {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.accountDetails && data.accountDetails.length > 0) {
      const account = data.accountDetails[0];
      console.log('Account:', account);
      const userType = account.userType;
      alert(`Signed in successfully as ${userType}`);

      if (userType === 3) {
        router.push(`/dashboard/student/${account.studentID}/`);
      } else if (userType === 2) {
        router.push(`/dashboard/instructor/${account.instructorID}/`);
      } else if (userType === 1) {
        router.push('/dashboard/admin');
      }
    } else {
      alert('No users found with these credentials.');
    }
  } catch (error) {
    console.error('Error signing in:', error);
    alert('An error occurred while signing in.');
  }
};

export default function CredentialsSignInPage() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <AppProvider theme={theme}>
      <SignInPage
        signIn={(provider, formData) => signIn(provider, formData, router)}
        providers={providers}
      />
    </AppProvider>
  );
}