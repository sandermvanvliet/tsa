# TypeScript Analyzer (tsa)
This is the analysis tool used by the [sonar-typescript-plugin](https://github.com/sandermvanvliet/sonar-typescript-plugin). 
It uses the TypeScript library to parse source files and provide metrics on code.

## Current status
Every commit to tsa (master branch) triggers an analysis on the official [TypeScript](https://github.com/microsoft/TypeScript/) sources. Note that also whenever [sonar-typescript-plugin](http://github.com/sandermvanvliet/sonar-typescript-plugin) changes a new analysis is triggered. Latest analysis results can be found [here](http://sonar.codenizer.nl:9000/overview?id=1)

## Suggestions and contributions
I'm open to pull requests and suggestions. If you feel something is missing, please let me know and open a new issue. If you just want to say hi that's fine too ;-)

### Author
This plugin has been created by Sander van Vliet ([@Codenizer](https://twitter.com/Codenizer) on Twitter and [sandermvanvliet](https://github.com/sandermvanvliet) on GitHub).

### Tools used
Sonar TypeScript plugin is built with:

* Visual Studio Code
* Grunt
* VIM
* A bunch of shell scripts to do simple CI