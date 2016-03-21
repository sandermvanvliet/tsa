/// <reference path="../typings/main.d.ts" />
/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />

import {readFileSync} from "fs";
import * as ts from "typescript";
import d = require("./Domain");

export module SonarTypeScript {
    export class Analyzer {
        public analyzeFile(sourceFile: ts.SourceFile) {
            var fileMetrics = new d.Domain.FileMetric();

            console.log(sourceFile);
            analyzeNode(sourceFile);

            function analyzeNode(node: ts.Node) {
                console.log("node kind: " + ts.SyntaxKind[node.kind]);

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
                    default:
                        break;
                }

                ts.forEachChild(node, analyzeNode);
            }
            console.log("File: " + sourceFile.fileName);
            console.log(fileMetrics);

            function report(node: ts.Node, message: string) {
                let { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                console.log(`${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`);
            }
        }
    }
}