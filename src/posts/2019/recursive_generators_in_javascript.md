---
section: blog
title: "Recursive generators in javascript" author: Sam Roelants
layout: post.njk
tags:
  - post 
  - javascript
  - generators
  - recursion
description: "ES6 finally brought iterators and generators to javascript. 
Recently, I found out how you can nest generators to implement lazy recursion."
---

# Introduction
If you've ever programmed in Python, chances are you're familiar with
generators. They're somewhat of a bread-and-butter construct in Python that
allow you to compute a list *lazily*, that is: elements are only computed when
explicitely asked for. While they do come with a slight overhead compared to
regular small lists, they are far superior for handling very large amounts of
elements. A regular list or array will always store all of its elements in
memory at once. For large amounts of data, this boils down to large amounts of
memory. With generators, however, we *don't need* to store the entire list in
memory at once, we simply generate the values on the fly.

This allows for a couple of really cool tricks. How about an infinite list?
Clearly, you could never store a list of, say, all the positive integers, in
your computer's memory because you'd need infinite memory! But, we can represent
the list of all positive integers as a *generator*. Every time you ask it for
a value, it simply gives us the next integer. Of course, you should be careful
never to perform an operation on the *entire* list (like, for example, looping
over it), because that will cause all the elements of the generator to get
calculated, which would never terminate!  So what does this look like in javascript? ES6 has introduced a special syntax
for defining generators that comes in two parts: `function*` and `yield`.
Consider the following generator that provides us with the members of
a particular rock band:

```javascript
function* beatles() {
  yield "John";
  yield "Paul";
  yield "George";
  yield "Ringo";
}
```

The keyword `function*` signifies that we're not defining a regular function,
but a *generator*. {% sidenote %} Strictly speaking, the `*` needn't be attached to the keyword `function`. The implementation allows for `function* beatles()`, `function * beatles()` and `function *beatles()`. The consensus is, however, that it makes semantic sense to group the `*` with the function keyword, since `function *beatles()` would seem to imply we're defining a *function* named `*beatles()`.{% endsidenote %} The `yield` keyword represents the values that this generator will produce when we ask for them. Briefly said, a generator will execute its body until it comes across a `yield` statement, produce the corresponding value, and *pause* until further values are requested. If we then ask for the next value, the generator will simply *continue* the execution where it left off, complete with scoped variables and stack frame! How cool is that?

But *how* do we ask for these values, you ask? We have an additional bit of
syntax for getting values out of generators, the `next()` method. Calling
`next()` on our `beatles` generator repeteadly will return:

```javascript
let bgen = beatles(); // Instantiate a beatles generator

bgen.next(); // {value: "John", done: false}
bgen.next(); // {value: "Paul", done: false}
bgen.next(); // {value: "George", done: false}
bgen.next(); // {value: "Ringo", done: false}
```

Okay, that's pretty cool. calling `next()` on a generator returns an object with
a `value` field, which is what we're interested in, and an additional bit of
metadata informing us whether or not the generator has yielded all its values
yet. If we called `next()` a fifth time, we would get

```javascript
bgen.next() // {done: true}
```

When we've exhausted a generator, it will stop producing values and simply
return this object with a single field informing us we've used up the generator.
If we really want the generator to return a final value when it is exhausted, we
can use a final `return` instead of `yield` statement:
```javascript
function* beatles() {
  yield "John";
  yield "Paul";
  yield "George";
  return "Ringo";
}

let bgen = beatles(); // Instantiate a beatles generator

bgen.next(); // {value: "John", done: false}
bgen.next(); // {value: "Paul", done: false}
bgen.next(); // {value: "George", done: false}
bgen.next(); // {value: "Ringo", done: true}
```

Now that you know how generators work, maybe it'll feel less surprising that you
can use them to implement infinite lists. Let's have a look at how we could
define our infinite integer generator:
```javascript
function* integers() {
  let i = 0;
  while(true) {
    yield i++;
  }
}
```

We can generate a couple of values to check whether we got it right:

```javascript
let igen = integers();

igen.next(); // {value: 0, done: false}
igen.next(); // {value: 1, done: false}
igen.next(); // {value: 2, done: false}
igen.next(); // {value: 3, done: false}
```

This generator is an infinite loop that yields our counter `i` and immediately
pauses. As soon as we resume the execution, the `++` part is evaluated {%
sidenote%} Recall that `i++` evaluates to the value of `i`, and after evaluation
increments its value by one. {% endsidenote %}, our
counter gets incremented, and the loop is resumed only to hit the next `yield`
statement. All the scoped variables are saved and restored when execution
resumes.

Okay, now that we have the basics of javascript generators down, let's take it
up a notch with nested generators!

# Nested generators and recursion
Along with the `yield` keyword, javascript provides us with a second keyword
`yield*` that allows us to defer to *another* generator. When a generator comes
across `yield*`, it will descend into the second generator, pausing and resuming
like always when it comes across a `yield` in this second generator`s body
execution. Let's clarify this with an example:

```javascript
function* lotr() {
  yield "The Fellowship of the Ring";
  yield "The Two Towers";
  yield "The Return of the King";
}

function* tolkienCanon() {
  yield "The Hobbit";
  yield* lotr();
  return "The Silmarillion";
}
```

When we poke the tolkienCanon generator for values, it produces "The Hobbit",
then enters the `lotr()` generator until that generator is depleted and returns
back to the original generator body. Let's see it in action:

```javascript
let tcgen = tolkienCanon();

tcgen.next(); // {value: "The Hobbit", done: false}
tcgen.next(); // {value: "The Fellowship of the Ring", done: false}
tcgen.next(); // {value: "The Two Towers", done: false}
tcgen.next(); // {value: "The Return of the King", done: false}
tcgen.next(); // {value: "The Silmarillion", done: true}
```

The `yield*` construct allows us to in part mediate one of the biggest
limitations of javascript's generators: *we can only yield values directly from
within the function body*. That is to say, when we're writing a generator
`foo*()`, we
can't simply refactor out some stuff into its own function `bar()`, and expect
`foo()` to find a `yield` inside `bar()` and pause its execution. Only `foo()`
is a generator, so only its scope can get paused and resumed. `bar()` is
a regular function, so it has no concept of "yielding" values. This means that
generators that implement more complicated logic quickly become rather messy.
But, if `bar()` were a generator, then it *would* have a concept of yielding,
and we could compose it with our generator `foo()`. This is precisely what
`yield*` lets us do.

Of course, this begs the question: *can a generator defer to itself*? It sure
can! Of course, the same care has to be taken as with any recursion: you don't
want to blow the stack. Generators may be lazy, but if you nest them infinitely
deep, your program will still throw an exception before it actually manages to
retrieve a single value. Lets see if we can implement a lazy way of generating
prime numbers.

### A lazy prime generator
A classical way of generating primes is through an algorithm known as
"Eratosthenes' sieve":
1. Start off with a list of all natural numbers (excluding 0 and 1, which are
   not prime by definition).
2. The first number on the list is prime (2).
3. Remove all multiples of two from the list.
4. The first number on the remaining list is prime (3).
5. Repeat.

We can implement this in a pretty straightforward way using generators. To
start, we'll modify the natural numbers generator we defined above to suit our
needs a little better:
```javascript
function* nnumbers(start=0) {
  let i = start;
  while (true) yield i++;
}
```
We can implement the actual prime generator as follows:
```javascript
function* primes(previousPrimes = []) {
  let nng = nnumbers(2); // Discount 0 and 1 by default;

  for (let n of nnumbers) {
    let isPrime = true;
    for (let p of previousPrimes) {
      if (n % p === 0) isPrime = false;
    }
    if (isPrime) {
      yield n;
      yield* primes(previousPrimes.push(n));
    }
  }
}
```
This implementation follows our Eratosthenes algorithm almost to the letter: at
every step, we remove the multiples of all previously encountered primes from
the list of natural numbers (greater or equal to 2). The first element that is
not one of these multiples must be our next prime. We yield it, and restart the
process, now with an extended set of previously encountered primes. Let's see if
it works:
```javascript
let pgen = primes();
for (let i = 0; i < 5; i++) console.log(pgen.next().value);
// 2
// 3
// 5
// 7
// 11
```
Cool. Is it the most efficient way to generate primes? No. Does it get me
feeling all warm and tingly? Absolutely!

# Implementing Quicksort
For another classic, this time slightly more elaborate, I thought I'd implement
everyone's favorite sorting algorithm, Quicksort, using recursive generators.
Quicksort essentially consists of two operations, performed over and over again:
*partitioning* and *sorting*. 

Quicksort:

0. Check if our list contains zero or one elements. If so, we're done. Easy!
1. Pick any element in the list. We'll call it the *pivot*, just so we have
   something to call it.
2. Pass over the list. Every element smaller than our pivot goes to the left of
   it, everything larger to the right. This is the partitioning phase.
3. Perform quicksort on the sublist to the left and right respectively. This is
   the "sorting" phase.

A couple of things to note here. First off: the philosophy behind quicksort is
that in a sorted list we can pick any element, and all elements to the left and
right will be sorted sublists of all elements smaller and larger than that
element, respectively. Notice how I was exaggerating slightly when I said there
was a partitioning phase and a sorting phase: we're deferring the actual sorting
until we hit all but the simplest of cases, a list with a single element. It's
the actual partitioning that's doing all the heavy lifting. 

Implementing this in javascript is actually pretty straightforward: {% sidenote %} For simplicity, we're picking the pivot as the first element of each subarray (ie, at index 0).{% endsidenote %}

```javascript
function partition(array) {
  let less, greater = [], [];

  for (const i = 1; i < array.length, i++) {
    if (array[i] < array[0]) less.push(array[i]);
    else greater.push(array[i]);
  }
  return [less, greater];
}

function quicksort(array) {
  if (array.length <= 1) return array;

  let [less, greater] = partition(array);
  return quicksort(less).concat(array[0], quicksort(greater));
}
```

I thought it would be cool if we could write a generator that will yield single
steps in the quicksort process. That way, we can use it for all kinds of things,
like visualizing it in an animation. That is: we want to make
a `quicksortGenerator()` that will yield the entire array at every intermediate
step. You'll notice that this will require a bit more bookkeeping than in our
elegant recursive implementation above, because in there, the array is getting
processed in independent chunks, with no way to recover the entire array at any
point until all recursive calls return. But let's see if we can't do it anyway!

Because we want to be able to yield the entire array at any point during the 
sort, we'll need to pass around the entire array, along with indices defining
the sub-array we're working on, rather than simply working on progressively 
smaller chunks.

The obvious place to start would be to implement our partitioning logic. That's 
the one that's doing all the work, remember? 

Now, this is where things get
kind of complicated. On the one hand, we want to write something like
a `partitionGenerator()` that we can defer to, that will yield the
intermediate array at every sorting step. But, in our original implementation,
it was `partition()`'s job to provide us with the left and right sub-arrays! We
can't really have both, so the easiest way forward is to simply inline the 
partitioning logic in the quicksort generator directly. That way, the left and 
right sub-arrays will be in scope for all subsequent steps. Let's see what this
looks like.

```javascript
function* quicksortGenerator(array, min=0, max=array.length) {
  // quicksort logic...
  let [pivot, less, greater] = [array[min], [], []];
  for (const i = min + 1; i < max; i++) {
    if (array[i] < pivot) less.push(array[i]);
    else greater.push(array[i]);
    array.splice(min, i - min + 1, ...less.concat(pivot, greater));
    yield array;
  }
  // more quicksort logic...
}
```
That wasn't too bad. We only added a single line where we splice the
intermediate result into the original array and yield it. Notice how we're
given the array in its entirety, alongside the indices delineating the subarray
we're partitioning.

Now that we have the partitioning done, implementing the rest should be
a breeze! Only two things remain to be implemented: the base case when we're
asked to sort an array of a single element, and the recursion where we apply
quicksort on the smaller subarrays.

```javascript
function* quicksortGenerator(array, min=0, max=array.length) {
  if (max - min <= 1) return array; // base case

  // partitioning
  let [pivot, less, greater] = [array[min], [], []];
  for (const i = min + 1; i < max; i++) {
    if (array[i] < pivot) less.push(array[i]);
    else greater.push(array[i]);
    array.splice(min, i - min + 1, ...less.concat(pivot, greater));
    yield array;
  }

  yield* quicksortGenerator(array, min, min + less.length);
  yield* quicksortGenerator(array, min + less.length + 1, max);
}
```
That should do it! Notice how we're sorting the left and right subarrays
sequentially here. This may look different from how we wrote it in the
original implementation (where we recurred on both left and right subarrays in 
one go), but in the end it comes down to the same thing. We recur on the left
array all the way down before ever getting started on the right half.

Let's see it in action!
```javascript
const qsgen = quicksortGenerator([5,2,4,1,3]);
console.log(qsgen.next().value); // [2, 5, 4, 1, 3]
console.log(qsgen.next().value); // [2, 4, 5, 1, 3]
console.log(qsgen.next().value); // [2, 4, 1, 5, 3]
console.log(qsgen.next().value); // [2, 4, 1, 3, 5]
// etc...
```

# Conclusion
Again, is this a remotely efficient way of implementing quick sort? Of course
not. But it does show how far you can push javascript generators. Most people 
get excited about generators 
[when combined with Promises](https://www.promisejs.org/generators/). But I hope
this at least sheds a different light on how versatile they can be.
