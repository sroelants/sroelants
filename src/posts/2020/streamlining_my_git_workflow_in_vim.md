---
section: blog
title: "Streamlining my git workflow in vim"
author: Sam Roelants
date: 2020-09-10
layout: post.njk
tags:
  - post
  - git
  - vim
  - workflow
description: "I recently discovered that I had only scratched the surface when
it came to git tooling within vim. Here's my attempt at crafting a more polished
experience."
---

# A tale of two editors
For as long as I can remember being on a Linux system, my daily driver for a
text editor has been Vim. But I've always been _bicurious_ when it comes to that
_other_ text editor that incites such loyalty in its users: GNU Emacs. I feel
like both are excellent text editors, albeit with different philosophies. About
once a year, I give Emacs a try (usually a vim-flavored Emacs distribution like
[Spacemacs](https://www.spacemacs.org/) or [Doom Emacs](https://github.com/hlissner/doom-emacs)).

Such was my life for the last couple of weeks. I definitely enjoyed my stay in
Emacs land, but I've discovered that my workflow is so terminal/tmux based that
it quickly becomes frustrating not having my editor fully embedded in that
environment the way it is when I use Vim. Sure, you can run a terminal emulator
in Emacs, but it just feels clunky and even after a couple of weeks, I just
wasn't getting used to it. And so I turned back to Vim.

This last excursion into Emacs, I finally decided to play around with one of
Emacs' oft-touted _killer apps_: [Magit](https://magit.vc/). Magit is a plugin 
that exposes a git interface inside Emacs, similar to Tim Pope's [Fugitive](https://github.com/tpope/vim-fugitive),
but it's often said to blow the latter out of the water. And oh boy, was it a 
delight to work with! If I had to pick one way in which it trumps Fugitive,
hands down, it would be _discoverability_. Magit exposes an incremental,
fully documented, hotkey menu that you can navigate to perform any action you
can think of. I've literally discovered obscure git features I didn't even know
existed by browsing through the menu.

After returning to Vim, I felt like it was time to refine my git workflow to see
if I could create something that would feel as pleasant to me as Magit. I have
no intention to recreate all of Magit, or even a subset of it. I simply want to
create an experience where I can be as effective with as little keystrokes as
I was in Emacs.

# The players
## Fugitive
```vim
Plug 'tpope/vim-fugitive'
```
It should come as no surprise that a big part of any git workflow in Vim will be
supplied by Fugitive. Honestly, only in reading through the documentation in
preparation for this project, I realized how _powerful_ fugitive really is. This
is what I meant when I said magit is so _dicoverable_ compared to fugitive. In
a week of using it, I had already learned and memorized far more features than
I have in years of using fugitive. 

Still, it's hard to understate how very complete fugitive is as a git interface.
This plugin will give us all the essential functionality: checking out branches,
staging and commiting changes, handling merge conflicts, etc...

## Fzf.vim 
```vim
Plug 'junegunn/fzf'
Plug 'junegunn/fzf.vim'
```
Not strictly a git-related plugin, but fzf.vim makes it easy to tap into Fzf, a
powerful fuzzy finder written in Rust. One of the cool things about magit is how
seamlessly it's integrated with the Emacs project managers (Projectile or Ivy).
Want to check out a branch? You immediately get provided a fuzzy finder that you
can use to scan all branches in the project. This is way more streamlined than
fugitive's tab completion. Fzf.vim even comes with a default `:Commits` command
that lets you browse and fuzzy search the repo's commit history.

## Fzf-checkout.vim
```vim
Plug 'stsewd/fzf-checkout.vim'
```
In line with Fzf.vim, this plugin adds a couple of extra hooks that let you
interact with git branches in a Fzf search. Quickly and interactively find,
checkout, create or delete branches, just what I wanted.

## Gitgutter
Not necessarily a big player on the workflow front, but obviously it's a helpful
thing to be able to see at a glance what lines have been added, removed or
edited compared to the index. An added bonus is that gitgutter exposes some 
handy commnads to navigate, stage and unstage hunks within the buffer.

# Keymappings
I decided to group all my vim-related functionality under a common `<leader>g`
prefix. Easy to remember, and easy to avoid conflicts with other keymappings.
A simple `<leader>gg` opens fugitive's main status buffer, similar to magit
(which was incidentally also exposed under `<leader>gg` in Doom Emacs).

```vim
" Open git status buffer
nnoremap <leader>gg :Git<CR>
```

The Fzf-powered Commit and Branch finders are mapped to `<leader>gc` and 
`<leader>gb` respectively.

```vim
" Search and manipulate commit history
nnoremap <leader>gc :Commits<CR>
" Search and manipulate branches
nnoremap <leader>gb :GBranches<CR>
```

A fugitive feature I didn't know existed, but I find myself using constantly,
is the `:Gbrowse` command that opens up
the corresponding file on Github, Gitlab, or wherever your repository is hosted,
in your browser. It even works in visual mode so you can select the lines that
should be highlighted!

```vim
" Open in browser
nnoremap <leader>gB :GBrowse<CR>
" Open visual selection in browser
vnoremap <leader>gB :GBrowse<CR>
```

The one great thing these editor-based git interfaces provide is far more
intuitive and interactive way to stage parts of your files. A quick diff inside
your buffer makes it super easy to double check your changes before commiting,
or even splitting up changes into smaller, more granular commits.

```vim
" Open Diff split
nnoremap <leader>gd :GDiff<CR>
" Stage and unstage hunks
nnoremap <leader>ghs <Plug>(GitGutterStageHunk)
nnoremap <leader>ghu <Plug>(GitGutterUndoHunk)
vnoremap <leader>ghs <Plug>(GitGutterStageHunk)
vnoremap <leader>ghu <Plug>(GitGutterUndoHunk)
```

I keep my configuration files under version control [on github](https://github.com/sroelants/dotfiles/blob/master/.vimrc), if 
you want to check out the rest of my `.vimrc` file.

# Fugitive Cheat sheet
It turns out that a big part of this project of crafting a more complete git 
workflow in vim just came down to discovering and learning all the features in 
fugitive that I was missing. This last section mainly serves as a cheat sheet 
for future me. All the following should be used in the main `:Git` buffer, but
many of the hunk-operations actually work on hunk objects in all fugitive 
buffers. These only scratch the surface of what fugitive provides, but they are
the main commands I use on a day to day basis.

### Documentation
- `g?`: Open the fugitive documentation at the keymapping section.
 
### Staging 
- `s`: Stage a file, hunk or visual selection.
- `u`: Unstage a file, hunk or visual selection.
- `U`: Unstage all files.
- `>`, `<`, `=`: Open, close, or toggle an inline diff.
- `dd`: Open a diffsplit between the working tree and index. Changes can be
  staged using `dp` ("diff put") and `do` ("diff obtain"?).
 
### Navigation
- `o`, `gO`: Open commit or file in split/vertical split, respectively.
 
### Commits
- `cc`: Create a commit.
- `ca`: Amend a commit and edit the commit message.
- `ce`: Amend a commit message without editing the commit message.
- `cw`: Reword the last commit.
- `crc`: Revert the last commit under the cursor
 
### Checkout
- `coo`: Checkout commit under cursor

### Stash
- `czz`: Push changes to stash
- `czw`: Push working tree to stash
- `cza`, `czp`: Apply/pop top-most stashed changes.
- `czA`, `czP`: Apply/pop top-most stashed changes while preserving the index.

### Rebasing
- `ri`: Start an interactive rebase
- `ru`: Rebase against @{upstream}
- `ra`: Abort the current rebase
- `rr`: Continue the current rebase
- `rs`: Skip the current commit and continue.
