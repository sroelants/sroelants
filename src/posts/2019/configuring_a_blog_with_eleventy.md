---
section: blog
title: Configuring a blog with Eleventy
author: Sam Roelants
layout: mainlayout.njk
tags:
  - post
  - web
  - static site generator
  - eleventy
  - configuration
description: "
The first thing one notices when looking at the Eleventy documentation is that
*there isn't really much there*. It's about as bare bones as it gets: no 
complicated data models, no strict directory hierarchies. Eleventy takes all 
files from one folder, compiles them, and generates a folder of output files.
Learning how to use it was, in a word, a breeze."
---

The first thing one notices when looking at the Eleventy documentation is that
*there isn't really much there*. It's about as bare bones as it gets: no 
complicated data models, no strict directory hierarchies. Eleventy takes all 
files from one folder, compiles them, and generates a folder of output files.
Learning how to use it was, in a word, a breeze.

## Installing Eleventy and basic usage
Let's get started by installing eleventy with npm (or your Node package manager
of choice)

```text
npm install --save-dev @11ty/eleventy
```

Eleventy will by default take any files it recognizes in the current folder, and
output processed HTML files in a new subfolder `_site`. We can change this
behaviour on the command line by passing along some flags. The following command
would use `npx` to run eleventy on all Markdown (`.md`) and Nunjucks (`.njk`)
files in the directory `src/`, and write the output to `dist/`
```text
npx @11ty/eleventy --input=src --output=dist --formats=md,njk
```

Instead of passing these flags on every run, we can set them in Eleventy's
global config file `.eleventy.js`, in the project's root directory. This is
where we configure all of Eleventy's behavior.

```js
module.exports = function(eleventyConfig) {
  return { dir: { input: "src", output: "dist" }}
```

### Templates and layouts
A lot of people seem to like Eleventy for its support for all the big templating
engines. This means that migrating a blog from Jekyll (that uses Liquid
templates) to Eleventy is a breeze: you can simply keep your old blog posts
written using Liquid and start writing newer posts in any other templating
syntax you'd prefer. By default, Eleventy figures out which templating engine
to use by looking at the file extension (ie. markdown for `.md` files, Nunjucks
for `.njk` files, etc...), though the user can fine tune this in the config.

Templates allow you to dynamically create content pages dependent on some
extra environment variables. These variables are usually stored in the 
YAML-formatted front matter of the template:
```yaml
---
section: blog
layout: mainlayout.njk
title: Configuring a blog with Eleventy
author: Sam Roelants
tags:
  - draft
  - web
  - static site generator
  - eleventy
  - configuration
description: ""
---
...
```

Of course, it would be horribly redundant to have to include all the layout 
markup (ie, the html) in every single template file corresponding to a single
post. This is where *layouts* really shine. Notice the `layout: mainlayout.njk`
in the front matter we just saw. Eleventy allows you to create a generic page
with all the layout, and populate that with posts stored in template files.
By default, all these layout files are stored in an `_includes/` folder along
with the rest of your site's sources.


### File organization
Unlike many other static site generators, Eleventy places no constraints on your
directory tree. You get to organize your project however you see fit, without
eleventy getting in the way. For this blog, I have something resembling the
following:

```text
./
  src/
    _includes/
    assets/
      sass/
      images/
      posts/
      drafts/
  dist/
```

You can define folder-wide front matter variables that apply to all template
files found in that folder. These are stored in a json file carrying the same 
name as the folder, eg. `posts.json` in the folder `posts`. All blog posts
use the same layout-file, have the same url format and include the `post` tag
so they can be collected later on. Instead of adding all these tags to the front
matter of every template, I have the following file set up:
```text
(src/posts/posts.json:)

{
  "permalink": "/blog/&lbrace;{ title | slug &rbrace;}/index.html",
  "layout": "post.njk"
  "tags": 
    - post
}
```

### Filters and shortcodes
This is where using a templating language, rather than plain HTML, really starts
to shine. Filters are functions that can process the environment
variables. Some are built in (eg. to escape a string or turn it into a 
[slug](https://en.wikipedia.org/wiki/Clean_URL#Slug)), but users can easily 
drop their own filters into the `.eleventy.js` config file. If I wanted to use
an escaped version of the title somewhere in the page, I simply use <code>&lbrace;{title
| safe }&rbrace;</code>. In the last section, I generated a slug to form the
permalink to my blog posts using <code>&lbrace;{url | slug }&rbrace;</code>.
If I want to use the `date`, that is stored as a JS 
`Date` object -- and hence is utterly useless to us -- we could write a filter
`readable` so that we could display the date as <code>&lbrace;{ date | readable
}&rbrace;</code>. We can drop this function in `eleventy.js` as follows:
```js
module.exports = function(eleventyConfig) {
const moment = require('moment');

  eleventyConfig.addFilter("readable", function(date) {
    return moment(date).format("LL");
  });
  });
};
```

Shortcodes are the second construction where the power of templating really 
becomes apparent. They are basically reusable snippets of code that can be
predefined. I use the same format for some post metadata (the posting date and
tags) in several places throughout this blog. Shortcodes allow me to define the
following snippet in `eleventy.js`:
```js
eleventyConfig.addShortcode("metadata", 
  function(date, tags) {
    let tagMarkup = "";
    for (tag of tags) {
      if (tag != "post") {
        tagMarkup +=
          '<a href="/thoughts/tags/' + 
          tag + '" class="tag">#' + tag + "</a>";
      }
    }

    return `
      <span class="post-metadata">
        Posted on 
        <span class="posted-date">
        <time datetime="${moment(date).toISOString()}">
          ${moment(date).format("LL")}
        </time>
        </span>
        ${tagMarkup}
      </span>`;
});
```

While I'm not entirely sold on the idea of hardcoding part of my markup in some
config file, it does make for easy usage: Anywhere I want to print this
preformatted metadata, I simply drop in a  <code>&lbrace;% metadata date, 
tags %&rbrace;</code>.

## Tweaking the details
The Eleventy core is pretty lean. Because it runs on node.js, all the bells and
whistles it lacks are available to us through countless npm packages. This being
a fairly modest and simply blog, I feel like I've only scratched the surface of
what's possible.
### Syntax highlighting
The de-facto standard for syntax highlighting code blocks is Prism.js. Because
we are pre-rendering everything, we don't have to rely on Prism parsing our
code blocks on the fly on the client side. Instead, we can simply pass it over
all our files during the build step! Little optimizations like this add up and
reduce bundle size and render time. Right now, I am using the 
`eleventy-plugin-syntaxhighlight` package, but I feel like simply using the
Prism.js node package directly would give me more flexibility.
Adding the plugin is as easy as adding:
```js
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

eleventyConfig.addPlugin(syntaxHighlight);
```

### Math rendering with KaTeX
For years, the standard for rendering math online was the Mathjax library.
Despite it being a mammoth of a library, it is used on reputable math sites like
Math Overflow and math.stackexchange. The rendering is fairly slow and
there's many issues with content jumping all over the place as the rendering 
changes the element dimensions. Also, this being a pre-generated site, I wanted
something that could easily be run during the build process. The little 
documentation I found about running MathJax on the serverside made it seem
fairly hacky and quite the effort, so I opted against it. 

A new player on the field is KaTeX, developed by the guys at Kahn University. 
It is far more lean and has an excellent server-side rendering API. What's more,
because we have the entire NPM ecosystem at our service, adding KaTeX support
was as simply as installing the KaTeX plugin for Markdown-it (the default
markdown parser Eleventy uses).
```js
  let markdownIt = require("markdown-it");
  let markdownItKatex = require("markdown-it-katex");
  let options = {
    html: true,
    breaks: false,
    linkify: true
  };

  let markdownLib = markdownIt(options).use(markdownItKatex);
  eleventyConfig.setLibrary("md", markdownLib);
```
And presto! We have math rendering on our blog! Inline math like $e^i\pi = -1$
or $f: A \twoheadrightarrow B$ seems to be working fine without messing up the
line height too much. Block level math is also pretty straightforward. Nothing
holding me back from calculating some complex integrals the Cauchy way: 
$$\oint_\gamma f(z)\,dz = 2\pi i\sum_i\mathrm{Res}(f, a_i).$$

### Static assets
I tend to keep a directory in my file hierarchy for static assets (ie. css, 
javascript files and images) that don't need to be processed by eleventy. 
Eleventy comes with a built-in function that copies folders to the production
directory wholesale. Unfortunately, globs are not yet allowed, so each directory
that is to be copied must be listed explicitely.
```js
eleventyConfig.addPassthroughCopy("src/assets/css");
eleventyConfig.addPassthroughCopy("src/assets/js");
eleventyConfig.addPassthroughCopy("src/assets/images");
```

## Concluding thoughts
There's much more to be said still on what's possible using Eleventy's 
lightweight but flexible architecture, but I'll keep it at this. Setting
everything up was a breeze, despite the sometimes lacking documentation. 
Eleventy as an SSG has garnered so much attention in the last year that there
is no lack of blog posts on how to set up the finer details. Of course, this is
only the start, and I can't wait to see how much more can be customized. 
