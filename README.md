# Context server for aider - AI pair programming in your terminal

Aider is a command line tool that lets you pair program with GPT,
to edit code stored in your local git repository.
Using this context server extension, you can add additional context and code analysis into the chat.

To better know aider, please take a look at [aider documentation](https://aider.chat).

- [Getting started](#getting-started)
- [Extension Features](#extension-features)
- [Limitations](#limitations)
- [Roadmap](#roadmap)

## Getting started

- Configure the port number in the extension settings.
- Run the command `Restart Aider Server` from the command palette.
- Install and run aider inside your project directory:

```bash
$ pip install git+https://github.com/omri123/aider@extension-0.2.1
$ export OPENAI_API_KEY=your-key-goes-here
$ aider --port 8080

Model: gpt-4
VSCode: enabled
> /add \issue-uri
Added context item "\issue-uri" to the chat

\issue-uri> /add \commit-hash
Added context item "\commit-hash" to the chat

\issue-uri \commit-hash> Finish the task described in issue 2. Use the supplied commit as a reference.
```

## Extension Features

Commands additional to the original aider:

- Scrape a web page and add it to the chat, with `/web` command
- Edit conversation history with `/hist` and `/edit_history` commands
- `/add \issue-<uri>`: Add an issue to the chat.
- `/add \references-<symbol>`: Add a list of symbol references to the chat.
- `/add \commit-<hash>`: Add commit info and content to the chat.
- `/show <issue|references|commit>`: Show the content of a context item.
- `/drop <issue|references|commit>`: Remove matching context item from the chat session.

All the commands have autocomplete for URIs, hash codes and symbols.

Please take a look also at the original aider [commands docs](https://aider.chat/docs/commands.html).

## Limitations

You can ask aider to list reference of any symbol, and to add any issue. The autocomplete show only symbols on the top level of the open file, and only issues assigned to you.

## Roadmap

Current goal:

> User can add teammates past reviews, and ask aider: <em>"do I repeat their mistakes"?</em>

I have big plans for this project.
Some of the upcoming features are of the form "allow user to add context to the chat":

- Add github issue to the chat - Done!
- Add github pull request and review comments to the chat
- Add Jira issue to the chat
- Add git commit to the chat - Done!

Another line of features is "allow user to add code navigation information into the chat":

- Add signature to the chat
- Add definition to the chat
- Add references to the chat - Done!
- etc

Later on, I plan to allow aider to **ask** for this kind of information.

The last type of features is the most complicated to implement. I have a few changes to make in aider's core.
I want aider to consume and produced code with line numbers, for easy integration of other features.
Before implementing such a feature I need create a new regression benchmark. When ready, I will upstream this feature to aider.

Update Dec 6: The line numbering looks like a problematic idea, and I will do my best to implement the other features without it:)
