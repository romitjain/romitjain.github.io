# AGENTS.md

This is a jekyll website hosted on github.

## Post validations

Every `.md` file inside `_posts` folder is an individual post. Each file has teh following structure:

1. Nomenclature: `<YYYY-MM-DD>-<Topic>.md`
2. Front matter:

```md
---
layout: post
title: <Title of the post>>
category: [<Comma separated tags>]
date: <Date of the post>
---
```

## Obsidian integration

I open my `_posts` folder using Obsidian. So I have to keep some of the functionality of Obsidian in sync with this website, namely

1. Assets are stored under `assets` folder
2. Backlinks in Obsidian should work natively on the website. (`[[]]`) should redirect to the correct location
3. Markdownlinting should pass. I use `markdownlin` as a VSCode extensionf or markdown validation
