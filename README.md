# GamingBlue

A fun Vencord plugin that highlights every instance of the word "gaming" in Discord messages by changing its color to blue and making it bold.

## Features

- Automatically detects and highlights the word "gaming" in all Discord messages
- Works with both existing messages and new messages as they appear
- Applies a distinctive blue color and bold styling to make "gaming" stand out
- Cleanly reverts all changes when the plugin is disabled

## How It Works

The plugin uses a MutationObserver to watch for new messages in the Discord chat and applies styling to any instances of the word "gaming" it finds. It also patches Discord's message renderer to ensure it catches all messages, including those that might be loaded dynamically.
