import '../styles/globals.css'
import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

function MyApp({ Component, pageProps }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}  {...pageProps}>
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
