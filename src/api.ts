import { StepFunctions } from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';

export function createStepFunctionsClient(region: string, endpoint: string): StepFunctions {
  let config:ServiceConfigurationOptions = {
    region: region,
  };

  if (endpoint.length > 0) {
    config.endpoint = endpoint;
  }

  return new StepFunctions(config);
}

export async function fetchStateMachines(stepFunctions: StepFunctions): Promise<StepFunctions.StateMachineList> {
  const response = await stepFunctions.listStateMachines().promise();
  return response.stateMachines;
}

export async function fetchExecutions(stepfunctions: StepFunctions, stateMachineArn: string): Promise<StepFunctions.ExecutionList> {
  const params = {
    stateMachineArn,
    // statusFilter: 'RUNNING'
  };

  const response = await stepfunctions.listExecutions(params).promise();
  return response.executions;
}
