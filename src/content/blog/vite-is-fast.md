---
title: How I cut the deploy time in my website by 60%
publishDate: February 2, 2023
description: I started this site nearly 2 years ago using Create React App when I didn't know any better. Yesterday I migrated to Vite and was amazed by the performance and DX gains without putting in that much work.
image: https://res.cloudinary.com/practicaldev/image/fetch/s--8eIAvTRd--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/nvi1wa2sy5wnmsjhf239.jpg
---

**I started this site nearly 2 years ago using Create React App when I didn't know any better. Yesterday I migrated to Vite and was amazed by the performance and DX gains without putting in that much work.**

About 2 years ago, I started making some freelance/webdev work and one of my first websites was a simple landing page for a client. At the time, I decided that [Create React App](https://create-react-app.dev) was the best tool for the job. I was just getting comfortable with React so it seemed like the obvious choice. However, nearly 2 years later it is evident that [Create React App is a bad choice for starting a new project.](https://github.com/reactjs/reactjs.org/pull/5487)

This post won't go specifically into what is wrong with Create React App, and I will instead link to a [video by Theo where he explains it pretty well.](https://youtu.be/7m14f0ZzMyY)

Long story short, this simple website was causing me too many headaches when making changes, from not being able to install Tailwind without some pretty stupid [configuration overrides](https://github.com/dilanx/craco), HMR being slower than I was used to, and deployment times that took up to 2 mins for a simple landing page. I finally decided this was too much, and wanted to see how hard would it be to migrate an entire codebase from CRA to [Vite](https://vitejs.dev/).

![Screenshot 2023-02-02 at 23.20.52.png](https://storage.googleapis.com/blog-axelpadilla.appspot.com/marktext%2Fimg%2FScreenshot%202023-02-02%20at%2023.20.52.png "This was one of my deployments before migrating")

The idea was very simple: Vite is just another React SPA, so if I just copy over my components and public folder, set up TailwindCSS properly, and modify my Github Actions, I should be able to migrate this thing in no time!

So that is exactly what I did. I started by deleting all of the files I knew I would be keeping (don't worry, they're still in my git history) and then ran Vite's init command with pnpm:

```bash
pnpm create vite my-app --template react-ts
# Then install the dependencies with
cd my-app
pnpm install
```

After running the `pnpm dev` command, and opening the app in locally on`http://127.0.0.1:5173/`, I see the following starter app:

![Screenshot 2023-02-02 at 23.29.30.png](https://storage.googleapis.com/blog-axelpadilla.appspot.com/marktext%2Fimg%2FScreenshot%202023-02-02%20at%2023.29.30.png)

Now the restoring begins. I use git to restore my `public/` and `components/` folder, which are conveniently on the same location both in CRA and Vite, so I don't really need to do anything else for those.

Now I follow the guide to set up [TailwindCSS with Vite](https://tailwindcss.com/docs/guides/vite), which is so much easier with the first class support for postCSS. I can also restore my `tailwind.config.js` and rename it to the newer `tailwind.config.cjs`.

After that I need to copy/paste my CRA App component into Vite's `App.tsx` file, fix some imports that are expecting an export from `index.tsx`, manually copy paste the relevant parts of my `index.html` file we're pretty much done. The website looks exactly the same as it did in CRA, but it feels snappier and with much better support for better tools.

Now, the moment of truth. I have to make a few modifications to my Github Actions Deployment Workflow:

```yaml
name: "Netlify Deploy"
on:
  push:
    branches:
      - master
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 7.25.1
      - uses: actions/setup-node@v3
        with:
          node-version: "14"
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - name: "Deploy"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        run: yarn netlify deploy --dir=dist --prod
```

And after running, it took 30s vs the previous 1m 42s. It's the same code, just different tools. The entire migration process took a single commit and about 30 minutes of my time.

![Screenshot 2023-02-02 at 23.41.54.png](https://storage.googleapis.com/blog-axelpadilla.appspot.com/marktext%2Fimg%2FScreenshot%202023-02-02%20at%2023.41.54.png)

That is wild. I'm really happy with the improvements I was able to make by migrating to Vite. I hope you enjoyed reading along and learned something new.
