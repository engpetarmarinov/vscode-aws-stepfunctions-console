import * as vscode from 'vscode';
import { fetchStateMachineDefinition } from './api';
import { AslVisualizationManager } from './visualizeStateMachine/aslVisualizationManager';

export function messageHandlerGetStateMachineDefinition(context: vscode.ExtensionContext, stepFunctions: any, message: any) {
    fetchStateMachineDefinition(stepFunctions, message.arn).then(async (stateMachineDescription) => {
        const manager = new AslVisualizationManager(context);
        await manager.visualizeStateMachine(stateMachineDescription.name, stateMachineDescription.definition);
    });
}
