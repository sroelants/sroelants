---
section: blog
title: "A monad a month: the Reader monad"
author: Sam Roelants
layout: post.njk
tags:
  - draft 
  - monad 
  - reader
  - haskell
  - functional programming
description: "The first installment in a series of posts discussing common
monads as you might encounter them in functional languages like Scala and
Haskell. Today, we're starting off with the Reader monad."
---

# Introduction
I know, *I know*, the last thing the internet needs is another blog post
pretending to do a good job at explaining what a monad is. Still, the Haskell
universe is teeming with monad instances that I've long felt confused or unsure
about. So I thought I'd document my deep dives into coming to grips with some of
the more common ones. Most people starting out with Haskell quickly grow
familiar with the more mundane monads like `List`, `Maybe` and ever `IO`, but
there are many more powerful and far less obvious monads to be explored! Expect
to see some of the classics: Reader, Writer, State, and all their friends.

I thought I'd start off with the Reader monad, since it is usually placed first
in the chain of Reader - Writer - State monads. The Reader monad is a toughy,
because, in contrast to lists and optional values, it has a rather
non-transparent definition as to what it's purpose is. If we look at it's type 
declaration in the standard library, we find:

```haskell
type Reader r = ReaderT r Identity 

-- The parameterizable reader monad.

-- Computations are functions of a shared environment.

-- The return function ignores the environment, while 
-- >>= passes the inherited environment to both 
-- subcomputations.
```
I don't know about you, but it took me a while to figure out how exactly this
type definition helps me perform computations using a shared environment. It's
especially daunting for beginning Haskellers like myself to have to understand
Monad Transformers just in order to understand what appears to be one of the
most basic monad instances.

Another definition that often pops up is the following:
```haskell
newtype Reader e a = Reader { runReader :: (e -> a) }

instance Monad (Reader e) where 
    return a         = Reader $ \e -> a 
    (Reader r) >>= f = Reader $ \e -> runReader (f (r e)) e
```

Okay, this is slightly less daunting (there's no monad transformers in sight,
for one), and from the definition, it looks like the Reader monad isn't much
more than a wrapper around a function with signature `e -> a`.
Looking at this definition, it becomes more clear how the Reader monad 
might encode *computation*. The definition of the bind operator (`>>=`) looks
atrocious, though, and will need some parsing as we move along.

Let's try and frame the problem the Reader is trying to solve, and see if we can
work our way back to the opaque definition we started off with.

# Motivation
The use case the Reader monad is designed to handle, according to the
documentation above, is "computations that are functions of a shared
environment". One everyday example of this is functionality
that makes use of a set of *environment variables* that several functions in the
program should read from. Or perhaps we make use of a different set of
'development' and 'production' options in the same project. Or maybe we have a
database handle that we want to share among several functions. The common
denominator in all these scenarios is that we have a (read-only) resource that
several parts of the program should have access to. 

Despite Haskell enforcing
immutability across the board, it's still pretty bad practice to just have these
shared resources defined globally at the top level. A much more palatable
solution to this problem is *dependency injection*. The idea of dependency
injection is to pass all the information a function needs along as extra
arguments, so the function is a self-contained, pure unit. This way, the
function doesn't have to access any top-level globals, and our function becomes
much easier to reason about.
[Wikipedia](https://en.wikipedia.org/wiki/Dependency_injection#Without_dependency_injection)
puts it best:
> Dependency injection separates the creation of a client's 
> dependencies from the client's behavior, which allows program
> designs to be loosely coupled.

In an object oriented context, this is often implemented by passing objects
wrapping the dependencies to objects that require these dependencies. In a
functional world, our job is typically much simpler. We'll simply be passing 
data to functions. In the next section, we'll try and implement this idea, and
see if we can come up with the Reader monad.

# Implementing dependency injection
Suppose we have a function `f :: a -> b` that we want to refactor so that it 
takes some extra dependencies that alter its behavior. We'll assume these
dependencies have some generic type `e` for now, so the type signature of `f` 
becomes `f::e -> a -> b` 
Being an automatically curried language, Haskell gives us two interchangeable 
ways of thinking of this: `f` is a function that takes some environment
variables of type `e` and a value of type `a` and returns a type `b`, or it 
simply takes an environment of type `e` and returns us our function `a -> b`
with its behavior fixed by the environment. It's simply a closure encapsulating
our environment variables. 

Now, in a functional programming context where much 
of our logic consists of long chains of composed function, this approach
quickly becomes problematic. Suppose we have another function `g:: e -> b -> c`
that also depends on the same environment, and we want to _compose_ `f` and
`g`. We could curry `g` with the same environment, and compose `f` with the
curried function `g e`:
```haskell
h :: e -> a -> c
h = (g e) . f 
```

But this defeats the entire idea of the dependency injection we were trying
to achieve! We're back to having to pass the environment manually to every piece
of the computation along the way.



