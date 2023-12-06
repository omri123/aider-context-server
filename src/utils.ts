import * as parse from 'parse-diff'

const HEAD = "<<<<<<< SEARCH\n"
const DIVIDER = "=======\n"
const UPDATED = ">>>>>>> REPLACE\n"

export function formatDiff(diff: string): string {
    const parsed = parse(diff);
    let result = '';
    for (const file of parsed) {
        result += formatFile(file);
    }
    return result;
}

function chooseFname(file: parse.File): string {
    if (file.deleted) {
        if (file.from) {
            return file.from;
        }
        else {
            return '';
        }
    }

    if (file.from && file.to && file.from !== file.to) {
        if (file.from === '/dev/null') {
            return file.to;
        }
        if (file.to === '/dev/null') {
            return file.from;
        }
        return file.from + ' -> ' + file.to;
    }

    if (file.from) {
        return file.from;
    }

    if (file.to) {
        return file.to;
    }

    return '';
}

function formatFile(file: parse.File): string {
    let result = '';
    let fname = chooseFname(file);

    for (const chunk of file.chunks) {
        result += formatChunk(chunk, fname);
        result += '\n';
    }
    return result;
}

export function formatChunk(chunk: parse.Chunk, fname: string): string {
    const changes = chunk.changes;
    let search = '';
    let replace = '';
    for (const change of changes) {
        const content = change.content.slice(1) + '\n';
        if (content === 'No newline at end of file\n') {
            continue;
        }
        if (change.type === 'normal') {
            search += content;
            replace += content;
        } else if (change.type === 'add') {
            replace += content;
        } else if (change.type === 'del') {
            search += content;
        }
    }

    let searchReplace = ''
    searchReplace += 'AIDER_FENCE_0\n'
    searchReplace += fname + '\n'; // TODO: handle move etc
    searchReplace += HEAD;
    searchReplace += search;
    searchReplace += DIVIDER;
    searchReplace += replace;
    searchReplace += UPDATED;
    searchReplace += 'AIDER_FENCE_1\n'
    return searchReplace;
}

