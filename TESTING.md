# Testing Strategy

## How to run the tests

You must use vscode `Run and Debug` utility to run the tests. Choose the launch configuration `Extension Tests`.
Running `npm run test` will not work because of phenomena related to switching workspace folders.

Pay attention that the tests environment is stateful and the tests might effect each other :(

## Capabilities

Tested without bringing up the server.
At the moment, references was tested, but github was manually e2d tested only.
I still need to figure out how to authenticate inside the tests.

Capabilities shouldn't have any external side effect.

## Server

manually e2e tested.
