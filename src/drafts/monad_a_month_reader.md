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
description: ""
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
## A naive idea
Suppose we've decided we want some function `fun :: a -> b` to actually change
its behavior depending on what set of environment variables we choose (say in
the form of a record, whose type we'll simply denote `e`). As a first stab at
it, we could consider refactoring our function `fun` to take in a tuple of our
input and the additional values, `fun :: (a, e) -> b`. That seems to work. It's
a bit of a hack, but it solves the problem. In fact, it works so well, we might
even refactor some more functions in our code base to take in the same
environment variables. If we had another function `fun':: b -> c`, we'll
refactor it to `fun' :: (b, e) -> c`.


