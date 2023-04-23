import * as vscode from 'vscode';
import { fetchStateMachineDefinition } from './api';
import { getStateMachineDefinitionWebview } from './views/stateMachines';

export function messageHandlerGetStateMachineDefinition(context: vscode.ExtensionContext, stepFunctions: any, message: any) {
    fetchStateMachineDefinition(stepFunctions, message.arn).then((stateMachineDescription) => {

        const definitionPanel = vscode.window.createWebviewPanel(
            'aws-stepfunctions-console',
            `State Machine ${stateMachineDescription.name} Definition`,
            vscode.ViewColumn.Two,
            {
                enableScripts: true
            }
        );

        definitionPanel.webview.html = getStateMachineDefinitionWebview(context, definitionPanel, stateMachineDescription);
    });
}
