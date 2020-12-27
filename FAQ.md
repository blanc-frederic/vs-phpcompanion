PHP Companion
=============

FAQ
---

> How does it detects namespace ?

First, it search for a vendor prefix (stop as soon as one matches) :

1. compare relative filename (from workspace) with composer entries from `autoload/psr-4`
2. compare relative filename (from workspace) with composer entries from `autoload-dev/psr-4`
3. phpcompanion.vendor (if set)

Then, append relative path (from workspace root folder) :

- if vendor prefix was extracted from composer, exclude corresponding path prefix from composer
- else if path starts with `src/` or `tests/`, exclude this prefix from path
- else if `phpcompanion.vendor` is set and path starts with `app/`, exclude this prefix from path

> Why no "new PHP Trait" or "new PHP Interface" ?

It was in the first release, but it made the contextual menu and the commands bigger, whereas you just have to change the keyword "class" by "trait" or "interface".
