#!/usr/bin/env node

var fs = require("fs");
var glob = require("glob");
var ts = require("typescript");
var tsa = require("../lib/Analyzer");

var arg = process.argv.slice(2)[0];
const fileNames = glob(arg, {}, function(err, files) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    var analyzer = new tsa.SonarTypeScript.Analyzer();
    
    files.forEach(fileName => {
        console.log("Parsing: " + fileName);

        var sourceFile = ts.createSourceFile(
            fileName, 
            fs.readFileSync(fileName).toString(), 
            ts.ScriptTarget.ES6, 
            /*setParentNodes */ true);

        analyzer.analyzeFile(sourceFile);
    });
});