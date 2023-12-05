import * as vscode from 'vscode';
import * as git from '../apis/git';
import { traceError, traceInfo } from '../logging';
import { Capability } from '../capability';
import * as difflib from 'difflib';


export class CommitCapability implements Capability {
    capabilityName = 'commit';
    gitApi: git.API | undefined;
    titles: string[] | undefined = undefined;

    getTitles(): Promise<string[]> {
        if (!this.gitApi) {
            return Promise.resolve([]);
        }
        if (this.titles === undefined) {
            getCommitHashes(this.gitApi).then((titles) => {
                this.titles = titles;
            });

            return Promise.resolve([]);
        }
        return Promise.resolve(this.titles);
    }

    getContent(title: string): Promise<string> {
        if (!this.gitApi) {
            return Promise.reject('git api not available');
        }
        if (!this.gitApi.repositories) {
            return Promise.reject('no repositories');
        }
        const promises: Promise<string>[] = [];
        this.gitApi.repositories.forEach(async function (repo) {
            const promise = repo.getCommit(title).then((commit) => {
                return formatCommit(commit, repo);
            });
            promises.push(promise);
        });
        return Promise.any(promises);
    }

    activate(): void {
        this.gitApi = getGitApi();
    }

    deactivate(): void { }
}

function getGitApi(): git.API | undefined {
    const extension = vscode.extensions.getExtension<git.GitExtension>('vscode.git');
    if (!extension) {
        return undefined;
    }
    return extension.exports.getAPI(1);
}

async function getCommitHashes(gitApi: git.API): Promise<string[]> {
    const hashes: string[] = [];
    gitApi.repositories.forEach(async function (repo) {
        const log = await repo.log();
        log.forEach((commit) => {
            hashes.push(commit.hash.substring(0, 7));
        });
    });
    return hashes;
}

function timeDifference(current: number, previous: number): string {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute * 2) {
        return Math.round(elapsed / 1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour * 2) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay * 2) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    else if (elapsed < msPerMonth * 2) {
        return 'approximately ' + Math.round(elapsed / msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear * 2) {
        return 'approximately ' + Math.round(elapsed / msPerMonth) + ' months ago';
    }

    else {
        return 'approximately ' + Math.round(elapsed / msPerYear) + ' years ago';
    }
}

async function formatCommit(commit: git.Commit, repo: git.Repository): Promise<string> {
    let formatted = '';
    formatted += 'Author: ' + commit.authorName + ' <' + commit.authorEmail + '>\n';
    if (commit.authorDate) {
        formatted += 'Date:   ' + timeDifference(new Date().getTime(), commit.authorDate.getTime()) + '\n';
    }
    formatted += '\n';
    formatted += commit.message;
    formatted += '\n';

    const changes = await repo.diffBetween(commit.parents[0], commit.hash);
    for (const change of changes) {
        // formatted += await repo.show(commit.hash, change.uri.path);
        formatted += await repo.diffBetween(commit.parents[0], commit.hash, change.uri.path)
        formatted += '\n';
    }

    return formatted;
}

