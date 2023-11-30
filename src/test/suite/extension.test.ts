import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { ListReferencesCapability } from '../../capabilities/references';

async function sleep(ms: number) {
	await new Promise(r => setTimeout(r, ms));
}

async function openDemoFileInEditor(relativePath: string) {
	const folders = vscode.workspace.workspaceFolders;
	if (!folders) {
		assert.fail("no folders");
	}
	const absPath = path.join(folders[0].uri.fsPath, relativePath);
	const uri = vscode.Uri.file(absPath);
	const doc = await vscode.workspace.openTextDocument(uri);
	await vscode.window.showTextDocument(doc);
	return absPath;
}

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('reference titles test', async function () {
		this.timeout(5000);
		// The references suggesttion titles are grabed from open editors, so we need to open an editor
		await openDemoFileInEditor('demo.ts');

		// Create references capability.
		const capability = new ListReferencesCapability();
		capability.activate();

		// Get titles.
		const titles1st = await capability.getTitles();
		assert(titles1st.length === 0); // on first try we always get nothing.
		await sleep(2000);
		const titles2nd = await capability.getTitles();
		assert.equal(titles2nd.join(","), "demo.ts:1:add,demo.ts:5:subtract,demo.ts:9:doNothing");
	});

	test('reference content test', async function () {
		this.timeout(5000);
		// Create references capability.
		const capability = new ListReferencesCapability();
		capability.activate();

		// Get references of "add".
		const refrences = await capability.getContent("demo.ts:1:add");
		assert.equal(refrences, "The symbol add is referenced in the following files:\ndemo.ts, lines: 1, 10\n");
	});

	test('reference bad title - will not find symbol', function (done) {
		this.timeout(5000);
		// Create references capability.
		const capability = new ListReferencesCapability();
		capability.activate();

		// substruct was not defined on line 1.
		capability.getContent("demo.ts:1:subtract").then(() => {
			assert.fail();
		}).catch((err) => {
			assert.equal(err.message, "symbol subtract not found in line 1");
			done();
		});
	});

	test('reference bad title - file does not exists', function (done) {
		this.timeout(5000);
		// Create references capability.
		const capability = new ListReferencesCapability();
		capability.activate();

		// this file name does not exists.
		capability.getContent("no-file.ts:1:add").then(() => {
			assert.fail();
		}).catch((err) => {
			assert.equal(err.message, "file does not exist");
			done();
		});
	});

	test('reference bad title - line number is out of range', function (done) {
		this.timeout(5000);
		// Create references capability.
		const capability = new ListReferencesCapability();
		capability.activate();

		// file is shorter than 100 lines.
		capability.getContent("demo.ts:100:add").then(() => {
			assert.fail();
		}).catch((err) => {
			assert.equal(err.message, "line number is out of range");
			done();
		});
	});

	test('reference bad title - cant parse', function (done) {
		this.timeout(5000);
		// Create references capability.
		const capability = new ListReferencesCapability();
		capability.activate();

		// can't parse.
		capability.getContent("demo.ts:1").then(() => {
			assert.fail("somehow we parsed demo.ts:1");
		}).catch((err) => {
			assert.equal(err.message, "cannot parse reference title");
		});

		// Can't parse.
		capability.getContent(":demo.ts:1:").then((content) => {
			assert.fail("somehow we parsed :demo.ts:1:");
		}).catch((err) => {
			assert.equal(err.message, "cannot parse reference title");
			done();
		});
	});

	test('reference get titles from file outside workspace', async function () {
		this.timeout(5000);
		await openDemoFileInEditor('../demo2/demo2.ts');

		// Create references capability.
		const capability = new ListReferencesCapability();
		capability.activate();

		// Get titles.
		await capability.getTitles();
		await sleep(1000);
		const titles = await capability.getTitles();
		console.log(titles.join(","));
		assert(titles.join(",").includes("mul"));
		assert(titles.join(",").includes("div")); // we don't check path since it will be absolute path.
		assert(!titles.join(",").includes("add")); // titles should track the active editor.
	});

	test('reference get titles no open files', async function () {
		this.timeout(5000);
		await vscode.commands.executeCommand('workbench.action.closeActiveEditor'); // One for demo.ts
		await vscode.commands.executeCommand('workbench.action.closeActiveEditor'); // One for demo2.ts
		await vscode.commands.executeCommand('workbench.action.closeActiveEditor'); // And one for luck

		// Create references capability.
		const capability = new ListReferencesCapability();
		capability.activate();

		// Get titles.
		const titles1st = await capability.getTitles();
		assert(titles1st.length === 0); // on first try we always get nothing.
		await sleep(2000);
		const titles2nd = await capability.getTitles();
		assert(titles2nd.length == 0);
	});

	test('reference get content file outside workspace', async function () {
		this.timeout(5000);
		const absPath = await openDemoFileInEditor('../demo2/demo2.ts');
		// Create references capability.
		const capability = new ListReferencesCapability();
		capability.activate();

		// Get references of "add".
		console.log(absPath);
		const refrences = await capability.getContent(`${absPath}:1:mul`);
		assert(refrences.includes("demo2.ts"));
		assert(refrences.includes("lines: 1, 10"));
	});
});
