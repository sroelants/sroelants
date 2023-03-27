---
title: "Learning Clojure, Quil and Generative Art"
author: Sam Roelants
date: 2019-11-03
layout: "../../layouts/PostLayout.astro"
tags:
  - clojure
  - quil
  - generative art
description: "An exploration into creating graphics with Quil, and getting 
better at Clojure along the way."
---
A couple of months ago, when I took a deep dive into learning Clojure, I found
out about a library called [Quil](http://www.quil.info). It provides bindings
for the popular [Processing](http://www.processing.org) library, a DSL for
generating graphics that runs on the JVM. 

Generative art as a niche is something I hadn't exactly looked into very much, 
so I wasn't aware of what was being done, or what was possible. Ask a hundred
people what they consider generative art to be, andy you'll likely get a
hundred different opinions. The common thread, however, is that at least *some*
component of the artwork is algorithmically generated. Typically, one exploits
the computer's strengths to add to the artwork something that would be hard to
realize otherwise, like true randomness, infinitely repeating patterns or 
a time component that is in principle unbounded in time. Many of these aspects
are also clearly examplified in so-called *generative music*, that uses
algorithms and randomness to generate (typically infinite) pieces of music. An
absolute must-listen is Alex Bainter's [generative.fm](https://generative.fm).


Inspired by a couple of cool examples
and talks, I figured it'd be fun and good practice playing around with Quil for
a bit. Why?
- Getting used to the structure of a typical Clojure project, directory
  structure, namespacing, all that jazz.
- Quil lends itself really well to *REPL driven experimentation*. This is a
  cornerstone of Clojure development, and definitely something I was not used
  to. Playing around with little toy experimentations like this, trying stuff
  out and getting instant feedback are a good habit to get into for any 
  Clojure development.
- Syntax. Honestly, I know it's been stated over and over again, but Lisp 
  syntax is different from what I, or most people for that matter, am used 
  to. More than getting used to the standard library,[^1]
  it's important to just write *a lot* of Clojure expressions. It took me 
  about 30 compile errors to finally start writing `(< a b)` rather than
  `(a < b)`. Muscle memory takes repetition.

In particular, I really enjoyed the talks by 
[Dan Lidral Porter](https://www.youtube.com/watch?v=vLlbEZt-3j0) and 
[Tyler Hobbs](https://www.youtube.com/watch?v=LBpqoj2nOQo). The latter also 
runs an [amazing website](https://tylerxhobbs.com) showcasing some of his art, 
as well as some in-depth commentary on his
process. I thought I'd share some beginner tips on how to get started using
Quil and how to set everything up.

**Disclaimer:** I will refrain from referring to the examples below as "art".
I feel that for it to even remotely qualify as such, there ought to be
a creative and communicative component to the work, which I think is not the 
case. Consider it a guide to creating pretty pictures with code.

## Setting things up
To get us started, I figured I'd run over the examples in Dan Porter's talk 
in a little more detail. Let's start off by having 
[Leiningen](www.leiningen.org) scaffold out a 
new Quil project for us: `lein new quil sierpinski`. (You *are* using 
Leiningen, right?)

This command scaffolds out a simple animation of a moving circle. The actual
code is located in the `src/sierpinski/` subdirectory (or whichever project
name you chose). It defaults to using Quil's `fun-mode` ("functional mode")
middleware. Functional mode essentially means that rather than creating the
animation in an imperative way, where we have a state that we mutate to show
something different on every frame, instead we start with an initial, immutable
state, and define an update function that will produce the new state to be
drawn. This is very much in the MVC vein.

Quil also allows you to generate
simple static grahpics, in which case `fun-mode` becomes obsolete, since we
aren't redrawing anything. 
The functions that the template filled out for us are:
- `setup`: This is run at the start of the rendering, whether it's an
    animation or a static image. Typically this is where you'd set some
    initial parameters like background color, frame rate, and, if we're using
    `fun-mode`, it is expected to return the *initial state* of the animation.
- `update state`: Takes the previous state as an argument and returns an
    updated state. Since we'll be restricting ourselves to static graphics in 
    this article, we won't be using this one.
- `draw-state`: This one takes the state and actually uses the data to generate
    a graphic using Quil's primitives: points, lines, fills, text, etc...
- `defsketch`: Defines a sketch into which we pass all our defined functions,
    along with some metadata like title and canvas size. Running the `defsketch`
    function is what will actually render our image.

## Some simple sketches
### Sierpinski triangle
We'll be generating an image of the Sierpinski fractal. This might not strike
you as particularly exciting, but the way in which we'll obtain it, I think,
is delightful. We'll be picking one algorithm out of a vast family of 
algorithms that generate fractals called the [chaos game](https://en.wikipedia.org/wiki/Chaos_game). The algorithm goes as follows:
1. Start with the three vertices of an equilateral triangle
2. Pick a point at random within the bounds of this triangle
3. Pick one of the three vertices, also at random, and generate a new point 
  from these two that lies exactly halfway between them.
4. Repeat step 3 with this new point, ad infinitum.

That sounds simple enough, and it's not at all clear on first glance why this
would ever yield the Sierpinski triangle.[^2] That's what makes
it all the more delightful. Such an intricate and unexpected result from the
simplest of procedures: keep halving the distance between to points.

What I like, in particular, about this is how naturally it transfers to 
Clojure (or, more general, functional) primitives. Essentially, what we're 
after is a (lazy) infinite sequence that we obtain by iterating the same 
process over and over again. Guess what, there's a function called `iterate`
in the Clojure standard library that does *exactly* that. No for loops, no
mutation, so simple. Let's implement this chaos game!


Starting off, feel free to remove everything that's already in the `core.clj`
file, except for the first couple of lines, where we declare the namespace 
and import Quil. We'll be replacing the rest with our own code. 

The first thing we'll need, is define a function that, given two points,
returns the point that is midway: 
```clojure
(defn middle [[x1 y1] [x2 y2]]
  [(/ (+ x1 x2) 2) (/ (+ y1 y2) 2)])
```

Next, we need to define the three vertices we'll be using. I'll define them a
vector of three points, each point being its own two-component vector. For
good measure, I'll add a scaling factor `s` so we can tweak the size of our final
result.

```clojure
(def vertices
  (let [s 250]
    [[0 (- s)]
     [(* s (q/cos (/ Math/PI 6))) (* s (q/sin (/ Math/PI 6)))]
     [(* s (q/cos (/ (* 5 Math/PI) 6))) (* s (q/sin (/ (* 5 Math/PI) 6)))]]))
```

That's most of the heavy lifting already taken care of! Notice how we're using
the trigonometric functions that Quil provides (`q/sin` and `q/cos`),
as well as the definition of PI from the Java Math library.
Let's create our infinite sequence of points:
```clojure
(def sierpinski
  (let [seed [0 0]
        next #(middle % (rand-nth vertices))]
    (iterate next seed)))
```

That should do it! Take a moment to appreciate how this is a word-for-word 
translation of our algorithm. Start with a seed point (I picked `[0 0]`, and
the next point is obtained by taking the middle of the point and a random
vertex. Iterate that procedure to get the list of points. 
Easy as that, oh how I love declarative languages. 

Let's quickly write up our Quil-specific functions 
(`setup`, `draw` and `defsketch`):

```clojure
(defn setup []
  (q/color-mode :hsb 360 100 100)
  (q/stroke 217 65 71)
  (q/background 60 5 100))

(defn draw []
  (q/with-translation [(/ (q/width) 2) (/ (q/height) 2)]
    (doseq [[x y] (take 50000 sierpinski)]
      (q/point x y))))

(q/defsketch sierpinski
  :title "Sierpinski"
  :setup setup
  :draw draw
  :size [600 600]
  :features [:keep-on-top])
```

Notice how, in the `draw` function, I added a translation. The origin of a 
Quil canvas is typically the upper-left corner, so in order to center the 
sketch, we add a tranlation of half the width and height. `doseq` is a handy 
function for looping over a sequence and performing some side effects based
on each element (in this case, drawing the point to the canvas).
I arbitrarily picked 50000 points to get a close approximation to the actual
Sierpinski fractal.

<img src="/assets/img/2019/sierpinski.png" width="80%" alt="sierpinski"/>

### The de Jong IFS
The procedure we used to generate the Sierpinski triangle is actually one
instance of a more general procedure called an *iterated function system* (IFS).
Simply put, they consist of sequences $x_i$ that are obtained by repeatedly
applying a function to the previous value $x_{i-1}$:
$$ x_i = f (x_{i-1}).$$

Another famous example is the so-called *de Jong IFS*. In this case, the
generating function is slightly more complex than in the Sierpinski case:
For any point $p_i = (x_i,y_i)$, we obtain a new point through the
transformation
$$ 
\begin{aligned}
x_{i+1} &=& \sin \alpha y_i - \cos \beta x_i \\
y_{i+1} &=& \sin \gamma x_i - \cos \delta y_i,
\end{aligned}
$$
where 
$$-\pi \leq \alpha, \beta, \gamma, \delta \lneq \pi$$
For any choice of 
these parameters, we'll get a completely different pattern. Again, Clojure 
lends itself so well to this kind of procedure that implementing it is trivial:
```clojure
(def a 1.4)
(def b -2.3)
(def g 2.4)
(def d -2.1)

(defn dj-gen [[x y]]
  [(- (q/sin (* a y)) (q/cos (* b x)))
   (- (q/sin (* g x)) (q/cos (* d y)))])

(def dj-seq
  (let [x0 (rand)
        y0 (rand)]
    (iterate dj-gen [x0 y0])))
```

We do the exact same thing: define some seed point, in this case a random point
within the unit square $[0,1) \times [0, 1)$, and iteratively apply our de Jong
transformation. I've picked a set of parameters I thought gave a nice picture, 
feel free to play around with them. 
Try it out, I bet you'll be suprised of what cool results you can get out of 
such a simple procedure.

<img src="/assets/img/2019/dejong.png" width="80%" alt="de Jong attractor"/>

## Go explore!
The world is your oyster! With these first steps, there's already an infinity 
of things you could tinker with. Play around with the parameters in the above
examples. What happens if you change the Sierpinski algorithm? What if you 
don't pick the midway point, but some other fraction? What if, instead of
choosing one vertex at random, you pick two and take the average of three 
points instead of two? Play around with the de Jong parameters, see where you
end up. Or maybe implement some other simple IFS systems. Or, see how deep the
rabbit hole goes and start creating your own pretty pictures. It's not hard to
get aesthetically pleasing results!

<img src="/assets/img/2019/lines.png" width="80%" alt="Quil generated image"/>
<img src="/assets/img/2019/rays.png" width="80%" alt="Quil generated image"/>

[^1]: For getting used to the standard library, I can't recommend
  [4clojure](www.4clojure.com) highly enough. After every exercise, make 
  sure to compare with other people to learn about idioms and functions you
  might not have known about.
 
[^2]: though, I suppose, one shouldn't be surprised that, from our starting
condition, we're ending up with something that has a triangular symmetry.

