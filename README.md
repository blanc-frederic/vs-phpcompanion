PHP Companion
=============

This extension allows to easily create new PHP classes, launch tests, add namespace, etc.

Features
--------

* Create PHP class file content
* Read Namespace from composer.json
* Insert namespace for a file
* Add extends PHPUnit TestCase to classes wich names ends by "Test"
* 

Configuration
-------------

Tip : use `File > Preferences > Settings`, and choose `Workspace` to specify a value decicated for current workspace only

```json
// Path to composer.json from workspace rootdir
"phpcompanion.composerJson": "composer.json",

// Specifies default vendor if not found in composer.json
"phpcompanion.vendor": null,

// Auto extends PHPUnit TestCase for generated classes with "Test" suffix
"phpcompanion.detectTestCase": true,

// Show tests status in statusbar
"phpcompanion.testsStatus": true,



				 {
					"type": "boolean",
					"default": true,
					"description": "Show tests status in statusbar"
				},
				"phpcompanion.testsCommand": {
					"type": "string",
					"default": "vendor/bin/phpunit",
					"description": "Command line to run tests (ex: \"vendor/bin/phpunit\", \"bin/phpunit\" or \"phpunit\")"
				},
				"phpcompanion.testsCommandArguments": {
					"type": "array",
					"default": [
						"--colors=never",
						"--verbose"
					],
					"description": "Arguments for tests command line"
				}
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
