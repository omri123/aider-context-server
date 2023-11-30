import { Capability } from "../capability";
import * as vscode from 'vscode';
import { traceInfo } from "../logging";
import { isAbsolute } from "path";
import path = require("path");
import { existsSync } from 'fs';


const prefix = "The symbol SYMBOL is referenced in the following files:\n";


// The user gives us symbol and line enumber, and we need to figure out the column by ourself.
async function getPosition(uri: vscode.Uri, lineNumber: number, symbol: string): Promise<vscode.Position> {
    if (!existsSync(uri.fsPath)) {
        return Promise.reject(Error(`file does not exist`));
    }
    const doc = await vscode.workspace.openTextDocument(uri);

    if (lineNumber > doc.lineCount) {
        return Promise.reject(Error(`line number is out of range`));
    }
    const line = doc.lineAt(lineNumber - 1).text;
    const startCol = line.indexOf(symbol);
    if (startCol === -1) {
        return Promise.reject(Error(`symbol ${symbol} not found in line ${lineNumber}`));
    }
    const position = new vscode.Position(lineNumber - 1, startCol);
    return position;
}


export class ListReferencesCapability implements Capability {
    capabilityName = 'references';
    symbols: Map<string, vscode.DocumentSymbol[]> = new Map<string, vscode.DocumentSymbol[]>(); // map from file name to list of symbols
    times: Map<string, number> = new Map<string, number>(); // map from file name to last time it was updated

    // update the symbols list for all open files,
    // and return old symbols list for all open files.
    updateSymbols(): void {
        vscode.workspace.textDocuments.forEach((doc) => {
            if (this.symbols.has(doc.fileName)) {
                const lastTime = this.times.get(doc.fileName);
                if (lastTime && Date.now() - lastTime < 60 * 10) {
                    return; // if the file was updated less than 10 minutes ago, don't update it again
                }
            }
            const symbols = vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', doc.uri);
            symbols.then((symbols) => {
                if (symbols) {
                    const symbolsList = symbols as vscode.DocumentSymbol[];
                    this.symbols.set(doc.fileName, symbolsList);
                    this.times.set(doc.fileName, Date.now());
                }
            });
            // The new symbols are not yet available, so we return the old ones.
        });
    }


    getTitles(): Promise<string[]> {
        this.updateSymbols();
        const titles: string[] = [];
        if (!vscode.window.activeTextEditor) {
            return Promise.resolve(titles);
        }
        const doc = vscode.window.activeTextEditor.document;
        this.symbols.get(doc.fileName)?.forEach((symbol) => {
            const relativeFname = vscode.workspace.asRelativePath(doc.fileName);
            titles.push(`${relativeFname}:${symbol.selectionRange.start.line + 1}:${symbol.name}`);
        });
        return Promise.resolve(titles);
    }
    getContent(title: string): Promise<string> {
        // Parse the command. TODO: more stable parsing.
        const split = title.trim().split(':').filter((word) => word.length > 0);
        if (split.length < 3) {
            return Promise.reject(Error('cannot parse reference title'));
        }
        const fname = split.slice(0, split.length - 2).join(':'); // In windows path can contain `:`.
        const lineNumber = split[split.length - 2];
        const symbol = split[split.length - 1];
        let absFname = fname;
        if (!isAbsolute(absFname)) {
            const wf = vscode.workspace.workspaceFolders;
            if (!wf) {
                return Promise.reject(Error('no workspace folder'));
            }
            if (wf.length > 1) {
                return Promise.reject(Error('multiple workspace folders'));
            }
            absFname = path.join(wf[0].uri.fsPath, absFname);
        }

        const uri = vscode.Uri.file(absFname);
        const pos = getPosition(uri, parseInt(lineNumber), symbol);
        return pos.then((pos) => {
            return vscode.commands.executeCommand<vscode.Location[]>('vscode.executeReferenceProvider', uri, pos)
                .then((locations) => {
                    let resultAsLines: string[] = [];
                    const uniqueLocations = new Map();
                    locations.forEach(location => {
                        const fname = vscode.workspace.asRelativePath(location.uri.fsPath);
                        const lineNumber = location.range.start.line + 1; // VS Code is 0-indexed, add 1 for human-readable line number
                        if (!uniqueLocations.has(fname)) {
                            uniqueLocations.set(fname, []);
                        }
                        uniqueLocations.get(fname).push(lineNumber);
                    });
                    uniqueLocations.forEach((lineNumbers, uriPath) => {
                        resultAsLines.push(`${uriPath}, lines: ${lineNumbers.join(', ')}\n`);
                    });
                    traceInfo(resultAsLines.join(''));
                    const formattedPrefix = prefix.replace('SYMBOL', symbol);
                    return formattedPrefix + resultAsLines.join('');
                });
        }).catch((err) => {
            traceInfo(err);
            return Promise.reject(err);
        });
    }
    activate(): void { }
    deactivate(): void { }

}