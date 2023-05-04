---
title: Writing a Typesafe getServerSideProps Wrapper for Auth Redirects
publishDate: May 3, 2023
description: I have been learning more about Typescript recently, and I wanted to practice some of the concepts I have been learning to write a typesafe wrapper for getServerSideProps that redirects to a login page if the user is not authenticated.
---

**I have been learning more about Typescript recently, and I wanted to practice some of the concepts I have been learning to write a typesafe wrapper for getServerSideProps that redirects to a login page if the user is not authenticated.**

## Introduction

As I shared in my [previous post](/implementing-server-side-auth), I recently had to implement server side authentication in a Next.js application. I wanted to write a wrapper for getServerSideProps that would redirect to a login page if the user was not authenticated. I also wanted to make sure that the wrapper was typesafe, so I could use it in any page that needed to be protected.

## The problem

Currently, the getServerSideProps on any protected page looks a little bit like this:

```ts
const getServerSideProps: GetServerSideProps = async (context) => {
  const authToken = context.req.cookies.authToken;

  if (!authToken) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const user = await verifyUser(authToken);

  if (!user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: `protected-page/${user.uid}`,
      permanent: false,
    },
  };
};
```

Basically, I check if the user has the `authToken` in their cookies, and if they don't then I inmediately redirect them to the login page. If they do have the `authToken`, I verify it with firebase, and if it is valid, I redirect them to the protected page. This works as expected, but it gets kinda ugly when we need to do this in multiple pages. I wanted to write a wrapper that would do this for me, and I wanted to make sure it was typesafe.

## The solution

### Deciding on the API

Because one of the main goals of this refactor was to make the code cleaner, I made sure to really think about the API. I wanted to make it super easy to redirect users depending on their authentication status, as well as customizable so I can write more complex logic if neccessary. I also wanted to make `getServerSideProps` optional, because I may not need any more logic than the redirect.

I came up with something like this:

```ts
export const getServerSideProps = myWrapper({
  // We run this function if the user is authenticated
  onAuthSuccess: ({ user, ctx }) => {
    // We have access to the user, and the getServerSideProps context
    // we return a Redirect object
    return {
      redirect: {
        destination: `protected-page/${user.uid}`,
        permanent: false,
      },
    };
  },

  // We run this function if the user is not authenticated
  // We also return a Redirect object
  onAuthFailure: ({ ctx }) => ({ destination: "/login", permanent: false }),

  // We can also provide a normal getServerSideProps function
  getServerSideProps: async (ctx) => {
    // We have access to the getServerSideProps context
    return {
      props: {
        // Ideally this is typesafe
      },
    };
  },
});
```

### The types

Now that I have an API, let's write the `withRedirects` function signature.

It must have the following arguments:

- `o` - An object with the `onAuthSuccess`, `onAuthFailure`, and `getServerSideProps` functions
  - `onAuthSuccess` - A function that takes a `user` and a `ctx` and returns a `Redirect` object (optional)
  - `onAuthFailure` - A function that takes a `ctx` and returns a `Redirect` object (optional)
  - `getServerSideProps` - A `GetServerSideProps` function (optional)

Also remember the type argument so that we can make sure that the `getServerSideProps` function returns the correct props:

- `<T extends { [key: string]: any }>` - The type of the props that the `getServerSideProps` function returns

And finally, it must also return a function of the type `GetServerSideProps` so that Next.js can use it.

- Returns `GetServerSideProps<T>`

Putting it all together, we get this:

```ts
const withRedirects = <T extends { [key: string]: any }>(o: {
  getServerSideProps?: GetServerSideProps<T>;
  onAuthSuccess?: (o: {
    ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>;
    user: UserT;
  }) => Redirect | undefined;
  onAuthFailure?: (o: {
    ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>;
  }) => Redirect | undefined;
}) => {
  // TODO!
};
```

### The implementation

All that's left to do is implement the function. I'm going to break it down into smaller pieces so it's easier to understand. All this code goes inside the `withRedirects` function we've already defined above.

```ts
// We destructure the arguments
const { getServerSideProps, onAuthSuccess, onAuthFailure } = o;

// We define the getServerSideProps function we will return
const getServerSidePropsWithRedirects: GetServerSideProps = async (ctx) => {
  // We complete this in the next steps
};

// And we return it
return getServerSidePropsWithRedirects;
```

We just destructured the arguments, and defined the `getServerSidePropsWithRedirects` function. Now we need to implement it. We need to run our `getServerSideProps`, store the results, and then run the `onAuthSuccess` or `onAuthFailure` functions depending.

```ts
// We destructure the arguments
const { getServerSideProps, onAuthSuccess, onAuthFailure } = o;

// We define the getServerSideProps function we will return
const getServerSidePropsWithRedirects: GetServerSideProps = async (ctx) => {
  // Default return value
  let getServerSidePropsReturn = {
    props: {},
    notFound: false,
  };

  // Get the authToken from the cookies
  const authToken = ctx.req.cookies.authToken;

  // Run the getServerSideProps function if it exists
  // and store the results
  if (getServerSideProps) {
    getServerSidePropsReturn = (await getServerSideProps(ctx)) as {
      props: object;
      notFound: boolean;
    };
  }

  // If we have an authToken, verify it
  if (authToken) {
    const user = await verifyUser(authToken);

    // If the user is authenticated, run the onAuthSuccess function
    // and return the results as a Redirect
    if (user) {
      return {
        props: getServerSidePropsReturn.props,
        notFound: getServerSidePropsReturn.notFound,
        redirect: onAuthSuccess ? onAuthSuccess({ ctx, user }) : undefined,
      };
    } else {
      // If the user is not authenticated, run the onAuthFailure function
      // and return the results as a Redirect
      return {
        props: getServerSidePropsReturn.props,
        notFound: getServerSidePropsReturn.notFound,
        redirect: onAuthFailure ? onAuthFailure({ ctx }) : undefined,
      };
    }
  } else {
    // If we don't have an authToken, run the onAuthFailure function
    // and return the results as a Redirect
    return {
      props: getServerSidePropsReturn.props,
      notFound: getServerSidePropsReturn.notFound,
      redirect: onAuthFailure ? onAuthFailure({ ctx }) : undefined,
    };
  }
};

// And we return it
return getServerSidePropsWithRedirects;
```

### The final result

With this new `withRedirects` function, we can now write ALL our protected pages using this neat API:

```ts
export const getServerSideProps = withRedirects<LoginPage>({
  onAuthFailure: () => ({ destination: "/login", permanent: false }),
  onAuthSuccess: ({ ctx, user }) => {
    if (ctx.resolvedUrl !== `/chat/${user.uid}`) {
      return { destination: `/chat/${user.uid}`, permanent: false };
    }
  },
  // We don't need to provide a getServerSideProps in this case
  // but we can if we need to
  getServerSideProps: undefined,
});
```

## Conclusion

That's it! We now have a typesafe wrapper for getServerSideProps to define redirects based on the user's authentication status. This not only made our code more DRY, but also made it cleaner and easier to read. I hope you learned something or at least found this interesting. If you have any questions or suggestions, feel free to reach out to me on [Twitter](https://twitter.com/adpadillar).
