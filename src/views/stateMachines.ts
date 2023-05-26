import StepFunctions = require('aws-sdk/clients/stepfunctions');
import * as vscode from 'vscode';
import { StateMachine } from '../models/StateMachine';

export function getStateMachinesWebview(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, stateMachines: StepFunctions.StateMachineList): string {
  const scriptUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "resources", "js", "stateMachines.js"));
  const cssUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "resources", "css", "stateMachines.css"));

  let stateMachineList: StateMachine[] = [];
  stateMachines.forEach((stateMachine) => {
    stateMachineList.push(new StateMachine(stateMachine.name, stateMachine.stateMachineArn, stateMachine.type));
  });

  return `<html>
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${panel.webview.cspSource}; style-src ${panel.webview.cspSource};">
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

export function getStateMachineExecutionsWebview(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, stateMachineArn: string, executionList: StepFunctions.ExecutionList): string {
  const scriptUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "resources", "js", "stateMachines.js"));
  const cssUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "resources", "css", "stateMachines.css"));

  return `<html>
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${panel.webview.cspSource}; style-src ${panel.webview.cspSource};">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AWS Step Functions State Machines</title>
            <link rel="stylesheet" href="${cssUri}">
        </head>
        <body>
        <h1>AWS Step Functions State Machine Executions:</h1>
        <a href=# class="state-machines-btn">&lt;&lt; Back to State Machines</a>
        <ul data-state-machine-arn="${stateMachineArn}">
            ${executionList.map((execution: StepFunctions.ExecutionListItem) => 
                `<li class=state-machine-execution-list-btn data-state-machine-execution-arn="${execution.executionArn}">
                    ${execution.startDate} ${execution.name} ${execution.status}
                </li>`
            ).join("\n")}
        </ul>
        <script src="${scriptUri}"></script>
        </body>
    </html>`;
}


export function getStateMachineExecutionWebview(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, stateMachineArn: string, execution: StepFunctions.GetExecutionHistoryOutput): string {
  const scriptUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "resources", "js", "stateMachines.js"));
  const cssUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "resources", "css", "stateMachines.css"));

  return `<html>
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${panel.webview.cspSource}; style-src ${panel.webview.cspSource};">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AWS Step Functions State Machines</title>
            <link rel="stylesheet" href="${cssUri}">
        </head>
        <body>
        <h1>AWS Step Functions State Machine Executions:</h1>
        <a href=# class="state-machine-executions-btn" data-state-machine-arn="${stateMachineArn}">&lt;&lt; Back to State Machine Executions</a>
        <pre><code>${JSON.stringify(execution, null, 4)}</code></pre>
        <script src="${scriptUri}"></script>
        </body>
    </html>`;
}
