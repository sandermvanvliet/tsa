#!/usr/bin/env node

var fs = require("fs");
var glob = require("glob");
var ts = require("typescript");
var tsa = require("../lib/Analyzer");
var o = require("../lib/JsonOutput");

var arg = process.argv.slice(2)[0];
const fileNames = glob(arg, {}, function(err, files) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    
    const outputFileName = "ts-analysis-results.json";
    
    var outputter = new o.Output.JsonOutput(outputFileName);
    var analyzer = new tsa.SonarTypeScript.Analyzer(outputter);
    
    if(fs.existsSync(outputFileName)) {
        fs.unlinkSync(outputFileName);
    }
    
    files.forEach(fileName => {
        console.log("Parsing: " + fileName);

        var sourceFile = ts.createSourceFile(
            fileName, 
            fs.readFileSync(fileName).toString(), 
            ts.ScriptTarget.ES6, 
            /*setParentNodes */ true);

        analyzer.analyzeFile(sourceFile);
    });
    
    outputter.close(function(err) {
        if(err === null) {
            process.exit(0);  
        } else {
            console.error(err);
            process.exit(1);
        }
    });
});