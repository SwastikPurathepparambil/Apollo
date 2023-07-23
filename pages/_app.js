import '../styles/globals.css'
import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

function MyApp({ Component, pageProps }) {
  return (
    <ClerkProvider {...pageProps} publishableKey="pk_test_ZXZvbHZlZC1nYW5uZXQtNTcuY2xlcmsuYWNjb3VudHMuZGV2JA">
      <SignedIn>
        <Component {...pageProps} />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </ClerkProvider>
  );
}

export default MyApp
