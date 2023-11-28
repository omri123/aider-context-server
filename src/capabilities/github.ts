import * as vscode from 'vscode';
import * as octokit from 'octokit';
import { traceError } from '../logging';
import { Capability } from '../capability';


async function getSession(): Promise<vscode.AuthenticationSession> {
    const session = await vscode.authentication.getSession('github', ['repo'], { createIfNone: true });
    if (!session) {
        vscode.window.showErrorMessage('Failed to sign in to github.');
    }
    return session;
}

async function getClient(): Promise<octokit.Octokit> {
    const session = await getSession();
    const client = new octokit.Octokit({
        auth: session.accessToken,
        userAgent: 'VS Code Review Assistant',
    });
    return client;
}

async function getIssueIds(client: octokit.Octokit): Promise<string[]> {
    const myOpenIssues = await client.rest.issues.list();
    if (myOpenIssues === undefined) {
        traceError('Failed to get issues');
        return [];
    }

    const titles: string[] = [];
    myOpenIssues.data.forEach((issue) => {
        if (!issue.repository || !issue.repository.owner || !issue.repository.name) {
            console.log('problematic issue: ', issue.url);
            return;
        }
        let title = '';
        title += issue.repository.owner.login;
        title += '/';
        title += issue.repository.name;
        title += '/issues/';
        title += issue.number;
        titles.push(title);
    });
    return titles;
}

export class GithubIssueCapability implements Capability {
    capabilityName = 'issue';
    client: octokit.Octokit | undefined;
    titles: string[] | undefined = undefined;

    getTitles(): Promise<string[]> {
        if (!this.client) {
            return Promise.resolve([]);
        }
        if (this.titles === undefined) {
            getIssueIds(this.client).then((titles) => {
                this.titles = titles;
            });
            // Do not wait for response - it may take time. It's ok,
            // this is used for autocompletion and will be called again.
            return Promise.resolve([]);
        }
        return Promise.resolve(this.titles);
    }

    getContent(issueId: string): Promise<string> {
        if (!this.client) {
            throw new Error('Github client not initialized');
        }
        const components = issueId.split('/');
        const owner = components[0];
        const repo = components[1];
        const number = components[3];

        // const issue = this.client.request(url);
        const issue = this.client.rest.issues.get({ owner: owner, repo: repo, issue_number: parseInt(number) });
        const comments = this.client.rest.issues.listComments({
            owner: owner,
            repo: repo,
            issue_number: parseInt(number),
        });
        return Promise.all([issue, comments])
            .then((result) => {
                const title = result[0].data.title;
                const body = result[0].data.body;
                let comments = '';
                result[1].data.forEach((comment) => {
                    comments += comment.user?.login + ': ' + comment.body + '\n\n';
                });
                return 'Issue title: ' + title + '\n\n' + 'Issue body:\n' + body + '\n\n' + comments;
            })
            .catch((error) => {
                traceError('Failed to get issue content: ', error);
                return '';
            });
    }

    activate(): void {
        getClient().then((client) => {
            this.client = client;
        });
    }

    deactivate(): void {}
}
