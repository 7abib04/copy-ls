const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const clipboardy = require('clipboardy');


function activate(context) {
    console.log('extension "copy-ls" is now active.');

    // create one output panel so i can reuse it
    const outputChannel = vscode.window.createOutputChannel('List Files');
    context.subscriptions.push(outputChannel);

    // register the command that shown in ctrl+ shift+p
    let listFiles = vscode.commands.registerCommand('copy-ls.listFiles', async function () {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;

            if (workspaceFolders && workspaceFolders.length > 0) {
                for (const folder of workspaceFolders) {
                    const folderPath = folder.uri.fsPath;
                    outputChannel.appendLine(`listing files in: ${folderPath}`);

                    // call the function to get the tree and content
                    const result = await filePaths(folderPath);

                    // copy everything to clipboard
                    clipboardy.writeSync(result.folderStructure + "\n----------------------------------------------\n" + result.result);
                    outputChannel.appendLine(`done! copied to clipboard.`);
                    outputChannel.show(true);
                }
            } else {
                vscode.window.showWarningMessage('no workspace folder is open.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`error: ${error.message}`);
            console.error(error);
        }
    });
    context.subscriptions.push(listFiles);

    // show a small icon on the bottom bar for quick access
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'copy-ls.listFiles';
    statusBarItem.text = '$(file-directory) List Files';
    statusBarItem.tooltip = 'list files in folder';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}

function deactivate() {
    console.log('extension "copy-ls" is now deactivated.');
}

module.exports = {
    activate,
    deactivate
};

//walks through folders & build folder structure & file contents
async function filePaths(folderPath, prefix = '', isLast = true, accumulator = { folderStructure: '', result: '' }) {
    const basename = path.basename(folderPath);
    accumulator.folderStructure += `${prefix}${isLast ? '└── ' : '├── '}${basename}/\n`;

    const newPrefix = prefix + (isLast ? '    ' : '│   ');

    let files;
    try {
        files = await fs.promises.readdir(folderPath);
    } catch (error) {
        console.warn(`can't read folder: ${folderPath}`);
        return accumulator;
    }

    if (files.length === 0) {
        return accumulator;
    }

    // shit files to skip
    const ignorePatterns = ['zip', 'tar', 'gz', 'ico', 'git'];

    const filteredFiles = files.filter(file => {
        const ext = getFileExtension(file);
        return !ignorePatterns.includes(ext);
    }).sort((a, b) => {
        const aPath = path.join(folderPath, a);
        const bPath = path.join(folderPath, b);
        let aIsDir = false, bIsDir = false;
        try { aIsDir = fs.statSync(aPath).isDirectory(); } catch {}
        try { bIsDir = fs.statSync(bPath).isDirectory(); } catch {}
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
    });

    for (let i = 0; i < filteredFiles.length; i++) {
        const file = filteredFiles[i];
        const filePath = path.join(folderPath, file);

        let stat;
        try {
            stat = await fs.promises.stat(filePath);
        } catch (error) {
            console.warn(`can't access file: ${filePath}`);
            continue;
        }

        const isLastItem = i === filteredFiles.length - 1;

        if (stat.isDirectory()) {
            // go inside subfolder deeeeeep recursive
            await filePaths(filePath, newPrefix, isLastItem, accumulator);
        } else {
            // add the file name to the folder tree
            accumulator.folderStructure += `${newPrefix}${isLastItem ? '└── ' : '├── '}${file}\n`;

            // read  file content 
            try {
                const buffer = await fs.promises.readFile(filePath);
                const isUtf8 = !buffer.toString('utf8').includes('\uFFFD');// to skip shit files

                if (isUtf8) {
                    const data = buffer.toString('utf8');
                    accumulator.result += `data from ${file}:\n${data}\n\n------------------------------------------------\n\n`;
                } else {
                    accumulator.result += `skipped binary or unreadable file: ${file}\n\n------------------------------------------------\n\n`;
                }
            } catch (error) {
                console.warn(`could not read file: ${filePath}`);
                accumulator.result += `could not read file: ${file}\n\n------------------------------------------------\n\n`;
            }
        }
    }

    return accumulator;
}

// no need for explain just return the ext of the file...
function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
}