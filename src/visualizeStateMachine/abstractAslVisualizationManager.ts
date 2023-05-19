import * as vscode from 'vscode';
import { AslVisualization } from './aslVisualization';
import { Error } from 'aws-sdk/clients/servicecatalog';


export abstract class AbstractAslVisualizationManager<T extends AslVisualization = AslVisualization> {
    protected abstract readonly name: string;
    protected readonly managedVisualizations = new Map<string, T>();

    public constructor(private readonly extensionContext: vscode.ExtensionContext) {}

    public abstract visualizeStateMachine(
        stateMachineName: string,
        stateMachineDefinition: string
    ): Promise<vscode.WebviewPanel | undefined>;

    protected pushToExtensionContextSubscriptions(visualizationDisposable: vscode.Disposable): void {
        this.extensionContext.subscriptions.push(visualizationDisposable);
    }

    protected handleErr(err: Error): void {
        vscode.window.showInformationMessage(
            'There was an error rendering State Machine Graph, check logs for details.'
        );
    }

    public getManagedVisualizations(): Map<string, T> {
        return this.managedVisualizations;
    }

    protected handleNewVisualization(key: string, visualization: T): void {
        this.managedVisualizations.set(key, visualization);

        const visualizationDisposable = visualization.onVisualizationDisposeEvent(() => {
            this.managedVisualizations.delete(key);
        });
        this.pushToExtensionContextSubscriptions(visualizationDisposable);
    }

    protected getExistingVisualization(key: string): T | undefined {
        return this.managedVisualizations.get(key);
    }
}
