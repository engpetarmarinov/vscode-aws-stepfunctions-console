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
    addNodeClickHandler();
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
        case 'showInputOutput': {
            showInputOutput(message.input, message.output);
        }
    }
});

// Let vscode know that the webview is finished rendering
vscode.postMessage({
    command: 'webviewRendered',
    text: 'Webivew has finished rendering and is visible',
});

function addNodeClickHandler() {
    const nodes = document.querySelectorAll('g.node.state:not(.NotYetStarted):not(.Container)');
    nodes.forEach( (clickedElement) => {
        clickedElement.removeEventListener('click', event => {});
        clickedElement.addEventListener('click', event => {
            event.pa
            // check if event.target is a the element containing class state or a child of it
            const nodeElement = event.target.hasAttribute('class') && event.target.getAttribute('class').includes('state') ? event.target : event.target.parentElement;
            const stateName = nodeElement.querySelector('tspan').textContent
            if (!stateName) {
                return;
            }
            vscode.postMessage({
                command: 'getInputOutput',
                text: stateName,
            });
        });
    });
}


// showInputOutput displays the input and output of a state in a centered modal and the modal is closed when the user clicks outside of the modal
function showInputOutput(input, output) {
    const modal = document.getElementById('input-output-modal');
    const modalCloseBtn = document.getElementById('input-output-modal-close-btn');
    const modalInput = document.getElementById('input-output-modal-input');
    const modalOutput = document.getElementById('input-output-modal-output');

    modalInput.innerHTML = JSON.stringify(JSON.parse(input), null, 2);
    modalOutput.innerHTML = JSON.stringify(JSON.parse(output), null, 2);

    modal.style.display = 'block';

    modalCloseBtn.onclick = () =>{
        modal.style.display = 'none';
    };

    window.onclick = event => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}
