import * as vscode from 'vscode';

import { AbstractAslVisualizationManager } from './abstractAslVisualizationManager';
import { AslVisualization } from './aslVisualization';
import { StepFunctions } from 'aws-sdk';

export class AslVisualizationManager extends AbstractAslVisualizationManager {
    protected readonly name: string = 'AslVisualizationManager';

    public constructor(extensionContext: vscode.ExtensionContext) {
        super(extensionContext);
    }

    public async visualizeStateMachine(
        stateMachineName: string,
        stateMachineDefinition: string,
        execution?: StepFunctions.GetExecutionHistoryOutput
    ): Promise<vscode.WebviewPanel | undefined> {

        // Attempt to retrieve existing visualization if it exists.
        const existingVisualization = this.getExistingVisualization(stateMachineName);
        if (existingVisualization) {
            existingVisualization.showPanel();

            return existingVisualization.getPanel();
        }

        // Existing visualization does not exist, construct new visualization
        try {
            const newVisualization = new AslVisualization(stateMachineName, stateMachineDefinition, execution);
            this.handleNewVisualization(stateMachineName, newVisualization);

            return newVisualization.getPanel();
        } catch (err) {
            this.handleErr(err as string);
        }
    }
}
