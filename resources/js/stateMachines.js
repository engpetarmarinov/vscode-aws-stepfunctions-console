const vscode = acquireVsCodeApi();

document.querySelectorAll('.state-machines-btn').forEach((li) => {
  li.addEventListener('click', (e) => {
    const nextToken = e.target.getAttribute('data-next-token');
    vscode.postMessage({
      command: 'getStateMachines',
      nextToken: nextToken ? nextToken : undefined
    });
  });
});

document.querySelectorAll('.state-machine-list-btn').forEach((li) => {
  li.addEventListener('click', (e) => {
    const stateMachineArn = e.target.getAttribute('data-state-machine-arn');
    vscode.postMessage({
      command: 'getStateMachineDefinition',
      arn: stateMachineArn
    });
    vscode.postMessage({
      command: 'getStateMachineExecutions',
      arn: stateMachineArn
    });
  });
});

document.querySelectorAll('.state-machine-execution-list-btn').forEach((li) => {
  li.addEventListener('click', (e) => {
    const executionArn = e.target.getAttribute('data-state-machine-execution-arn');
    const element = document.querySelector('[data-state-machine-arn]');
    const stateMachineArn = element.getAttribute('data-state-machine-arn');
    vscode.postMessage({
      command: 'getStateMachineExecution',
      executionArn: executionArn,
      stateMachineArn: stateMachineArn
    });
  });
});

document.querySelectorAll('.state-machine-executions-btn').forEach((li) => {
  li.addEventListener('click', (e) => {
    const element = document.querySelector('[data-state-machine-arn]');
    const stateMachineArn = element.getAttribute('data-state-machine-arn');
    vscode.postMessage({
      command: 'getStateMachineExecutions',
      arn: stateMachineArn
    });
  });
});

document.querySelectorAll('.state-machine-list-next-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const nextToken = e.target.getAttribute('data-next-token');
    vscode.postMessage({
      command: 'getStateMachines',
      nextToken: nextToken ? nextToken : undefined
    });
  });
});

document.querySelectorAll('.state-machine-execution-list-next-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const element = document.querySelector('[data-state-machine-arn]');
    const stateMachineArn = element.getAttribute('data-state-machine-arn');
    const nextToken = e.target.getAttribute('data-next-token');
    vscode.postMessage({
      command: 'getStateMachineExecutions',
      arn: stateMachineArn,
      nextToken: nextToken ? nextToken : undefined
    });
  });
});
