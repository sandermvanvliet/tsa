#!/usr/bin/env node

var tsa = require("../lib/Analyzer");
var glob = require("glob");
var ts = require("typescript")
var fs = require("fs");

var arg = process.argv.slice(2)[0];
const fileNames = glob(arg, {}, function(err, files) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    var analyzer = new tsa.SonarTypeScript.Analyzer();
    
    files.forEach(fileName => {
        console.log("Parsing: " + fileName);

        // Parse a file
        var sourceFile = ts.createSourceFile(fileName, fs.readFileSync(fileName).toString(), ts.ScriptTarget.ES6, /*setParentNodes */ true);

        // delint it
        analyzer.analyzeFile(sourceFile);
    });
});