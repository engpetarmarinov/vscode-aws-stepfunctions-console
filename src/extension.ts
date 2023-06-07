import * as vscode from 'vscode';
import { createStepFunctionsClient } from './api';
import { handleGetStateMachines, handleGetStateMachineDefinition, handleGetStateMachineExecutions, handleGetStateMachineExecution} from './messageHandlers';
import { initalizeVisualizationResourcePaths, globals } from './globals';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('aws-stepfunctions-console.aws-stepfunctions-console', async function () {
        try {
            const config = vscode.workspace.getConfiguration('awsStepFunctionsConsole');
            const region = config.get('region', 'us-east-1');
            const endpoint = config.get('endpoint', 'http://localhost:8084');
            const stepFunctions = createStepFunctionsClient(region, endpoint);
            globals.visualizationResourcePaths = initalizeVisualizationResourcePaths(context);
            const panel = vscode.window.createWebviewPanel(
                'aws-stepfunctions-console',
                'AWS Step Functions State Machines',
                {
                    preserveFocus: true,
                    viewColumn: vscode.ViewColumn.One,
                },
                {
                    enableScripts: true,
                    localResourceRoots: [
                        globals.visualizationResourcePaths.localWebviewScriptsPath,
                        globals.visualizationResourcePaths.stateMachineCustomThemePath,
                    ],
                    retainContextWhenHidden: true,
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
                            break;
                        case 'getStateMachines':
                            handleGetStateMachines(context, panel, stepFunctions, message);
                            break;
                        case 'getStateMachineDefinition':
                            handleGetStateMachineDefinition(context, stepFunctions, message);
                            break;
                        case 'getStateMachineExecutions':
                            handleGetStateMachineExecutions(context, panel, stepFunctions, message);
                            break;
                        case 'getStateMachineExecution':
                            handleGetStateMachineExecution(context, panel, stepFunctions, message);
                            break;
                        default:
                            vscode.window.showErrorMessage(`Error: Unrecognized command ${message.command}`);
                    }
                },
                undefined,
                context.subscriptions
            );

            handleGetStateMachines(context, panel, stepFunctions, {});
        } catch (err: any) {
            vscode.window.showErrorMessage(`Error: ${err.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
