const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

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
                    console.log(`Folder: ${folderPath}`);

                    // Read the files in the folder using fs.promises for better async handling
                    const files = await fs.promises.readdir(folderPath);
                    console.log(`Files: ${files}`);
                    
                    if (files.length === 0) {
                        vscode.window.showInformationMessage(`The folder "${folder.name}" is empty.`);
                        continue; // Move to the next folder if available
                    }

                    // Clear the output channel and append new data
                    outputChannel.clear();
                    outputChannel.appendLine(`Files in ${folderPath}:`);
                    outputChannel.appendLine('---------------------------');
                    
                    for (const file of files) {
                        let filePath = path.join(folderPath, file);
                        try {
                            const data = await readFile(filePath); // Await the promise
                            console.log(`Data from ${file}: ${data}`);
                        } catch (error) {
                            console.error(`Error reading file ${file}:`, error);
                        }
                        outputChannel.appendLine(file);
                    }
                    
                    outputChannel.show(true); // Preserve focus if desired
                }
            } else {
                vscode.window.showWarningMessage('No workspace folder is open.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`An unexpected error occurred: ${error.message}`);
            console.error(error); // Log the error for debugging purposes
        }
    });

    // Add the listFiles command to the context's subscriptions
    context.subscriptions.push(listFiles);

    // (Optional) Add a status bar item for quick access to the List Files command
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