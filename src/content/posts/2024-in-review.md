---
title: "2024 in review"
author: Sam Roelants
date: 2025-01-06
draft: true
layout: "../../layouts/PostLayout.astro"
description: A retrospective on another year gone by
tags:
  - life
  - programming
---

With the previous year coming to an end, and the new year kicking off, I've
enjoyed reading some retrospectives of some technical bloggers I enjoy reading.
I make no pretense that my own retrospective would bring similar joy to other
readers, but it seemed like a fun exercise, and it's nice to reflect on another
year gone by.

## Projects

Much of my personal tinkering was spent on [Simbelmyne][simbelmyne].
It's currently sitting at a comfortable 3200 Elo, which is a respectable rating 
for an HCE engine like Simbelmyne. Still, it would be nice to get it to join the
3400 ranks along with Weiss, Integral HCE, and Sirius. I also tentatively
started some work on a chess engine in Zig, in an aspiration to learn some more
Zig. (Funnily enough, Martin from the Stockfish/Ep Discord has already opened
a PR [for adding kindergarten bitboards!](https://github.com/sroelants/zigzwang/pull/1)

Other projects were mostly chess-adjacent:

- [Simbelmyne][simbelmyne]: An HCE chess engine, written in Rust.
- [chess-bench][chess-bench]: A snapshot testing and benchmarking tool that lets
you compare benchmark results between different engines, or different versions
of the same engine.
- [pretty-perft][pretty-perft]: A TUI perft debugger. Imagine if perftree and
webperft had a baby.
- [zigzwang][zigzwang]: Beginnings of a chess utility library in Zig, intended
to be used for my future NNUE chess engine in Zig, if I ever get around to it.
- [loxide][loxide]: A tree-walk interpreter for the [Lox language][lox]. Built
in Rust while following along with [Crafting
Interpreters][crafting-interpreters].

[simbelmyne]: https://github.com/sroelants/simbelmyne
[chess-bench]: https://github.com/sroelants/chess-bench
[pretty-perft]: https://github.com/sroelants/pretty-perft
[zigzwang]: https://github.com/sroelants/zigzwang
[loxide]: https://github.com/sroelants/loxide
[lox]: https://craftinginterpreters.com/the-lox-language.html
[crafting-interpreters]: https://craftinginterpreters.com

## Programming languages

### Rust

I think this was the year I _really_ started feeling productive in Rust.
Simbelmyne has probably become the biggest project I've ever tinkered on, and 
definitely the longest I've spent on a single bit of software. It's forced me
to learn a bunch more about CPU architecture, memory architecture, and
parallelism, and has probably been the single most rewarding thing I've worked
on in a long while. 

All the complaints about Rust being a huge language with a heavy-duty type
system are completely true. That being said, though, the language just _clicks_
for me, in a way that I haven't experienced since I was playing around with
Haskell. There's something about that specific incarnation of algebraic data
types with type classes (or traits) that just feels natural and expressive.

I feel comfortable enough in the language that it has become my go-to for most
of my other hobby projects, whether it's simple cli tools, or full-blown 
interpreters.

### Zig

Played around a bit with Zig. I think I need some more hands-on time with the 
language before I form any strong opinions, but for now, I remain ambivalent.

Some things feel really cool, some things feel very... worrying. Will try and
write down more coherent thoughts when I get around to that.

### Wasm
This was the year I finally dug a little deeper into WebAssembly. Part of that
was de-mystifying all off the different moving parts, the somewhat vague 
toolchain, and finally figuring out what exactly this WASI thing is, _really_.
(tldr: WASI is a specification of functions that are provided by the "platform",
like disk IO, network IO, etc... It's what POSIX is for C programs, but for
the WASM virtual machine).

Also had a blast [writing a bunch of WASM by hand][wasm-challenges], which 
really helped solidify how the interop between wasm and javascript works, how
the memory gets passed around, etc.

### Gleam
The last language I played around with was Gleam, during Advent of Code. All in 
all, I was pleasantly surprised (although I had a feeling I would be).
I've heard many people cry for a language with a Go-like commitment to
simplicity, without giving up on the expressive type systems that people have
become so used to from languages like Rust, ML, and Zig. I feel like Gleam
_very_ cleanly fills that niche. Being backed by the Erlang virtual machine, 
it also neatly fills Go's niche of a _simple_ garbage collected language that
also makes it easy to write highly concurrent programs.


[wasm-challenges]: https://github.com/danprince/wasm-challenges

## Non-technical stuff

I started the year off in Leonidio, Greece. I spent most of the winter down
there, climbing, and was pleasantly surprised. The climbing is excellent, as
were the people, the food, and the friends I made along the way! The rest of 
the year followed my usual pattern: Sport climbing in Spain for the winter,
spend time with friends in Chamonix for the summer, and back to Spain for the
autumn. Not having an appartment back home means that I'm semi-forced to spend 
the winter in the van somewhere south.

## Books

I read shamefully few books in 2024. I have tried to compensate by consuming
more books in audiobook form while going for walks, running, or making driving.

- [The Three-body problem][3bp]
- [Circe][circe]
- [Crafting Interpreters][crafting-interpreters]
- Stormlight Archive

[3bp]: ../books/three-body-problem
[circe]: ../books/circe

## Smaller points

- Played around with [Jujutsu][jj] after all the hype. Liked the tool a lot, but
  I don't think I can use a VCS without a magit-like integration in my editor.
- Played a game called [Sanabi][sanabi]. It's a short cyberpunk platformer in 
  the vein of Celeste. Insane amount of polish for such a small studio game: 
  amazing soundtrack, incredible pixel art set pieces, and _such_. _satisfying_.
  gameplay. Loved every second of it.
- Learned how to juggle [the Box][box], which is something I've wanted to be
  able to do since first seeing the trick. Found it surprisingly harder than 
  other "intermediate" juggling tricks like Mill's Mess or the Factory.

[jj]: https://jj-vcs.github.io/jj/latest
[sanabi]: https://store.steampowered.com/app/1562700/SANABI/
[box]: https://www.youtube.com/watch?v=dMLUv9wLxG4
