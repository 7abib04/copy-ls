# copy-ls

**copy-ls** is a Visual Studio Code extension that allows you to generate a comprehensive tree structure of your project's directory. It intelligently filters out non-textual files such as images, videos, and binaries, ensuring that only relevant textual data is included. The resulting structure, along with the contents of the textual files, is copied directly to your clipboard for easy access and sharing. This feature is particularly beneficial for developers seeking to leverage AI tools like ChatGPT to debug or enhance their code, as providing the entire codebase in a structured format facilitates better understanding and more accurate assistance from AI.

## Features

- **Recursive Directory Traversal**: Scans through all folders and subfolders in your workspace to build a complete project structure.
  
- **Intelligent File Filtering**: Automatically ignores non-textual files (e.g., images, videos, archives) based on their MIME types to keep the output clean and relevant.
  
- **Clipboard Integration**: Copies the generated project structure and file contents directly to your clipboard with a single command.
  
- **AI-Friendly Output**: Provides a well-organized and comprehensive codebase snapshot, making it easier for AI tools like ChatGPT to understand and assist with debugging or code improvements.
  
- **Output Channel Logging**: Provides detailed logs of the operation in a dedicated output channel within VS Code for transparency and debugging.
  
- **Status Bar Integration**: Adds a convenient status bar item for quick access to the "List Files" command.

![copy-ls Feature](image.png)

> **Tip**: Utilize the extension's capabilities to document your project structure effortlessly, making onboarding and project reviews smoother!

## Requirements

- **Visual Studio Code**: Version 1.60.0 or higher.
- **Node.js**: Required for development and building the extension.
  
  The extension utilizes the following dependencies:
  
  - [`file-type`](https://www.npmjs.com/package/file-type): For accurate MIME type detection.
  - [`clipboardy`](https://www.npmjs.com/package/clipboardy): To handle clipboard operations.

## Extension Settings

This extension does not add any custom settings. However, it leverages VS Code's built-in configurations to function seamlessly within your development environment.

## Known Issues

- **Performance with Large Projects**: Scanning extremely large projects with thousands of files may take longer to process. Consider limiting the depth of traversal or refining ignore patterns if you encounter performance bottlenecks.
  
- **MIME Type Detection Limitations**: While `file-type` provides robust MIME type detection, some file types with uncommon or missing signatures might not be accurately identified, potentially leading to unintended inclusions or exclusions.

## Release Notes

### 1.0.0

- **Initial Release** of **copy-ls**.
- Added features:
  - Recursive directory traversal.
  - Intelligent filtering of non-textual files based on MIME types.
  - Clipboard integration to copy project structure and file contents.
  - Output channel for detailed logging.
  - Status bar item for quick access.

---

## Working with Markdown

You can author and edit your README using Visual Studio Code with ease. Here are some useful editor keyboard shortcuts:

- **Split the editor**: `Cmd+\` on macOS or `Ctrl+\` on Windows and Linux.
- **Toggle preview**: `Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux.
- **Trigger suggestion**: Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For More Information

- [Visual Studio Code's Markdown Support](https://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://www.markdownguide.org/basic-syntax/)

---

**Enjoy using copy-ls!** If you have any questions or feedback, feel free to reach out or open an issue on the [GitHub repository](https://github.com/7abib04/copy-ls).

