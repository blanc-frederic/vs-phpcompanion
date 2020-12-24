PHP Companion
=============

This extension allows to easily create new PHP classes, launch tests, add namespace, etc.

Features
--------

* Create PHP class file content
* Read Namespace from composer.json
* Insert namespace for a file
* Add extends PHPUnit TestCase to classes wich names ends by "Test"
* Add command and Keybindings to easily run tests
* Open tests logs in a virtual document

Create new PHP files
--------------------

From explorer, right click on a folder and select "New PHP Class"

... done ! See FAQ to read more about generated namespace

Easily run tests
----------------

Type your code and hit F9 (default keybindings).


Tests will be executed, and results will show in statusbar


Configuration
-------------

Tip : use `File > Preferences > Settings`, and choose `Workspace` to specify a value decicated for current workspace only

```json
// Add "New PHP class" command and menu in explorer menu
"phpcompanion.activate.createPHPFile": true,

// Add "Insert namespace" command and menu for PHP files
"phpcompanion.activate.insertNamespace": true,

// Path to composer.json from workspace rootdir
"phpcompanion.composerJson": "composer.json",

// Specifies default vendor if not found in composer.json
"phpcompanion.vendor": null,

// Auto extends PHPUnit TestCase for generated classes with "Test" suffix
"phpcompanion.detectTestCase": true,

// Add "Run tests" commands and statusbar
"phpcompanion.activate.runTests": true,

// Command line to run tests (ex: "vendor/bin/phpunit", "bin/phpunit" or "phpunit")
"phpcompanion.testsCommand": "vendor/bin/phpunit",

// Arguments for tests command line
"phpcompanion.testsCommandArguments": [
    "--colors=never",
    "--verbose"
]
```

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
