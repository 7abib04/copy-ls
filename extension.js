const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const clipboardy = require('clipboardy');
let folderStructure = '';

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Extension "copy-ls" is now active.');
    
    // Create the output channel once and reuse it
    const outputChannel = vscode.window.createOutputChannel('List Files');
    context.subscriptions.push(outputChannel);

    // Register the new List Files command
    let listFiles = vscode.commands.registerCommand('copy-ls.listFiles', async function () {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;

            if (workspaceFolders && workspaceFolders.length > 0) {
                // Iterate through all workspace folders (handles multi-root workspaces)
                for (const folder of workspaceFolders) {
                    const folderPath = folder.uri.fsPath;
                    outputChannel.appendLine(`Listing files in: ${folderPath}`);

                    // Read the files in the folder using fs.promises for better async handling
                    let result = await filePaths(folderPath);
                    clipboardy.writeSync(result.folderStructure+"\n----------------------------------------------\n"+result.result);
                    outputChannel.appendLine(`Done! Copied to clipboard.`);
                    outputChannel.show(true); 
                }
            } else {
                vscode.window.showWarningMessage('No workspace folder is open.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`An unexpected error occurred: ${error.message}`);
            console.error(error);
        }
    });
    context.subscriptions.push(listFiles);

    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'copy-ls.listFiles';
    statusBarItem.text = '$(file-directory) List Files';
    statusBarItem.tooltip = 'List Files in Folder';
    statusBarItem.show();

    context.subscriptions.push(statusBarItem);
}

function deactivate() {
    console.log('Extension "copy-ls" is now deactivated.');
}

module.exports = {
    activate,
    deactivate
};

async function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}


async function filePaths(folderPath, prefix = '', isLast = true, accumulator = { folderStructure: '', result: '' }) {
    const basename = path.basename(folderPath);
    accumulator.folderStructure += `${prefix}${isLast ? '└── ' : '├── '}${basename}/\n`;

    // Update the prefix for the next level
    const newPrefix = prefix + (isLast ? '    ' : '│   ');

    let files;
    try {
        files = await fs.promises.readdir(folderPath);
    } catch (error) {
        console.error(`Error reading directory ${folderPath}:`, error);
        vscode.window.showErrorMessage(`Error reading directory ${folderPath}: ${error.message}`);
        return accumulator;
    }

    if (files.length === 0) {
        vscode.window.showInformationMessage(`The folder ${folderPath} is empty.`);
        return accumulator;
    }

    // Define patterns to ignore
    const ignorePatterns = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'zip', 'tar', 'gz', 'git', 'gitignore','mod','vscode','db','sum'];

    // Filter out ignored files and sort directories first
    const filteredFiles = files.filter(file => {
        const ext = getFileExtension(file);
        return !ignorePatterns.includes(ext);
    }).sort((a, b) => {
        const aPath = path.join(folderPath, a);
        const bPath = path.join(folderPath, b);
        const aIsDir = fs.statSync(aPath).isDirectory();
        const bIsDir = fs.statSync(bPath).isDirectory();
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
            console.error(`Error stating file ${filePath}:`, error);
            vscode.window.showErrorMessage(`Error accessing ${filePath}: ${error.message}`);
            continue;
        }

        const isLastItem = i === filteredFiles.length - 1;

        if (stat.isDirectory()) {
            // Recursively process subdirectories
            await filePaths(filePath, newPrefix, isLastItem, accumulator);
        } else {
            // Add file to the structure
            accumulator.folderStructure += `${newPrefix}${isLastItem ? '└── ' : '├── '}${file}\n`;
            try {
                const data = await fs.promises.readFile(filePath, 'utf8'); 
                accumulator.result += `Data from ${file}:\n${data}\n\n------------------------------------------------\n\n`;
            } catch (error) {
                console.error(`Error reading file ${filePath}:`, error);
                vscode.window.showErrorMessage(`Error reading file ${filePath}: ${error.message}`);
            }
        }
    }

    return accumulator;
}

function getFileExtension(filename) {
    return filename.split('.').pop();
}