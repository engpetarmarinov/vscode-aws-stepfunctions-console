import * as vscode from 'vscode';
import { globals } from '../globals';
import { StepFunctions } from 'aws-sdk';
import { StateMachine } from '../models/StateMachine';

export interface MessageObject {
    command: string
    text: string
    error?: string
    stateMachineData: string
}

export class AslVisualization {
    public readonly webviewPanel: vscode.WebviewPanel;
    protected readonly disposables: vscode.Disposable[] = [];
    protected isPanelDisposed = false;
    private readonly onVisualizationDisposeEmitter = new vscode.EventEmitter<void>();
    private readonly stateMachineName: string;
    private readonly stateMachineDefinition: string;
    private readonly execution?: StepFunctions.GetExecutionHistoryOutput;
    
    public constructor(stateMachineName: string, stateMachineDefinition: string, execution?: StepFunctions.GetExecutionHistoryOutput) {
        this.stateMachineName = stateMachineName;
        this.stateMachineDefinition = stateMachineDefinition;
        this.execution = execution;
        this.webviewPanel = this.setupWebviewPanel();
    }

    public get onVisualizationDisposeEvent(): vscode.Event<void> {
        return this.onVisualizationDisposeEmitter.event;
    }

    public getPanel(): vscode.WebviewPanel | undefined {
        if (!this.isPanelDisposed) {
            return this.webviewPanel;
        }
    }

    public getWebview(): vscode.Webview | undefined {
        if (!this.isPanelDisposed) {
            return this.webviewPanel?.webview;
        }
    }

    public showPanel(): void {
        this.getPanel()?.reveal();
    }

    public async sendUpdateMessage(stateMachineData: string, executionData?: StepFunctions.GetExecutionHistoryOutput) {
        const webview = this.getWebview();
        if (this.isPanelDisposed || !webview) {
            return;
        }


        webview.postMessage({
            command: 'update',
            stateMachineData,
            executionData
        });
    }

    protected getText(textDocument: vscode.TextDocument): string {
        return textDocument.getText();
    }

    private setupWebviewPanel(): vscode.WebviewPanel {
        // Create and show panel
        const panel = this.createVisualizationWebviewPanel();

        // Set the initial html for the webpage
        panel.webview.html = this.getWebviewContent(
            panel.webview.asWebviewUri(globals.visualizationResourcePaths.webviewBodyScript),
            panel.webview.asWebviewUri(globals.visualizationResourcePaths.visualizationLibraryScript),
            panel.webview.asWebviewUri(globals.visualizationResourcePaths.visualizationLibraryCSS),
            panel.webview.asWebviewUri(globals.visualizationResourcePaths.stateMachineCustomThemeCSS),
            panel.webview.cspSource,
            {
                inSync: 'Previewing ' + this.stateMachineName,
                notInSync: 'Errors detected. Cannot preview.',
                syncing: 'Rendering ASL graph...',
            }
        );

        // Handle messages from the webview
        this.disposables.push(
            panel.webview.onDidReceiveMessage(async (message: MessageObject) => {
                switch (message.command) {
                    case 'updateResult':
                        vscode.window.showInformationMessage(message.text);
                        if (message.error) {
                            vscode.window.showErrorMessage(message.error);
                        }
                        break;
                    case 'webviewRendered': {
                        // Webview has finished rendering, so now we can give it our
                        // initial state machine definition.
                        await this.sendUpdateMessage(this.stateMachineDefinition, this.execution);
                        break;
                    }
                }
            })
        );

        // When the panel is closed, dispose of any disposables/remove subscriptions
        const disposePanel = () => {
            if (this.isPanelDisposed) {
                return;
            }
            this.isPanelDisposed = true;
            this.onVisualizationDisposeEmitter.fire();
            this.disposables.forEach(disposable => {
                disposable.dispose();
            });
            this.onVisualizationDisposeEmitter.dispose();
        };

        this.disposables.push(
            panel.onDidDispose(() => {
                disposePanel();
            })
        );

        return panel;
    }

    private createVisualizationWebviewPanel(): vscode.WebviewPanel {
        return vscode.window.createWebviewPanel(
            'stateMachineVisualization',
            'Graph: ' + this.stateMachineName,
            {
                preserveFocus: true,
                viewColumn: vscode.ViewColumn.Beside,
            },
            {
                enableScripts: true,
                localResourceRoots: [
                    globals.visualizationResourcePaths.localWebviewScriptsPath,
                    globals.visualizationResourcePaths.stateMachineCustomThemePath,
                ],
                retainContextWhenHidden: true,
            }
        );
    }

    private getWebviewContent(
        webviewBodyScript: vscode.Uri,
        graphStateMachineLibrary: vscode.Uri,
        vsCodeCustomStyling: vscode.Uri,
        graphStateMachineDefaultStyles: vscode.Uri,
        cspSource: string,
        statusTexts: {
            syncing: string
            notInSync: string
            inSync: string
        }
    ): string {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta http-equiv="Content-Security-Policy"
                    content="default-src 'none';
                    img-src ${cspSource} https: data:;
                    script-src ${cspSource} 'self';
                    style-src ${cspSource};"
                    >
                    <meta charset="UTF-8">
                    <link rel="stylesheet" href='${graphStateMachineDefaultStyles}'>
                    <link rel="stylesheet" href='${vsCodeCustomStyling}'>
                    <script src='${graphStateMachineLibrary}'></script>
                </head>

                <body>
                    <div id="svgcontainer" class="workflowgraph">
                        <svg></svg>
                    </div>
                    <div class="status-info">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="42" stroke-width="4" />
                        </svg>
                        <div class="status-messages">
                            <span class="previewing-asl-message">${statusTexts.inSync}</span>
                            <span class="rendering-asl-message">${statusTexts.syncing}</span>
                            <span class="error-asl-message">${statusTexts.notInSync}</span>
                        </div>
                    </div>
                    <div class="graph-buttons-container">
                        <button id="zoomin">
                            <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                                <line x1="8" y1="1" x2="8" y2="15"></line>
                                <line x1="15" y1="8" x2="1" y2="8"></line>
                            </svg>
                        </button>
                        <button id="zoomout">
                            <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                                <line x1="15" y1="8" x2="1" y2="8"></line>
                            </svg>
                        </button>
                        <button id="center">
                            <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                                <circle cx="8" cy="8" r="7" stroke-width="2" />
                                <circle cx="8" cy="8" r="1" stroke-width="2" />
                            </svg>
                        </button>
                    </div>

                    <script src='${webviewBodyScript}'></script>
                </body>
            </html>`;
    }

    private trackedDocumentDoesExist(trackedDocumentURI: vscode.Uri): boolean {
        const document = vscode.workspace.textDocuments.find(doc => doc.fileName === trackedDocumentURI.fsPath);

        return document !== undefined;
    }
}
