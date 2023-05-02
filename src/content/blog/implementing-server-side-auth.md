---
title: Implementing Server Side Auth With Firebase and Next.js
publishDate: May 2, 2023
description: I was recently working on a Next.js Application. I normally use firebase-auth for authentication, but the main library runs client side, and I needed to implement server side authentication. Here's how I did it.
image: https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmiro.medium.com%2Fproxy%2F1*zTdZMxbTkVdXCOoZlXLnsg.png&f=1&nofb=1&ipt=6fcd7927ae9a31a1dcb6956a14ea5f4aed1f392230c1673f89bb467a6b8ef484&ipo=images
---

**I was recently working on a Next.js Application. I normally use firebase-auth for authentication, but the main library runs client side, and I needed to implement server side authentication. Here's how I did it.**

## Introduction

If you've used the [firebase](https://www.npmjs.com/package/firebase) package when implementing auth in your web application, you may know that it provides client side authentication. It provides an easy way to log your users in and out, but some extra work is needed if you need to authenticate your users server side. This is exactly the problem I ran into, and I'm going to show you how I solved it in Next.js.

## Server setup

The first thing you need to do is install the [firebase-admin](https://www.npmjs.com/package/firebase-admin) package. This package is meant to be used in a server environment, and it provides a way to authenticate your users server side. You can install it with npm:

```
npm install firebase-admin
```

Then you initialize it with your firebase credentials. This is the code I use to avoid initializing it multiple times:

```ts
// src/server/firebase/app.ts
import { credential } from "firebase-admin";
import { getApp, initializeApp, getApps } from "firebase-admin/app";
import { env } from "~/env.mjs";

if (getApps().length === 0) {
  initializeApp(
    {
      credential: credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    },
    "server"
  );
}

const serverApp = getApp("server");

export { serverApp };
```

Now you can use the `serverApp` to do some backend operations with firebase. For example, you can use it to verify a user's token:

```ts
// src/server/firebase/auth.ts
import { type DecodedIdToken, getAuth } from "firebase-admin/auth";

const verifyUser = async (idToken: string): Promise<null | DecodedIdToken> => {
  try {
    const auth = getAuth(serverApp);
    const decodedToken = await auth.verifyIdToken(idToken);
  } catch (error) {
    return null;
  }
};
```

The `verifyUser` function will return `null` if the token is invalid, and it will return the decoded token if it is valid. It uses the [verifyIdToken](https://firebase.google.com/docs/auth/admin/verify-id-tokens) method from the firebase-admin package. Now we just need to create an API route that requires authentication.

```ts
// src/pages/api/protected-route.ts
import { NextApiRequest, NextApiResponse } from "next";
import { verifyUser } from "~/server/firebase/auth";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { idToken } = req.cookies;
  const decodedToken = await verifyUser(idToken);

  if (!decodedToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.status(200).json({ message: `User id: ${decodedToken.uid}` });
};
```

This route will return a 401 status code if the user is not authenticated, and it will return a message with the user's id if they are authenticated. Now we just need to create a page that will call this API route. This route also expects a cookie with the name `idToken` to be sent with the request. This is all the work we need to do on the server side.

## Client setup

We can start by defining the `createCookie` and `deleteCookie` functions:

```ts
// src/utils/firebase/auth.ts
function createCookie(name: string, value: string, expireDate: Date) {
  const expires = "; expires=" + expireDate.toUTCString();
  document.cookie = name + "=" + value + expires + "; path=/";
}

function deleteCookie(name: string) {
  createCookie(name, "", new Date(0));
}
```

Then we can make a `signIn` and `signOut` function that also sets and removes the `idToken` cookie. This functions will run on the client in our React components:

```ts
// src/utils/firebase/auth.ts
import {
  GoogleAuthProvider,
  signInWithPopup,
  type UserCredential,
  type User as FirebaseUser,
} from "firebase/auth";

type provider = "google";

const signIn = async (o: {
  provider: provider;
  onSuccess?: (u: FirebaseUser) => void;
}) => {
  let signInWith: () => Promise<UserCredential>;

  switch (o.provider) {
    case "google":
      signInWith = async () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
      };
      break;
  }

  const providerResponse = await signInWith();

  // We need to complete the FirebaseUser type with
  // the stsTokenManager and expirationTime
  const overrideUserT = providerResponse.user as FirebaseUser & {
    stsTokenManager: { expirationTime: number };
  };

  const authToken = await providerResponse.user.getIdToken();
  const expiration = new Date(overrideUserT.stsTokenManager.expirationTime);

  createCookie("idToken", authToken, expiration);

  if (o.onSuccess) o.onSuccess(providerResponse.user);

  return providerResponse;
};

const signOut = async (o: { onSuccess?: () => void }) => {
  await auth.signOut();
  deleteCookie("idToken");

  if (o.onSuccess) o.onSuccess();
};
```

This `signIn` function allows you to sign in with a google account, but you can add more providers if you want. It calls the `onSuccess` callback if it is provided. Similarly, the `signOut` function calls the `onSuccess` callback if it is provided.

Finally, we can create use these functions on our React App

```tsx
// src/pages/index.tsx
import { type NextPage } from "next";
import { signIn } from "~/utils/firebase/auth";

const Home: NextPage = () => {
  return (
    <>
      <button
        onClick={() => {
          signIn({
            provider: "google",
            onSuccess: () => {
              // Do something after the user signs in
            },
          });
        }}
      >
        Sign In With Google
      </button>
    </>
  );
};

export default Home;
```

## Conclusion

With this setup, the api route `api/protected-route` will only be accessible to users that are signed in. You can use this to protect any route in your app. You can also use this to get the user's id and other information from the decoded token.

This shows that we can use firebase to authenticate users in our Next.js app both on the client and server side. This is pretty cool, considering that [Firebase Auth is a free service](https://firebase.google.com/pricing#authentication) (without Phone Auth)
