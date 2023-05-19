import * as vscode from 'vscode';
import { join } from 'path';

export let globals = {
    visualizationResourcePaths: {},
} as Globals;

interface Globals {
    visualizationResourcePaths: VisualizationResourcePaths
}

interface VisualizationResourcePaths {
    localWebviewScriptsPath: vscode.Uri
    webviewBodyScript: vscode.Uri
    visualizationLibraryScript: vscode.Uri
    visualizationLibraryCSS: vscode.Uri
    stateMachineCustomThemePath: vscode.Uri
    stateMachineCustomThemeCSS: vscode.Uri
}

export function initalizeVisualizationResourcePaths(
    context: vscode.ExtensionContext
): VisualizationResourcePaths {
    // Location for script in body of webview that handles input from user
    // and calls the code to render state machine graph

    return {
        localWebviewScriptsPath: vscode.Uri.file(context.asAbsolutePath(join('resources', 'js'))),
        webviewBodyScript: vscode.Uri.file(context.asAbsolutePath(join('resources', 'js', 'graphStateMachine.js'))),
        visualizationLibraryScript: vscode.Uri.file(context.asAbsolutePath(join('resources', 'js', 'graph.js'))),
        visualizationLibraryCSS: vscode.Uri.file(context.asAbsolutePath(join('resources', 'css', 'graph.css'))),
        stateMachineCustomThemePath: vscode.Uri.file(context.asAbsolutePath(join('resources', 'css'))),
        stateMachineCustomThemeCSS: vscode.Uri.file(
            context.asAbsolutePath(join('resources', 'css', 'stateMachineRender.css'))
        ),
    };
}
