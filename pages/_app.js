import '../styles/globals.css'
import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

function MyApp({ Component, pageProps }) {
  return (
    // <ClerkProvider {...pageProps}>
    //   <SignedIn>
        <Component {...pageProps} />
    //   </SignedIn>
    //   <SignedOut>
    //     <RedirectToSignIn />
    //   </SignedOut>
    // </ClerkProvider>
  );
}

export default MyApp
