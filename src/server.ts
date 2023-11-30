//This file define an IDE-server that serves aiders information requests.

import { createServer } from 'http';
import * as url from 'url';
import { Capability } from './capability';
import { GithubIssueCapability } from './capabilities/github';
import { registerLogger, traceError, traceInfo, traceLog, traceVerbose } from './logging';
import { ListReferencesCapability } from './capabilities/references';


export function runServer(port: number, capabilities: Capability[]) {
    // Server get requests of the following form:
    // http://localhost:8080/add/titles
    // http://localhost:8080/add/content/<title>
    const server = createServer(async function (req, res) {
        traceLog('aider server got request: ', req.url);
        const failure = (message: string): undefined => {
            res.statusCode = 404;
            res.write(message);
            res.end();
        };

        if (!req.url) {
            console.log('somehow we got a request with no url');
            failure('404 - server got empty url');
            return;
        }

        // Hack to parse url.
        const pathname = new url.URL(req.url, 'https://example.com').pathname;
        const prefix = pathname.split('/')[1];
        if (prefix !== 'add') {
            failure(`404 - we support only add, got ${prefix}`);
            return;
        }

        const method = pathname.split('/')[2];
        if (method === 'ack') {
            res.write('ack');
            res.end();
            traceLog('aider server sent ack');
            return;
        }
        if (method === 'prefixes') {
            const prefixes: string[] = [];
            for (const capability of capabilities) {
                prefixes.push(capability.capabilityName);
            }
            res.write(prefixes.join('\n'));
            res.end();
            traceLog('aider server sent prefixes');
            return;
        }
        if (method === 'titles') {
            const allTitles: string[] = [];
            for (const capability of capabilities) {
                try {
                    const titels = await capability.getTitles();
                    const titleWithCapabilityName = titels.map((title) => {
                        return capability.capabilityName + '-' + title;
                    });
                    allTitles.push(...titleWithCapabilityName);
                } catch (error) {
                    if (error instanceof Error) {
                        traceError(`${capability.capabilityName} failed to get titles: ${error.message}`);
                    } else {
                        traceError(`${capability.capabilityName} failed to get titles.`);
                    }
                }
            }
            res.write(allTitles.join('\n'));
            res.end();
            traceLog('aider server sent titles');
            return;
        }
        if (method === 'content') {
            const title = pathname.split('/').slice(3).join('/');
            const capabilityName = title.split('-')[0];
            const capability = capabilities.find((capability) => capability.capabilityName === capabilityName);
            if (!capability) {
                return failure(`capability ${capabilityName} not found`);
            }
            capability
                .getContent(title.split('-').slice(1).join('-'))
                .then((content) => {
                    res.write(content);
                    res.end();
                    traceLog('aider server sent content');
                })
                .catch((error) => {
                    traceError('aider server failed to get content: ', error);
                    return failure('404 - failed to get content');
                });
            return;
        }
        return failure('404 - unknown method');
    });

    server.listen(port, 'localhost');
    traceInfo('aider server listening on port ', port);
    return server;
}

export function getCapabilities(): Capability[] {
    const capabilities: Capability[] = [];
    // Add your capabilities here
    capabilities.push(new GithubIssueCapability());
    capabilities.push(new ListReferencesCapability());

    return capabilities;
}
