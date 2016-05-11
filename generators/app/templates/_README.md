# <%= pluginName %>

This project was generated using [XL Release Plugin Generator](https://github.com/xebialabs/generator-xl-release-plugin).

## Setup

Before you can use this plugin, you must install and configure the following dependencies on your machine:

1. [Node.js](https://nodejs.org/en/): Dependening on your system, you can install Node either from source or as a pre-prepackaged bundle. After installing Node, you should install [Yeoman][] using:

    npm install -g yo

2. [XL Release](https://xebialabs.com/products/xl-release/): A local distribution of XL Release should be available on you system. An accompanying valid licence should also available.

3. [Gradle](http://gradle.org/): This project uses the [Gradle Plugins for XL Release](https://github.com/xebialabs/gradle-xl-release-plugin-plugin) for development. For the plugin to work you have to configure the following properties (they can be set either in your global gradle.properties or a local gradle.properties located in the root of the plugin):

    xlReleaseHome - the location of the XL Release distribution
    xlReleaseLicence - the location of the XL Release licence 


## Development

To start the XL Release distribution run:

    ./gradlew startXlRelease

To stop the XL Release distribution run:

    ./gradlew stopXlRelease

### Generating a new task

Position yourself into a previously generated plugin folder, then run:

`yo xl-release-plugin:task`

You will be asked a series of questions regarding your new task:

* `? Task name`
* `? Tile namespace`

After answering all questions a basic file / folder structure will be created.

### Generating a new tile

Position yourself into a previously generated plugin folder, then run:

`yo xl-release-plugin:tile`

You will be asked a series of questions regarding your new task:

* `? Your tile name`
* `? Tile namespace`
* `? Tile label`
* `? Add details view?`

After answering all questions a basic file / folder structure will be created.

## Testing

Front end unit tests are run by [Karma](https://karma-runner.github.io) and written with [Jasmine](http://jasmine.github.io/). They are located in `<%= jsUnitTestDir %>` and can be run with:

    npm test or ./gradlew testJavaScript

Jython tests by default use [unittest](https://docs.python.org/2.7/library/unittest.html). They are located `<%= jythonUnitTestDir %>` and can be run with:

    ./gradlew testJython