# Context server for aider - AI pair programming in your terminal

Aider is a command line tool that lets you pair program with GPT-3.5/GPT-4,
to edit code stored in your local git repository.

Aider makes sure edits from GPT are
[committed to git](https://aider.chat/docs/faq.html#how-does-aider-use-git)
with sensible commit messages.
Aider is unique in that it [works well with pre-existing, larger codebases](https://aider.chat/docs/repomap.html).

<p align="center">
  <img src="images/screencast.gif" alt="aider screencast">
</p>

Using this context server extension, you can add additional context and code analysis into the chat. It works with a custom version of aider, see [Getting started](#getting-started), [Relationship with aider project](#relationship-with-aider-project) and [Roadmap](#roadmap).

- [Getting started](#getting-started)
- [Example chat transcripts](#example-chat-transcripts)
- [Features](#features)
- [Usage](#usage)
- [In-chat commands](#in-chat-commands)
- [Tips](#tips)
- [New GPT-4 Turbo with 128k context window](#new-gpt-4-turbo-with-128k-context-window)
- [GPT-4 vs GPT-3.5](https://aider.chat/docs/faq.html#gpt-4-vs-gpt-35)
- [FAQ](https://aider.chat/docs/faq.html)
- [Discord](https://discord.gg/Tv2uQnR88V)
- [Kind words from users](#kind-words-from-users)
- [Relationship with aider project](#relationship-with-aider-project)
- [Roadmap](#roadmap)

## Getting started

- Configure the port number in the extension settings.
- Install and run aider inside your project directory:

```bash
$ pip install git+https://github.com/omri123/aider@extension-0.1
$ export OPENAI_API_KEY=your-key-goes-here
$ aider hello.js

Using git repo: .git
Added hello.js to the chat.

hello.js> write a js script that prints hello world
```

## Example chat transcripts

Here are some example transcripts that show how you can chat with `aider` to write and edit code with GPT-4.

- [**Hello World Flask App**](https://aider.chat/examples/hello-world-flask.html): Start from scratch and have GPT create a simple Flask app with various endpoints, such as adding two numbers and calculating the Fibonacci sequence.

- [**Javascript Game Modification**](https://aider.chat/examples/2048-game.html): Dive into an existing open-source repo, and get GPT's help to understand it and make modifications.

- [**Complex Multi-file Change with Debugging**](https://aider.chat/examples/complex-change.html): GPT makes a complex code change that is coordinated across multiple source files, and resolves bugs by reviewing error output and doc snippets.

- [**Create a Black Box Test Case**](https://aider.chat/examples/add-test.html): GPT creates a "black box" test case without access to the source of the method being tested, using only a
  [high level map of the repository based on tree-sitter](https://aider.chat/docs/repomap.html).

You can find more chat transcripts on the [examples page](https://aider.chat/examples/).

## Features

- Chat with GPT about your code. Aider lets GPT see and edit your code.
- Aider gives GPT a [map of your entire git repo](https://aider.chat/docs/repomap.html), which helps it understand and modify large codebases.
- You can request new features, changes, improvements, or bug fixes to your code. Ask for new test cases, updated documentation or code refactors.
- Aider will apply the edits suggested by GPT directly to your source files.
- Aider will [automatically commit each changeset to your local git repo](https://aider.chat/docs/faq.html#how-does-aider-use-git) with a descriptive commit message. These frequent, automatic commits provide a safety net. It's easy to undo changes or use standard git workflows to manage longer sequences of changes.
  - You can disable auto-commit is settings: `aider.auto-commit`.
- You can use aider with multiple source files at once, so GPT can make coordinated code changes across all of them in a single changeset/commit.
- You can also edit files by hand using your editor while chatting with aider. Aider will notice these out-of-band edits and keep GPT up to date with the latest versions of your files. This lets you bounce back and forth between the aider chat and your editor, to collaboratively code with GPT.

## Usage

You can then add and remove individual files in the chat
session with the `/add` and `/drop` chat commands described below.
If you or GPT mention one of the repo's filenames in the conversation,
aider will ask if you'd like to add it to the chat.

Aider will work best if you think about which files need to be edited to make your change and add them to the chat.
Aider has some ability to help GPT figure out which files to edit all by itself, but the most effective approach is to explicitly add the needed files to the chat yourself.

Aider also has many
additional command-line options, environment variables or configuration file
to set many options. See `aider --help` for details. You can use `aider.args` to add arbitrary arguments to aider command.

## In-chat commands

Aider supports commands from within the chat, which all start with `/`. Here are some of the most useful in-chat commands:

- `/add <file>`: Add matching files to the chat session.
- `/show <file>`: Show the content of a file additional context item.
- `/drop <file>`: Remove matching files from the chat session.
- `/undo`: Undo the last git commit if it was done by aider.
- `/diff`: Display the diff of the last aider commit.
- `/run <command>`: Run a shell command and optionally add the output to the chat.
- `/help`: Show help about all commands.
- `/add` and `/show` can work with additional context items, like `\issue-` or `\references-`.

See the [full command docs](https://aider.chat/docs/commands.html) for more information.

## Tips

- Think about which files need to be edited to make your change and add them to the chat.
  Aider has some ability to help GPT figure out which files to edit all by itself, but the most effective approach is to explicitly add the needed files to the chat yourself.
- Large changes are best performed as a sequence of thoughtful bite sized steps, where you plan out the approach and overall design. Walk GPT through changes like you might with a junior dev. Ask for a refactor to prepare, then ask for the actual change. Spend the time to ask for code quality/structure improvements.
- Use Control-C to safely interrupt GPT if it isn't providing a useful response. The partial response remains in the conversation, so you can refer to it when you reply to GPT with more information or direction.
- Use the `/run` command to run tests, linters, etc and show the output to GPT so it can fix any issues.
- Use Meta-ENTER (Esc+ENTER in some environments) to enter multiline chat messages. Or enter `{` alone on the first line to start a multiline message and `}` alone on the last line to end it.
- If your code is throwing an error, share the error output with GPT using `/run` or by pasting it into the chat. Let GPT figure out and fix the bug.
- GPT knows about a lot of standard tools and libraries, but may get some of the fine details wrong about APIs and function arguments. You can paste doc snippets into the chat to resolve these issues.
- GPT can only see the content of the files you specifically "add to the chat". Aider also sends GPT-4 a [map of your entire git repo](https://aider.chat/docs/repomap.html). So GPT may ask to see additional files if it feels that's needed for your requests.
- I also shared some general [GPT coding tips on Hacker News](https://news.ycombinator.com/item?id=36211879).

## New GPT-4 Turbo with 128k context window

Aider supports OpenAI's new GPT-4 model that has the massive 128k context window.
Early benchmark results
indicate that it is
[very fast](https://aider.chat/docs/benchmarks-speed-1106.html)
and a bit
[better at coding](https://aider.chat/docs/benchmarks-1106.html)
than previous GPT-4 models.

It is now the new default model for aider. You can change that in extension setting `aider.openai-model`.

## GPT-4 vs GPT-3.5

Aider supports all of OpenAI's chat models.
You can choose a model in the settings.

You should probably use GPT-4 if you can. For more details see the
[FAQ entry that compares GPT-4 vs GPT-3.5](https://aider.chat/docs/faq.html#gpt-4-vs-gpt-35).

For a discussion of using other non-OpenAI models, see the
[FAQ about other LLMs](https://aider.chat/docs/faq.html#can-i-use-aider-with-other-llms-local-llms-etc).

## FAQ

For more information, see the [FAQ](https://aider.chat/docs/faq.html).

## Kind words from users

- _The best AI coding assistant so far._ -- [Matthew Berman](https://www.youtube.com/watch?v=df8afeb1FY8)
- _Hands down, this is the best AI coding assistant tool so far._ -- [IndyDevDan](https://www.youtube.com/watch?v=MPYFPvxfGZs)
- _Aider ... has easily quadrupled my coding productivity._ -- [SOLAR_FIELDS](https://news.ycombinator.com/item?id=36212100)
- _It's a cool workflow... Aider's ergonomics are perfect for me._ -- [qup](https://news.ycombinator.com/item?id=38185326)
- _It's really like having your senior developer live right in your Git repo - truly amazing!_ -- [rappster](https://github.com/paul-gauthier/aider/issues/124)
- _What an amazing tool. It's incredible._ -- [valyagolev](https://github.com/paul-gauthier/aider/issues/6#issue-1722897858)
- _Aider is such an astounding thing!_ -- [cgrothaus](https://github.com/paul-gauthier/aider/issues/82#issuecomment-1631876700)
- _It was WAY faster than I would be getting off the ground and making the first few working versions._ -- [Daniel Feldman](https://twitter.com/d_feldman/status/1662295077387923456)
- _THANK YOU for Aider! It really feels like a glimpse into the future of coding._ -- [derwiki](https://news.ycombinator.com/item?id=38205643)
- _This project is stellar._ -- [funkytaco](https://github.com/paul-gauthier/aider/issues/112#issuecomment-1637429008)
- _Amazing project, definitely the best AI coding assistant I've used._ -- [joshuavial](https://github.com/paul-gauthier/aider/issues/84)
- _I am an aider addict. I'm getting so much more work done, but in less time._ -- [dandandan](https://discord.com/channels/1131200896827654144/1131200896827654149/1135913253483069470)
- _Best agent for actual dev work in existing codebases._ -- [Nick Dobos](https://twitter.com/NickADobos/status/1690408967963652097?s=20)

## Relationship with aider project

[aider](https://github.com/paul-gauthier/aider) is the best coding assistant I have encountered so far. I forked it, extended it, and wrapped it in an extension.
You can find my fork of aider [here](https://github.com/omri123/aider). This README is almost a copy of the aider's README.

List of additional features Added in the extension:

- Add github issue to the chat
- List references and add to the chat

My custom version of aider track the community aider + is able to interact with the extension.

## Limitations

You can ask aider to list reference of any symbol, and to add any issue. The autocomplete show only symbols on file top level, and only issues assigned to you.

## Roadmap

I have big plans for this project.
Some of the upcoming features are of the form "allow user to add context to the chat":

- Add github issue to the chat (already implemented!)
- Add github pull request and review comments to the chat
- Add Jira issue to the chat
- Add git commit to the chat

Another line of features is "allow user to add code navigation information into the chat":

- Add signature to the chat
- Add definition to the chat
- Add references to the chat
- etc

Later on, I plan to form this feature such that aider can _ask_ for this kind of information.

The last type of features is the most complicated to implement. I have a few changes to make in aider's core.
I want aider to consume and produced code with line numbers, for easy integration of other features.
Before implementing such a feature I need create a new regression benchmark. When ready, I will upstream this feature to aider.
