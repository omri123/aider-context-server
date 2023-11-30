// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getCapabilities, runServer } from './server';
import { Capability } from './capability';
import { traceInfo, registerLogger } from './logging';

let capabilities: Capability[] = [];
let server: any;
export function activate(context: vscode.ExtensionContext) {
	// Setup logging, this is the only part we don't restart when restarting the server, to have a consistent log.
	const outputChannel = vscode.window.createOutputChannel('Aider', { log: true });
	context.subscriptions.push(outputChannel, registerLogger(outputChannel));
	traceInfo('activating aider-context-server');

	// Restart the server on user request.
	let disposable = vscode.commands.registerCommand('aider-context-server.restart', () => {
		// Verify we have all needed configurations.
		const port = vscode.workspace.getConfiguration('aider-context-server').get<number>('port');
		if (!port) {
			vscode.window.showErrorMessage('Failed to get port from configuration');
			return;
		}

		// We don't handle multiple workspaces. It is a bit more complicated to handle and aider itself don't support it.
		if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 1) {
			vscode.window.showErrorMessage('Aider Context Server does not support multiple workspaces, close some folders and try again.');
			return;
		}

		// We restart the capabilities to let the user new chance to authenticate.
		for (const capability of capabilities) {
			capability.deactivate();
		}
		capabilities = getCapabilities();
		for (const capability of capabilities) {
			traceInfo('Activating capability: ', capability.capabilityName);
			capability.activate();
		}

		// Restart the server.
		if (server) {
			server.close((err: any) => {
				server = runServer(port, capabilities);
				vscode.window.showInformationMessage(`Aider Context Server is running on port ${port}`);
			});
			return;
		}
		server = runServer(port, capabilities);
		vscode.window.showInformationMessage(`Aider Context Server is running on port ${port}`);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
	for (const capability of capabilities) {
		capability.deactivate();
	}
}
