---
section: blog
title: Using the IntersectionObserver API with React hooks
author: Sam Roelants
layout: post.njk
date: 2019-10-23
tags:
  - post
  - javascript
  - intersection observer
  - react hooks
description: "Modern browsers ship a web API called IntersectionObserver that
largely obviates the need for inefficient scroll event listeners. Let's use it
to create an infinitely scrolling page using React hooks."
---

Let's be honest: nobody likes browser scroll events. On a single scroll,
hundreds of events get fired, so even the simplest handlers listening for such
events are likely to cause a massive performance hit. Of course, it's possible
to minimize the damage by
[throttling](https://www.afasterweb.com/2017/09/26/performance-basics-throttling/)
or
[debouncing](http://unscriptable.com/2009/03/20/debouncing-javascript-methods/). 
But the fact remains: a mechanism that fires hundreds of events and forces me 
to ignore 95% of those events is a grotesque mechanism. Let's also not forget
that in today's javascript ecosystem, even the most trivial project tends to 
pull in hundreds of dependencies, all of which we have no idea if they took
any of these precautions. 

By far the main use case for scroll event handlers has been to keep track of 
what is currently visible in the viewport. On every scroll event, we 
recalculate the offset between the top of the page and the top of the
viewport and take appropriate action. There are countless possibilities: 

* We can have images lazy load when they are about to come into the viewport 
* We can create an 'infinite scroll' that loads more content as we reach the
    bottom of the page (think Facebook or Twitter)
* Many analytics tools keep track of the proportion of content users scrolled
    through.
* Third party advertisements can keep track of how often their add is actually
    visible.

The main problem here is that all these calculations are running on the main
thread. Redundantly recalculating the page offset a million times per scroll
is effectively blocking javascript from doing any other, useful, work.

Good news, [most modern browsers](https://caniuse.com/#feat=intersectionobserver) now provide a Web API that solves all of the use cases listed above:
Intersection Observer.

## IntersectionObserver

The [MDN article](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) puts it best:

> The Intersection Observer API provides a way to **asynchronously** observe 
> changes in the intersection of a target element with an ancestor element or 
> with a top-level document's viewport.

That sounds exactly like what we want! Moreover, notice that the tracking
happens asynchronously, so we could have dozens of them tracking all kinds of
window offsets without ever blocking the rest of our page.

So what is this magical API and how does it work? Quite simply, you create
an IntersectionObserver instance and feed it both an element to watch and
a callback that needs to fire once said element appears (or "*intersects*") with
the viewport, or any other predefined root element. It
also comes with some extra options to fine tune how and when precisely it 
should run the callback.

```javascript
const root = document.querySelector('#root-element');
const target = document.querySelector('#target-element');
let observer = new IntersectionObserver(callback, {root: root});

observer.observe(target);
```

The code speaks for itself: when constructing our observer, we pass it our 
callback, as well as an object that preconfigures our Observer. We than have the
observer *observe* a second DOM element (asynchronously!) and it will fire off
the callback when the `target` becomes visible within the `root` element. 
Here, the only options we gave the IntersectionObserver is a DOM element that 
will act as  the root element. If we don't supply a root element, it defaults 
to the viewport. Other options specify, for example, *how much* of the target
element should be in view, or define a *margin* around the root element that 
the observer should start treating as intersecting. Again, the full spec (it's
not a very extensive API) is documented 
[here](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).
{% sidenote %}
Though there is a draft pending to extend the API and iron out some of the
kinks. Read more about it 
[here](https://developers.google.com/web/updates/2019/02/intersectionobserver-v2).
{% endsidenote %}

One observer can observe many elements, though the `observe()`
method only takes a single argument. To keep track of several elements, you'll
have to attach the observer one by one:

```javascript
const targets = document.querySelectorAll('.target');
let observer = new IntersectionObserver(callback, {root: root});

targets.forEach((target) => observer.observe(target));
```
Another caveat, that isn't much of a caveat, really, is that only target
elements that are direct descendants of the root element can be observed.

Instead of going over any more of the technical details, let's see how we can 
use this in a real setting by implementing a simple infinite scroll page.

## Implementing an infinite scroll (using React hooks)

Let's have a look at one of the most basic scenarios in which you would need
to keep track of the scroll state of the page: an infinitely scrolling page 
that fetches more content as you reach the end.

As a little demonstration, we'll build a little Wikipedia search app. I'll go
over most of the code here, but you can have a look at the complete source code
[here](https://www.github.com/sroelants/intersection_observer_demo), 
if that's your thing. You can see the finished product
[here](https://sroelants.github.io/intersection_observer_demo)

I'm partial to Typescript, but if you're not,
feel free to simply ignore all the non-javascript parts, and you should be
okay. Let's get to it!

### Setting things up
The easiest way to get started is to scaffold a new project using 
`create-react-app`, and remove all the cruft we don't need. You should end up
with a blank App component:

```typescript
import React from "react";

const App: React.FC = () => {
  return <h1>Hello</h1> 
};

export default App;
```

Let's start off nice and easy and stub out the JSX we'll be displaying. 
I've separated out some of the UI into separate components to keep things
more organized. Let's flesh out our `App` component:

```typescript
const App: React.FC = () => {

  return (
    <div className="App">
      <header className="header">Wikipedia search</header>
      <Search />
    </div>
  );
};
```

You'll notice the `<Search />` component there. Here's what it roughly looks
like.

```typescript
const Search: React.FC = () => {

  return (
    <div className="search">
      <input type="text" 
        className="search__input"
        placeholder="What do you want to learn about?" />
      <button className="search__button">Search</button>
    </div>
  );
};
```

We'll handle the user input by storing it in local state using the `useState`
hook and rendering the
value of the input field from that. Then, when the user submits the search,
we pass the value onto some event handler we got passed as a prop.

```typescript/0,2-4,6,7,14-16
import React, {useState} from "react";

interface SearchProps {
  handleSubmit: (searchString: string) => void;
}

const Search: React.FC<SearchProps> = ({ handleSubmit }) => {
  const [state, setState] = useState("");

  return (
    <div className="search">
      <input type="text" 
        className="search__input"
        placeholder="What do you want to learn about?"
        onChange={(ev) => {setState(ev.target.value);}}
        value={state} />
      <button className="search__button" onClick={() => handleSubmit(state)}>
        Search
      </button>
    </div>
  );
};
```

We'll be hitting the public Wikipedia API for articles corresponding to a given
search term. Let's define the shape of the data we want to use, as well as an
Article component that we'll be rendering.

```typescript
export interface ArticleData {
  pageid: number
  title: string;
  snippet: string;
}

const Article: React.FC<ArticleData> = ({pageid, title, snippet}) => {
  return (
    <div className="card">
      <a href={"https://en.wikipedia.org/wiki?curid="+pageid}>
        <div className="card__title">
          {title}
        </div>
        <div className="card__snippet" 
             dangerouslySetInnerHTML={ {__html: snippet + "..."} }></div>
      </a>
    </div>
  );
};
```

The data we fetch will consist mostly of a `title`, a `snippet` of the article
and the article's unique `pageid`, which will serve both as a unique key for 
the array of `Article`s we'll create later, as well as for linking back to the
corresponding Wikipedia page.

### Fetching the articles

Let's write that submit handler for the search field, as well as the logic for
fetching articles. Here's what we'll do: the submit handler will store the
search string in `App`'s local state. We can then use an effect hook that will
fetch articles when even the search string changes. Later on, we can flesh out
this effect to also fetch more articles when we hit the bottom of the page to
give us that infinite scrolling we're after. Let's put all that in our App
component:

```typescript
import React, {useState, useState} from "react";

const App: React.FC = () => {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [searchString, setSearchString] = useState("");

  function handleSubmit(str: string): void {
    setSearchString(str);
    setArticles([]); // Reset state when submitting a new search term.
  }

  // Fetching more articles and appending them.
  useEffect(() => {
    if (searchString) {
      fetchArticles(searchString, articles.length)
        .then(newArts => {
          setArticles(articles => [...articles, ...newArts]);
        });
    }
  }, [searchString]);

  return (
    <div className="App">
      <header className="header">Wikipedia search</header>
      <Search handleSubmit={handleSubmit} />
    </div>
  );
}
```

You'll see I added a state variable to store the list of articles we've fetched
so far. In the effect hook, we check if the search string is set (to avoid
polling the API on first render), and fetch articles using the `fetchArticles`
function. `fetchArticles` hits the Wikipedia API and gives us a Promise for 
search results of the search string. We also pass along how many articles
we've already got (`articles.length`) so we don't keep getting the same
results on every query. When the Promise is resolved, we append the new articles
to the ones we already have. 

Let's write that `fetchArticles()` function:

```typescript
function fetchArticles(sstr: string, offset: number): Promise<ArticleData[]> {
  return (fetch('https://en.wikipedia.org/w/api.php?' + 
                `action=query&list=search&srsearch=${sstr}&sroffset=${offset}` + 
                '&format=json&origin=*&srlimit=20')
    .then(result => result.json())
    .then<ArticleData[]>(json => (json as any).query.search)
    .catch<ArticleData[]>((err) => {console.log(err); return [];})
  );
}

```

Cool! Now that we've got our articles from Wikipedia, let's render them. Modify
the JSX that gets rendered by `App` to be
```typescript/4
  return (
    <div className="App">
      <header className="header">Wikipedia search</header>
      <Search handleSubmit={handleSubmit} />
      { articles.map(art => <Article key={art.pageid} {...art} />) }
    </div>
  );

```

### Adding the IntersectionObserver

Now for the part we've been waiting for: let's make this thing fetch more
content dynamically as we scroll to the bottom of the page. We'll write a custom
hook that creates an IntersectionObserver. The IntersectionObserver will
observe a DOM element we pass into the hook as a 
[React ref](https://reactjs.org/docs/refs-and-the-dom.html). We'll simply add 
an empty "sentinel" `<div>` element at the bottom of the article list. As soon 
as it comes into view, we fetch more articles.{% sidenote %}
It would arguably be more elegant to simply observe the last article in the
list. The logistics of having React update correctly whenever we update the
current value of the ref, however, quickly get messy.{% endsidenote %} The 
hook then provides us with a simple boolean that we can subscribe to and
re-render the component when it changes.

```typescript
function useIntersecting(ref: React.Ref<HTMLDivElement>, threshold=0,
  rootMargin="0px") {
  const [intersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
        setIntersecting(entry.isIntersecting)
      ;},
      {rootMargin: rootMargin,
       threshold: threshold });

    if(ref) {
      observer.observe(ref.current);
    }

    // Clean up callback
    return () => observer.unobserve(ref.current);
  }, []);
  return intersecting;
}
```

I still grin at how simple this hook is! We simply run an Effect that sets up
our IntersectionObserver, with some options that get passed in. Then we simply
have it observe the `ref` we pass in, given that it exists. If the observer
triggers, we simply store in a state variable whether the target came *into*
or went *out of* view. 

React's effect hook allows you to return a tear down function that gets run 
before the hook is run again. We use it to uncouple the observer from the target
in order to avoid a scenario where we end up with hundreds of 
IntersectionObservers watching the same DOM element. We also pass an empty
array as a second argument to the Effect hook to make sure it only runs on
first render (in effect making it behave as `componentDidMount`).

Alright, with that in place, let's wrap up any loose ends! We'll subscribe
a variable to our new hook, and create a ref:
```typescript/3,4
const App: React.FC = () => {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [searchString, setSearchString] = useState("");
  const ref: React.Ref<HTMLDivElement> = useRef(null);
  const visible = useIntersecting(ref, 1, "100px");
```

Then we'll wire up the React ref to an invisible `<div>` we append after the
list of articles:

```typescript/5
return (
  <div className="App">
    <header className="header">Wikipedia search</header>
    <Search handleSubmit={handleSubmit} />
    {articles.map(art =><Article key={art.pageid} {...art} />)}
    <div ref={ref} />
  </div>
```

Lastly, we'll have the Effect hook we wrote to fetch more articles also listen
for changes in the `visible` variable by adding it to the array of dependencies
of the Effect hook.

```typescript/0,6
useEffect(() => { if (visible && searchString) {
    fetchArticles(searchString, articles.length)
      .then(newArts => {
        setArticles(articles => [...articles, ...newArts]);
      });
  }
}, [visible, searchString]);
```

Alright, that about wraps up our little demo page! I hope you'll agree that 
was fairly painless. Most of the code we went over went into the business logic, 
the IntersectionObserver itself was almost trivial to implement once the
groundwork was laid.

Let this also be a shout-out to React's new Hooks API,
which drastically simplified the logic, and made our `useIntersecting` hook
super decoupled and reusable.

Again, you can have a look at the final project (with some added styling) 
[here](https://sroelants.github.io/intersection_observer_demo), and the source 
code [is up on
GitHub](https://www.github.com/sroelants/intersection_observer_demo).

### Afterthoughts

Does the IntersectionObserver solve every conceivable use case that you would
use a scroll event for? Of course not. It's kind of awkward to decide whether 
or not a target is coming in or out of view. Especially if , for example, your 
threshold is at, say, 50%: if we cross the 50% mark, the IO API has no way of 
informing which direction the user is scrolling. 

A more severe failing is that
the IntersectionObserver has no way of judging whether a target that is
intersecting is actually visible, or hidden by other content, transforms or 
opacity settings. If it were able to do this, it would be of great help in 
preventing malicious sites from [exploiting external iframes in click-jacking 
attacks](https://github.com/szager-chromium/IntersectionObserver/blob/master/explainer.md).

But, for all other purposes, it serves admirably. Let's all finally, and 
collectively, say farewell to scroll event handlers.
