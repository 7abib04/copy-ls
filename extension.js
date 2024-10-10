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
                    filePaths(folderPath);
                    
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




async function filePaths(folderPath) {
    const ignorePatterns = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'zip', 'tar', 'gz', 'git', 'gitignore','mod','vscode'];
    const files = await fs.promises.readdir(folderPath);
    if (files.length === 0) {
        vscode.window.showInformationMessage(`The folder is empty.`);
        return; // Move to the next folder if available
    }

    for (const file of files) {
        let filePath = path.join(folderPath, file);
        let stat = await fs.promises.stat(filePath);
         const fileExtension = getFileExtension(file);

        if(ignorePatterns.includes(fileExtension)) {
            continue;
        }
        if (stat.isDirectory()) {
            
            console.log(`Folder: ${filePath}\n`);
            await filePaths(filePath);
        } else {
            try {
                const data = await readFile(filePath); 
                console.log(`Data from ${file}\n: ${data}\n\n`);
            } catch (error) {
                console.error(`Error reading file ${file}:`, error);
            }
        }
       
    }
}

function getFileExtension(filename) {
    return filename.split('.').pop();
}