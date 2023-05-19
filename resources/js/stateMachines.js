const vscode = acquireVsCodeApi();

document.querySelectorAll('.state-machine-list-btn').forEach((li) => {
  li.addEventListener('click', (e) => {
    const stateMachineArn = e.target.getAttribute('data-state-machine-arn');
    vscode.postMessage({
        command: 'getStateMachineDefinition',
        arn: stateMachineArn
    });
  });
});
