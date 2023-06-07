import * as vscode from 'vscode';
import { fetchStateMachines, fetchStateMachineDefinition, fetchExecutions, fetchExecution } from './api';
import { AslVisualizationManager } from './visualizeStateMachine/aslVisualizationManager';
import { StepFunctions } from 'aws-sdk';
import { getStateMachinesWebview, getStateMachineExecutionsWebview, getStateMachineExecutionWebview } from './views/stateMachines';

let lastExecution: StepFunctions.GetExecutionHistoryOutput = { events: [] };

export function handleGetStateMachines(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, stepFunctions: StepFunctions, message: any) {
    fetchStateMachines(stepFunctions, message.nextToken).then(async (stateMachines: StepFunctions.ListStateMachinesOutput) => {
        panel.webview.html = getStateMachinesWebview(context, panel, stateMachines, message.nextToken);
    });
}

export function handleGetStateMachineDefinition(context: vscode.ExtensionContext, stepFunctions: StepFunctions, message: any) {
    fetchStateMachineDefinition(stepFunctions, message.arn).then(async (stateMachineDescription: StepFunctions.DescribeStateMachineOutput) => {
        const manager = new AslVisualizationManager(context);
        await manager.visualizeStateMachine(stateMachineDescription.name, stateMachineDescription.definition);
    });
}

export function handleGetStateMachineExecutions(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, stepFunctions: StepFunctions, message: any) {
    fetchExecutions(stepFunctions, message.arn, message.nextToken).then((executionList: StepFunctions.Types.ListExecutionsOutput) => {
        panel.webview.html = getStateMachineExecutionsWebview(context, panel, message.arn, executionList, message.nextToken);
    });
}

export function handleGetStateMachineExecution(context: vscode.ExtensionContext, panel: vscode.WebviewPanel, stepFunctions: StepFunctions, message: any) {
    fetchStateMachineDefinition(stepFunctions, message.stateMachineArn).then(async (stateMachineDescription: StepFunctions.DescribeStateMachineOutput) => {
        fetchExecution(stepFunctions, message.executionArn).then(async (execution: StepFunctions.GetExecutionHistoryOutput) => {
            panel.webview.html = getStateMachineExecutionWebview(context, panel, message.stateMachineArn, execution);
            const manager = new AslVisualizationManager(context);
            await manager.visualizeStateMachine(stateMachineDescription.name, stateMachineDescription.definition, execution);
            lastExecution = execution;
        });
    });
}
