---
title: Implementing API Rate Limiting With Upstash and Next.js
publishDate: May 21, 2023
description: Ratelimiting is an important concept when developing APIs, but it can also be a little scary if you've never done it before. In this article, I'm going to show you how simple it is implement API rate limiting with Upstash and Next.js.
---

**Ratelimiting is an important concept when developing APIs, but it can also be a little scary if you've never done it before. In this article, I'm going to show you how simple it is implement API rate limiting with Upstash and Next.js.**

## Introduction

If you've ever developed an API, you may have heard of the term "ratelimiting". Ratelimiting is a way to prevent your API from being abused. For example, if you have an API that allows users to create posts, you may want to limit the number of posts a user can create in a given time period. This is where ratelimiting comes in. It allows you to limit the number of requests a user can make in a given time period.

Let's say you have a Next.js endpoint in `/api/limited/`, that you only want to allow 10 requests per minute. The endpoint looks like this:

```ts
// src/pages/api/limited/index.ts
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const message = await getMessage(); // This may be expensive

  res.status(200).json({ message });
};
```

## Using Upstash

Upstash is a serverless Redis database that allows you to store data in the cloud. It's a great way to store data that you need to access quickly, and it's perfect for implementing ratelimiting. The best thing about Upstash is that it has a dedicated Ratelimiting package that makes it super easy to implement ratelimiting in your application.

To start, install the Upstash package:

```
npm i @upstash/ratelimit @upstash/redis
```

Great! Now you can use the `@upstash/ratelimit` package to implement ratelimiting in your application. Here's how you would implement ratelimiting in your Next.js API:

```ts
// src/pages/api/limited/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createRateLimiter } from "@upstash/ratelimit";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.ip; // You can use any user identifier here

  const rateLimiter = createRateLimiter({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "60 s"),
  });

  const { success, reset } = await rateLimiter.limit(id);

  if (!success) {
    // The user has exceeded the ratelimit
    // Return a 429 "Too many requests" response
    // With a "Retry-After" header that tells the
    // user when they can make another request
    const now = Date.now();
    const retry = Math.ceil((reset - now) / 1000);
    res.setHeader("Retry-After", retry);
    res.status(429).json({ message: "Too many requests" });
    return;
  }

  // The user has not exceeded the ratelimit
  const message = await getMessage(); // This may be expensive

  res.status(200).json({ message });
};
```

We are done with the code, but we still need to connect it to a database in Upstash and get the environment variables in our `.env` file. To do this, we need to create a new database in Upstash. To do this, go to the [Upstash dashboard](https://console.upstash.com/), and click on "Create Database". Give your database a name, and click on "Create Database". Then go to the `REST API` tab, and copy the `.env` file contents into your `.env` file.

```
UPSTASH_REDIS_REST_URL="https://your-upstash-database.upstash.io"
UPSTASH_REDIS_REST_TOKEN="YOUR_SECRET_TOKEN"
```

Is that... it? Surprisingly it is! Now you can test your API endpoint and see that it works as expected. If you make more than 10 requests in a minute, you will get a `429` response with a `Retry-After` header that tells you when you can make another request.

## Conclusion

Ratelimiting has become crazy easy to implement thanks to modern tools like Upstash. In this article, we've seen how trivial it is to implement ratelimiting in a Next.js API using Upstash. Now there's no excuse not to implement ratelimiting in your APIs!
