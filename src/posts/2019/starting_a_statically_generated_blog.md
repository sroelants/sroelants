---
section: blog
title: Statically generated sites and the JAMstack
author: Sam Roelants
permalink: "{{title | slug }}/index.html"
tags:
  - post
  - web
  - static site generator
  - eleventy
description: "There is a bit of a trope, a tradition, that the first thing that is discussed
on a newly founded blog should be how said blog was set up and configured.
I wouldn't dare break away from this tradition, and will in due time write down
the nitty gritty that went into setting up this blog, the things I've learned
and the gripes I had with the tools used. In this particular post, though, I'd
like to start by talking about some of the reasons for choosing the particular
technologies that I did."
---

There is a bit of a trope, a tradition, that the first thing that is discussed
on a newly founded blog should be how said blog was set up and configured.
I wouldn't dare break away from this tradition, and will in due time write down
the nitty gritty that went into setting up this blog, the things I've learned
and the gripes I had with the tools used. In this particular post, though, I'd
like to start by talking about some of the reasons for choosing the particular
technologies that I did.

## The JAMstack and static sites
The web world is saturated with buzzwords. 

_"But is it **responsive**?"_,

_"Bro, do you even do **reactive programming**?"_,

_"Have you looked into
**isomorphically rendering** your app on the server?"_. 

Okay, _fine_, no one talks
like that, but the point still stands.
One buzzword that's been garnering a lot of attention the last couple of years
is the [**JAMstack**](https://jamstack.org).

Traditional web applications are backed by a web server running the application
in the background. The user interacts with the application, the application
typically stores and retrieves information from a database, generates a new 
page based on this information, and serves it to the user. There are a lot of
technologies involved here, and people have taken to describing particularly
popular combinations ("_stacks_") with cool looking acronyms. Some
typical ones are 
- _LAMP_ (A _**L**inux_
machine running an _**A**pache_ server interacting with a _**M**ySQL_ database and an
application written in _**P**HP_) 
- _MEAN_ (A _**M**ongoDB_ database, _**E**xpress.js_ web
server running an _**A**ngularJS_ frontend, backed by a _**N**ode.js_ application).

Enter the JAM stack: **J**avascript, **A**PI's and **M**arkup. That's right: no
mention of a server or database. Just good old HTML and CSS, livened up with 
Javascript. All interaction with backend applications is abstracted away through
API calls.
Javascript has come so
far in the last two decades that many cases that traditionally called for a 
back-end application can now be completely contained within the browser. If that
sounds limiting to you, you'd actually be surprised [how
much](https://www.thenewdynamic.org) you can achieve
with these basic building blocks by outsourcing functionalities to purposefully
built APIs.

Do you want people to be able to comment on your blog post? [There's a service
for that](https://disqus.com). 

Do you want to have a webshop? 
[There's a service for that](https://shopify.com). 

_"But I like
the interface my CMS provides for writing up content"_. [Write your blog posts in
markup in a user-friendly UI](https://prose.io).

This architecture does away with loads of the problems that come with tightly
coupling a website to an (often monolithic) backend application.

- It's *far more secure*. Protecting against attacks falls on the services that
  provide the APIs you use (I trust the people at Twitter or Google a whole lot
  more than myself on that account)
- It's *far cheaper* to host a static webpage. Platforms like Github and Netlify
  will host your page for free.
- Expect *much faster* load times. We've done away with the extra steps of 
  talking to the database and dynamically generating the page. One HTML request
  and the page gets served. 
  Static pages that don't rely on a server to generate them can also be served
  from a CDN, so your content doesn't have to travel halfway across the world.

The canonical references people throw around when talking about the JAMstack are 
Mathias Biilmann's (of Netlify fame) [article on static site generators](https://www.smashingmagazine.com/2015/11/modern-static-website-generators-next-big-thing/) (more 
on which later), and Smashing Magazine [decreasing their load time *tenfold* by
switching to a JAMstack](https://www.netlify.com/case-studies/smashing/). If 
you want in depth discussions of the plethora of benefits, I refer to them instead
of repeating all of them here. 

Which brings us to the next topic: the catalyst that made the JAMstack revolution
possible...

## Static Site Generators
Part of what made the traditional webserver+database scheme so attractive is the
decoupling between markup and content it provides. Essentially the page
layout is stored on the server as a template.  As soon as a user requests a 
certain page, the appropriate content is pulled from the database, plugged into
the template and served up. Surely you can't expect blog writers to hardcode
tens or hundreds of posts straight to HTML. As soon as they wanted a redesign of
their page, they'd have to go around editing the HTML on every single page. 

That sounds preposterous.

Enter SSGs. There is no reason we couldn't adopt this scheme of separating
content and templates on the developer's (or content creator's) computer. One
could then just run a compilation step, generating the static HTML pages, ready 
to be uploaded.

Want to give your website a complete makeover? Just change the template and
recompile your website. Done.

To say the SSG market boomed over the last couple of years would be a gross 
understatement. SSGs are available written in virtually any language you can
think of, all having their tradeoffs and serving rather specific purposes. 
The list -- conveniently kept up to date at
[Staticgen](https://www.staticgen.com) -- is too long for me to bother counting.

A couple of the more popular ones are (according to Staticgen.com):
- **[Jekyll](https://jekyllrb.com)**: Probably still the reigning king in the 
SSG-land with a massive ecosystem of plugins. Written in
Ruby and mainly aimed at blogging sites. Part of its popularity is 
due to its tight integration with Github Pages.

- **[Gatsby](https://www.gatsbyjs.io)**: Probably the biggest SSG written in Javascript. It generates 
websites as React apps.

- **[Hugo](https://www.gohugo.io)**: Written in Go, Hugo's main selling point is *speed*. We're talking
orders of magnitude. For this reason, Hugo is becoming popular among bigger 
websites with tons of pages to be generated on every rebuild. Smashing
Magazines' legendary static incarnation is powered by Hugo.

- **[Hexo](https://www.hexo.io)**: Another Javascript-based SSG. Unlike Gatsby with React, Hexo 
doesn't force any framework on you. While it's seemingly really popular, the
bulk of Hexo's userbase is centered in China. This makes reaching out to the
community or finding extra resources harder than some of the other SSGs
mentioned here.

None of these particularly appealed to me. I wanted to be able to get my hands
dirty if necessary, and I don't really have any experience reading or writing
Ruby or Hugo, so they were out. It's not like my modest blog would benefit much
from Hugo's high speed compilation. Gatsby forces me to make the website into a
full blown React app, which again sounded a bit overkill. Hexo sounded like a 
viable alternative, but I wanted to have a lively community to reach out to when 
needed.

I ended up going for [Eleventy](https://www.11ty.io), 
a brand new SSG (when I say brand new, I mean brand new, it was released in 2018)
that has been gaining a lot of traction in the last year. It is an extremely
streamlined, no-frills generator written in javascript that doesn't force any
framework on the user. The beautiful thing about it being Node.js based is that
the entire NPM ecosystem is essentially available to customize and configure
your blog in whichever way you want. In the next post, where I go slightly more
in depth into how I set up Eleventy, it will become apparent just how npm is an
essential part of the Eleventy experience.

## Hosting on Netlify
Before, I used to host any personal stuff on Github Pages. Deploying the page
is literally just a `git push`. Netlify takes this easy deployment and turns it
up to eleven. Deployment still just consists of a `git push`, but netlify
throws in many extras, like asset optimization, SSG compatibility (essentially,
you tell Netlify how to compile your site, and it will do it for you whenever
you push to your repository). Netlify's free plan also integrates with AWS
Lambda functions, provides continuous deployment and prerendering for SEO
optimization.

*Phew*, I hope that wasn't too much of a sales talk. 
I'm can't to see what this modern approach means for present-day blogging.


