## Yeoman generator for XL Release plugins

This document describes the basics of the Yeoman generator for XL Release plugins.

## Prerequisites

 To be able to use Yeoman you need to install Node.js : http://nodejs.org/download/. Please make sure the version of Node.js is 5.3.0 or higher.
 
 And then install Yeoman with:
 
 `npm install -g yo`
 
 After Yeoman has been installed you need to make our generator discoverable by Yeoman. Position yourself into `generator-xl-release-plugin` and run:
 
 `npm link`
 
## Generating a new plugin

Position yourself into an empty folder, then run:

`yo xl-release-plugin`

You will be asked a series of questions regarding your new plugin:

* `? Your plugin name`
* `? Default namespace`
* `? Generate additional extensions XMLs?`
* `? Which test frameworks to use?`

After answering all questions a basic plugin will be created. 

Depending on the features previously selected the newly generated plugin may or may not contain the following test frameworks:

* karma  
* unittest (Jython)

## Generating a new task

Position yourself into a previously generated plugin folder, then run:

`yo xl-release-plugin:task`

You will be asked a series of questions regarding your new task:

* `? Task name`
* `? Task namespace`

After answering all questions a basic file / folder structure will be created.

## Generating a new tile

Position yourself into a previously generated plugin folder, then run:

`yo xl-release-plugin:tile`

You will be asked a series of questions regarding your new task:

* `? Your tile name`
* `? Tile namespace`
* `? Tile label`
* `? Add details view?`

After answering all questions a basic file / folder structure will be created.

## Gradle Plugin for XL Release

This project uses [Gradle Plugin for XL Release](https://github.com/xebialabs/gradle-xl-release-plugin-plugin). Configuration and usage details can be found at the projects repo [readme](https://github.com/xebialabs/gradle-xl-release-plugin-plugin/blob/master/README.md).

## Notes

* When using Jython if you receive an `ImportError: no module named` message, make sure your modules are not inside a package named `test`

## Development

You can run test of this generator using `npm test`.

## Feedback

If you find any issues with the `generator-xl-release-plugin`, please create a [GitHub issue](https://github.com/xebialabs/generator-xl-release-plugin/issues).