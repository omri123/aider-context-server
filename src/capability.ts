// This file describe API for additional-context capabilities.
// Your new capability should follow thhis API, and be registered in extension.ts.

interface Capability {
    capabilityName: string;
    getTitles(): Promise<string[]>;
    getContent(title: string): Promise<string>;

    activate(): void;
    deactivate(): void;
}

export { Capability };
