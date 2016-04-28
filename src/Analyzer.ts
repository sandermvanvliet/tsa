/// <reference path="../typings/main.d.ts" />
/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />

import {readFileSync} from "fs";
import * as ts from "typescript";
import d = require("./Domain");
import o = require("./JsonOutput");

export module SonarTypeScript {
    export class Analyzer {
        private scanner = ts.createScanner(ts.ScriptTarget.ES5, /*skipTrivia*/ false);

        constructor(private outputter: o.Output.IFileMetricOutput) {
        }

        public analyzeFile(sourceFile: ts.SourceFile) {
            var fileMetrics = new d.Domain.FileMetric();
            fileMetrics.FileName = sourceFile.fileName;

            this.initializeState(sourceFile.getFullText());
            this.scanFile(sourceFile, fileMetrics);
            
            this.parseFile(sourceFile, fileMetrics);

            this.outputter.writeMetric(fileMetrics);
        }

        private scanFile(sourceFile: ts.SourceFile, metrics: d.Domain.FileMetric) {
            var token = this.scanner.scan();
            while (token != ts.SyntaxKind.EndOfFileToken) {
                this.updateMetricFor(<ts.SyntaxKind>token, metrics, this.scanner.getTokenText());
                token = this.scanner.scan();
            }
        }
        
        private parseFile(node: ts.Node, metrics: d.Domain.FileMetric) {
            this.updateMetricFor(node.kind, metrics, node.getText());
            node.getChildren().forEach(child => this.parseFile(child, metrics));
            
        }

        private initializeState(text: string): void {
            this.scanner.setText(text);
            this.scanner.setOnError((message: ts.DiagnosticMessage, length: number) => {
                console.error(message);
                process.exit(1);
            });
            this.scanner.setScriptTarget(ts.ScriptTarget.ES5);
            this.scanner.setLanguageVariant(ts.LanguageVariant.Standard);
        }

        private prevTokenKind: ts.SyntaxKind;
        private onlyWhitespaceSinceLastNewLine: boolean = true;

        private updateMetricFor(kind: ts.SyntaxKind, fileMetrics: d.Domain.FileMetric, tokenText: string) {
            switch (kind) {
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
                case ts.SyntaxKind.FunctionDeclaration:
                    fileMetrics.NumberOfMethods++;
                    break;
                case ts.SyntaxKind.SingleLineCommentTrivia:
                    fileMetrics.LinesOfComments++;
                    break;
                case ts.SyntaxKind.MultiLineCommentTrivia:
                    var numberOfLinesInComment = tokenText.split("\n").length;
                    
                    // The scanner treats a multiline comment as one token and ignores NewLineTrivia inside it
                    // we need to manually detect newlines and increment the lines of comments and the 
                    // number of lines metrics with the number of lines found in the multiline comment
                    fileMetrics.LinesOfComments += numberOfLinesInComment;
                    
                    // Note: subtract 1 because the NewLineTrivia is counted in the next token
                    fileMetrics.LinesOfCode += numberOfLinesInComment - 1; 
                    break;
                case ts.SyntaxKind.NewLineTrivia:
                    fileMetrics.LinesOfCode++;

                    if (this.onlyWhitespaceSinceLastNewLine) {
                        fileMetrics.LinesOfCode--;
                    }

                    // Reset whitespace test
                    this.onlyWhitespaceSinceLastNewLine = true;

                    break;
                default:
                    break;
            }

            this.prevTokenKind = kind;

            if (kind != ts.SyntaxKind.WhitespaceTrivia && kind != ts.SyntaxKind.NewLineTrivia) {
                this.onlyWhitespaceSinceLastNewLine = false;
            }
        }
    }
}