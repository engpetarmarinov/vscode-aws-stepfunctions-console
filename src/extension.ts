import * as vscode from 'vscode';
import { createStepFunctionsClient, fetchStateMachines } from './api';
import { getStateMachinesWebview } from './views/stateMachines';
import { messageHandlerGetStateMachineDefinition as handleGetStateMachineDefinition } from './messageHandlers';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "aws-stepfunctions-console" is now active!');

    let disposable = vscode.commands.registerCommand('aws-stepfunctions-console.aws-stepfunctions-console', async function () {
        try {
            const config = vscode.workspace.getConfiguration('awsStepFunctionsConsole');
            const region = config.get('region', 'us-east-1');
            const endpoint = config.get('endpoint', 'http://localhost:8083');
            const stepFunctions = createStepFunctionsClient(region, endpoint);
            const stateMachines = await fetchStateMachines(stepFunctions);
            const panel = vscode.window.createWebviewPanel(
                'aws-stepfunctions-console',
                'AWS Step Functions State Machines',
                vscode.ViewColumn.One,
                {
                    enableScripts: true
                }
            );

            // Handle messages from the webview
            panel.webview.onDidReceiveMessage(
                message => {
                    switch (message.command) {
                        case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                        case 'info':
                        vscode.window.showInformationMessage(message.text);
                        case 'getStateMachineDefinition':
                        handleGetStateMachineDefinition(context, stepFunctions, message);
                    }
                },
                undefined,
                context.subscriptions
            );

            panel.webview.html = getStateMachinesWebview(context, panel, stateMachines);
        } catch (err: any) {
            vscode.window.showErrorMessage(`Error: ${err.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
