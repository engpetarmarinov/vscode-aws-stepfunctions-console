import StepFunctions = require('aws-sdk/clients/stepfunctions');
import * as vscode from 'vscode';
import { StateMachine } from '../models/StateMachine';

export function getStateMachineDefinitionWebview(
  context: vscode.ExtensionContext,
  panel: vscode.WebviewPanel,
  stateMachineDefinition: StepFunctions.DescribeStateMachineOutput
): string {
  // Extract state machine definition
  const definition = JSON.parse(stateMachineDefinition.definition);
  vscode.window.showInformationMessage(stateMachineDefinition.definition);

  // Convert the definition to a hierarchy tree structure
  const treeData = convertToTreeData(definition);

  const scriptUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src", "js", "treeview.js"));
  const cssUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src", "css", "webview.css"));

  return `<html>
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${panel.webview.cspSource} https://d3js.org 'unsafe-inline';; style-src ${panel.webview.cspSource};">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>AWS Step Functions State Machines</title>
          <link rel="stylesheet" href="${cssUri}">
          <script src="https://d3js.org/d3.v6.min.js"></script>
      </head>
      <body>
      ${definition}
      <svg id="tree-container"></svg>
      <script src="${scriptUri}"></script>
      <script>
        renderTree(${JSON.stringify(treeData)});
      </script>
      </body>
  </html>`;
}

// Convert the definition to a hierarchy tree structure
function convertToTreeData(definition: any): any {
  if (!definition) {
    return { name: 'Unknown' };
  }
  if (definition.StartAt) {
    const root: any = {
      name: definition.StartAt,
      children: [],
    };
    const nodes = Object.keys(definition.States || {});
    nodes.forEach(node => {
      const state = definition.States![node];
      if (state.Type === 'Parallel') {
        const parallelNode = {
          name: node,
          children: state.Branches.map((branch: any) =>
            convertToTreeData(branch)
          ),
        };
        root.children.push(parallelNode);
      } else if (state.Type === 'Choice') {
        const choiceNode = {
          name: node,
          children: state.Choices.map((choice: any) =>
            convertToTreeData(choice.Next)
          ),
        };
        root.children.push(choiceNode);
      } else if (state.Type === 'Map') {
        const mapNode = {
          name: node,
          children: [convertToTreeData(state.Iterator)],
        };
        root.children.push(mapNode);
      } else {
        root.children.push({ name: node });
      }
    });
    return root;
  } else {
    return { name: 'Unknown' };
  }
}

export function getStateMachinesWebview(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, stateMachines: StepFunctions.StateMachineList): string {
  const scriptUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src", "js", "webview.js"));
  const cssUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "src", "css", "webview.css"));

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
