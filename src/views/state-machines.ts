import StepFunctions = require('aws-sdk/clients/stepfunctions');
import * as vscode from 'vscode';

export function getStateMachinesWebview(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, stateMachines: StepFunctions.StateMachineList) {
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(context.asAbsolutePath('webview.js')));

    let stateMachineList: string[] = [];
    stateMachines.forEach((stateMachine) => {
        stateMachineList.push(stateMachine.name);
    });

    return `<html>
        <head>
        <script src="${scriptUri}"></script>
        </head>
        <body>
        <h1>AWS Step Functions Local State Machines:</h1>
        ${stateMachineList.join(", ")}
        </body>
    </html>`;
}
