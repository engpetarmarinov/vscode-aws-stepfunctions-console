const vscode = acquireVsCodeApi();

let containerId = '#svgcontainer';
let graph;

function renderStateMachine(data) {
    let options = {
        width: window.innerWidth,
        height: window.innerHeight,
        resizeHeight: false,
    };
    graph = new sfn.StateMachineGraph(JSON.parse(data), containerId, options);
    graph.render();
}

function renderExecution(data, execution) {
    let options = {
        width: window.innerWidth,
        height: window.innerHeight,
        resizeHeight: false,
    };
    graph = new sfn.StateMachineExecutionGraph(JSON.parse(data), execution, containerId, options);
    graph.render();
}

const centerBtn = document.getElementById('center');
const zoominBtn = document.getElementById('zoomin');
const zoomoutBtn = document.getElementById('zoomout');
let lastStateMachineData;
let lastExecutionData;

function updateGraph(message) {
    let options = {
        width: window.innerWidth,
        height: window.innerHeight,
        resizeHeight: false,
    };

    statusInfoContainer.classList.remove('in-sync-asl', 'not-in-sync-asl', 'start-error-asl');
    statusInfoContainer.classList.add('syncing-asl');

    try {
        if (message.executionData) {
            renderExecution(message.stateMachineData, message.executionData);
        } else {
            renderStateMachine(message.stateMachineData);
        }

        vscode.postMessage({
            command: 'updateResult',
            text: 'Successfully updated state machine graph.',
            stateMachineData: message.stateMachineData,
        });
        statusInfoContainer.classList.remove('syncing-asl', 'not-in-sync-asl', 'start-error-asl');
        statusInfoContainer.classList.add('in-sync-asl');
        hasRenderedOnce = true;
        lastStateMachineData = message.stateMachineData;
        lastExecutionData = message.executionData;
    } catch (err) {
        console.log('Error parsing state machine definition.');
        console.log(err);

        vscode.postMessage({
            command: 'updateResult',
            text: 'Error parsing state machine definition.',
            error: err.toString(),
            stateMachineData: message.stateMachineData,
        });

        statusInfoContainer.classList.remove('syncing-asl', 'in-sync-asl', 'start-error-asl');

        if (hasRenderedOnce) {
            statusInfoContainer.classList.add('not-in-sync-asl');
        } else {
            statusInfoContainer.classList.add('start-error-asl');
        }
    }
}

const statusInfoContainer = document.querySelector('.status-info');
const previewButton = document.querySelector('.previewing-asl-message a');
let hasRenderedOnce = false;

if (previewButton) {
    previewButton.addEventListener('click', () => {
        vscode.postMessage({ command: 'viewDocument' });
    });
}

centerBtn.addEventListener('click', () => {
    if (lastStateMachineData) {
        if (lastExecutionData) {
            renderExecution(lastStateMachineData, lastExecutionData);
        } else {
            renderStateMachine(lastStateMachineData);
        }
    }
});

zoominBtn.addEventListener('click', () => {
    if (graph) {
        graph.zoomIn();
    }
});

zoomoutBtn.addEventListener('click', () => {
    if (graph) {
        graph.zoomOut();
    }
});

// Message passing from extension to webview.
// Capture state machine definition
window.addEventListener('message', event => {
    // event.data is object passed in from postMessage from vscode
    const message = event.data;
    switch (message.command) {
        case 'update': {
            updateGraph(message);
            break;
        }
    }
});

// Let vscode know that the webview is finished rendering
vscode.postMessage({
    command: 'webviewRendered',
    text: 'Webivew has finished rendering and is visible',
});
