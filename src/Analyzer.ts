/// <reference path="../typings/main.d.ts" />
/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />

import {readFileSync} from "fs";
import * as ts from "typescript";
import d = require("./Domain");
import o = require("./JsonOutput");

export module SonarTypeScript {
    export class Analyzer {
        constructor(private outputter: o.Output.IFileMetricOutput) {
        }
        
        public analyzeFile(sourceFile: ts.SourceFile) {
            var fileMetrics = new d.Domain.FileMetric();
            fileMetrics.FileName = sourceFile.fileName;

            this.analyzeNode(sourceFile, fileMetrics, sourceFile);
            
            this.outputter.writeMetric(fileMetrics);
        }
                    
        private analyzeNode(node: ts.Node, fileMetrics: d.Domain.FileMetric, sourceFile: ts.SourceFile) {
                switch (node.kind) {
                    case ts.SyntaxKind.ModuleDeclaration:
                        fileMetrics.NumberOfModules++;
                        break;
                    case ts.SyntaxKind.InterfaceDeclaration:
                        fileMetrics.NumberOfInterfaces++;
                        break;
                    case ts.SyntaxKind.ClassDeclaration:
                        fileMetrics.NumberOfClasses++;
                        break;
                    case ts.SyntaxKind.MethodDeclaration:
                        fileMetrics.NumberOfMethods++;
                        break;
                    case ts.SyntaxKind.EndOfFileToken:
                        var lineAndChar = sourceFile.getLineAndCharacterOfPosition(node.end);
                        fileMetrics.NumberOfLines = lineAndChar.line + 1;
                        break;
                    case ts.SyntaxKind.NewLineTrivia:
                        if(node.getEnd() - node.getStart() > 0) {
                            fileMetrics.LinesOfCode++;
                        }
                        break;    
                    default:
                        break;
                }

                ts.forEachChild(node, n => this.analyzeNode(n, fileMetrics, sourceFile));
            }
    }
}