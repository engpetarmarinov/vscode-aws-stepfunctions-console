import StepFunctions = require('aws-sdk/clients/stepfunctions');
import * as vscode from 'vscode';
import { StateMachine } from '../models/StateMachine';

// This function gets the state machine steps definition from AWS 
export function getStateMachineDefinitionWebview(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, stateMachineDefinition: StepFunctions.DescribeStateMachineOutput) {
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src", "js", "webview.js"));
    const cssUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src", "css", "webview.css"));

    return `<html>
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${panel.webview.cspSource} https:; script-src ${panel.webview.cspSource}; style-src ${panel.webview.cspSource};">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AWS Step Functions State Machine Definition</title>
            <link rel="stylesheet" href="${cssUri}">
        </head>
        <body>
        ${stateMachineDefinition.definition}
        <script src="${scriptUri}"></script>
        </body>
    </html>`;
}

export function getStateMachinesWebview(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, stateMachines: StepFunctions.StateMachineList) {
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src", "js", "webview.js"));
    const cssUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src", "css", "webview.css"));

    let stateMachineList: StateMachine[] = [];
    stateMachines.forEach((stateMachine) => {
        stateMachineList.push(new StateMachine(stateMachine.name, stateMachine.stateMachineArn, stateMachine.type));
    });

    return `<html>
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${panel.webview.cspSource} https:; script-src ${panel.webview.cspSource}; style-src ${panel.webview.cspSource};">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AWS Step Functions State Machines</title>
            <link rel="stylesheet" href="${cssUri}">
        </head>
        <body>
        <h1>AWS Step Functions State Machines:</h1>
        <ul>
            ${stateMachineList.map((stateMachine) => `<li class=state-machine-list-btn data-state-machine-arn="${stateMachine.arn}">${stateMachine.name}</li>`).join("\n")}
        </ul>
        <script src="${scriptUri}"></script>
        </body>
    </html>`;
}
