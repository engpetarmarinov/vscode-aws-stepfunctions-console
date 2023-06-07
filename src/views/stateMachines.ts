import StepFunctions = require('aws-sdk/clients/stepfunctions');
import * as vscode from 'vscode';
import { StateMachine } from '../models/StateMachine';
import { join } from 'path';

let stateMachineExecutionsPrevTokens: Map<StepFunctions.Arn, Array<StepFunctions.ListExecutionsPageToken>> = new Map<StepFunctions.Arn, Array<StepFunctions.ListExecutionsPageToken>>();

function getExecutionsPrevToken(stateMachineArn: StepFunctions.Arn, currentToken?: StepFunctions.ListExecutionsPageToken): StepFunctions.ListExecutionsPageToken | undefined {
    const existingTokens = stateMachineExecutionsPrevTokens.get(stateMachineArn);
    if (!existingTokens) {
        return undefined;
    }

    for (let i = 0; i < existingTokens.length; i++) {
        if (existingTokens[i] === currentToken) {
            return existingTokens[i - 1];
        }
    }

    return undefined;
}

function setExecutionsPrevToken(stateMachineArn: StepFunctions.Arn, currentToken?: StepFunctions.ListExecutionsPageToken): void {
    if (!currentToken) {
        return;
    }

    const existingTokens = stateMachineExecutionsPrevTokens.get(stateMachineArn);
    if (!existingTokens) {
        stateMachineExecutionsPrevTokens.set(stateMachineArn, [currentToken]);
        return;
    }

    for (let i = 0; i < existingTokens.length; i++) {
        if (existingTokens[i] === currentToken) {
            return;
        }
    }

    existingTokens.push(currentToken);
    stateMachineExecutionsPrevTokens.set(stateMachineArn, existingTokens);
}

export function getStateMachinesWebview(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, stateMachines: StepFunctions.StateMachineList): string {
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(context.asAbsolutePath(join('resources', 'js', 'stateMachines.js'))));
    const cssUri = panel.webview.asWebviewUri(vscode.Uri.file(context.asAbsolutePath(join('resources', 'css', 'stateMachines.css'))));
    const cspSource = panel.webview.cspSource;

    let stateMachineList: StateMachine[] = [];
    stateMachines.forEach((stateMachine) => {
        stateMachineList.push(new StateMachine(stateMachine.name, stateMachine.stateMachineArn, stateMachine.type));
    });

    return `<html>
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy"
                    content="default-src 'none';
                    img-src ${cspSource} https: data:;
                    script-src ${cspSource} 'self';
                    style-src ${cspSource};"
                    >
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AWS Step Functions State Machines</title>
            <link rel="stylesheet" href="${cssUri}">
        </head>
        <body>
        <h1>AWS Step Functions State Machines:</h1>
        <ul>
            ${stateMachineList.map((stateMachine) => `<li class="state-machine-list-btn" data-state-machine-arn="${stateMachine.arn}">${stateMachine.name}</li>`).join("\n")}
        </ul>
        <script src="${scriptUri}"></script>
        </body>
    </html>`;
}

export function getStateMachineExecutionsWebview(
    context: vscode.ExtensionContext,
    panel: vscode.WebviewPanel,
    stateMachineArn: StepFunctions.Arn,
    executionList: StepFunctions.Types.ListExecutionsOutput,
    currentToken?: StepFunctions.ListExecutionsPageToken): string {
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(context.asAbsolutePath(join('resources', 'js', 'stateMachines.js'))));
    const cssUri = panel.webview.asWebviewUri(vscode.Uri.file(context.asAbsolutePath(join('resources', 'css', 'stateMachines.css'))));
    const cspSource = panel.webview.cspSource;

    const prevToken = getExecutionsPrevToken(stateMachineArn, currentToken);
    setExecutionsPrevToken(stateMachineArn, currentToken);

    return `<html>
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy"
                    content="default-src 'none';
                    img-src ${cspSource} https: data:;
                    script-src ${cspSource} 'self';
                    style-src ${cspSource};"
                    >
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AWS Step Functions State Machines</title>
            <link rel="stylesheet" href="${cssUri}">
        </head>
        <body>
        <h1>AWS Step Functions State Machine Executions:</h1>
        <a href="#" class="state-machines-btn">&lt;&lt; Back to State Machines</a>
        <ul data-state-machine-arn="${stateMachineArn}">
            ${executionList.executions.map((execution: StepFunctions.ExecutionListItem) =>
        `<li class="state-machine-execution-list-btn" data-state-machine-execution-arn="${execution.executionArn}">
                    ${execution.startDate} ${execution.name} ${execution.status}
                </li>`
    ).join("\n")}
        </ul>
        <div class="pagination-container">
            <a href="#" ${prevToken || currentToken ? "" : "disabled"} class="state-machine-execution-list-next-btn" data-next-token="${prevToken ? prevToken : ''}">&lt;&lt; Prev</a>
            <a href="#" ${executionList.nextToken ? "" : "disabled"} class="state-machine-execution-list-next-btn" data-next-token="${executionList.nextToken}">Next &gt;&gt;</a>
        </div>
        <script src="${scriptUri}"></script>
        </body>
    </html>`;
}


export function getStateMachineExecutionWebview(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, stateMachineArn: StepFunctions.Arn, execution: StepFunctions.GetExecutionHistoryOutput): string {
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(context.asAbsolutePath(join('resources', 'js', 'stateMachines.js'))));
    const cssUri = panel.webview.asWebviewUri(vscode.Uri.file(context.asAbsolutePath(join('resources', 'css', 'stateMachines.css'))));
    const cspSource = panel.webview.cspSource;

    return `<html>
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy"
                    content="default-src 'none';
                    img-src ${cspSource} https: data:;
                    script-src ${cspSource} 'self';
                    style-src ${cspSource};"
                    >
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
