/// <reference path="../typings/main.d.ts" />
/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />

import {readFileSync} from "fs";
import * as ts from "typescript";
import * as fs from "fs";
import d = require("./Domain");
import o = require("./JsonOutput");
import * as Linter from "tslint";
import {findConfiguration} from "tslint";

export module SonarTypeScript {
    export class Analyzer {
        private scanner = ts.createScanner(ts.ScriptTarget.ES5, /*skipTrivia*/ false);

        constructor(private outputter: o.Output.IFileMetricOutput) {
        }

        public analyzeFile(sourceFile: ts.SourceFile) {
            var fileMetrics = new d.Domain.FileMetric();
            fileMetrics.FileName = sourceFile.fileName;
            
            const contents = fs.readFileSync(fileMetrics.FileName, "utf8");

            this.initializeState(contents);
            this.scanFile(fileMetrics);

            this.parseFile(sourceFile, fileMetrics);

            this.lintFile(sourceFile, fileMetrics, contents);

            this.outputter.writeMetric(fileMetrics);
        }

        private scanFile(metrics: d.Domain.FileMetric) {
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

        private lintFile(node: ts.Node, metrics: d.Domain.FileMetric, contents: string) {
            var fileName = node.getSourceFile().fileName;

            var configuration = findConfiguration("tslint.json", fileName);

            var linter = new Linter(
                fileName,
                contents,
                {
                    configuration,
                    formatter: "json",
                    formattersDirectory: null,
                    rulesDirectory: configuration.rulesDirectory
                });

            var lintResult = linter.lint();

            lintResult.failures.forEach(element => {
                let pos = element.getStartPosition().getLineAndCharacter();
                metrics.LintIssues.push(
                    {
                        "rule": element.getRuleName(),
                        "message": element.getFailure(),
                        "line": pos.line + 1,
                        "character": pos.character + 1
                    }
                );
            });
        }

        private initializeState(text: string): void {
            this.scanner.setText(text);
            this.scanner.setOnError((message: ts.DiagnosticMessage, length: number) => {});
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