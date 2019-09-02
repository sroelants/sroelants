Introduction
============

Monad a month idea, why? Reader monad, fairly obtuse. Especially the
standard library implementation. Work our way up to it slowly. (Reader
type \<-\> MonadReader typeCLASS)

Motivation
==========

Dependency injection: environment variables, database socket, any kind
of read-only resource used throughout several functions.

Implementing dependency injection
=================================

A naive idea
------------

Simply wrap all our function to take a tuple, and pass in a resource
along with the other inputs. This becomes tedious really quickly when we
want to start composing things. I suppose we could implement this as a
monad as well.

A more functional way of looking at things
------------------------------------------

Instead of tuples, we can implement the Reader as partially applied
functions. This way we don\'t have to pass in our environment along with
the inputs at the same time. Essentially, we\'re storing all our logic
in closures that are to be passed the resources later.

The closure monad?
------------------

Look at how composing several monadic operations is really just a
chaining of closures. Maybe look at a way to implement this in
javascript, or maybe write out a little python example of what this
would look like.

Monad transformers.
-------------------

Database handling, web resources, file handles, etc etc... Give the full
definition of the Reader monad.

Conclusion
==========
