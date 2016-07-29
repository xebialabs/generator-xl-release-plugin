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


## Docker

* Advantage: no local install of yeoman or node needed. And you can easily release a new version by sending it to docker hub.
* How to use
  * Run `docker build -t xebialabs/generator-xlr-plugin .` to install the image local (not needed if we push this to Docker hub).
  * Go to the directory you want to run the generator for (for example `/tmp/xlr-something-plugin`)
  * Run `docker run -v /tmp/xlr-something:/data -i -t xebialabs/generator-xlr-plugin` to create a new plugin.
  * Run `docker run -v /tmp/xlr-something:/data -i -t xebialabs/generator-xlr-plugin xl-release-plugin:task` to create a new task.
  * Run `docker run -v /tmp/xlr-something:/data -i -t xebialabs/generator-xlr-plugin xl-release-plugin:tile` to create a new tile.
* Issues: 
  * It still needs to download a lot of stuff, so that might be added to the image in advance. 
  * Also `node_modules` gets installed in that directory. Not sure if that is what is expected.

## Notes

* When using Jython if you receive an `ImportError: no module named` message, make sure your modules are not inside a package named `test`

## Development

You can run test of this generator using `npm test`.

## Feedback

If you find any issues with the `generator-xl-release-plugin`, please create a [GitHub issue](https://github.com/xebialabs/generator-xl-release-plugin/issues).
