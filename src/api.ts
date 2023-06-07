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

export async function fetchStateMachineDefinition(stepFunctions: StepFunctions, stateMachineArn: StepFunctions.Arn): Promise<StepFunctions.DescribeStateMachineOutput> {
  const params = {
    stateMachineArn,
  };

  const response = await stepFunctions.describeStateMachine(params).promise();
  return response;
}

export async function fetchExecutions(stepfunctions: StepFunctions, stateMachineArn: StepFunctions.Arn, nextToken?: StepFunctions.ListExecutionsPageToken): Promise<StepFunctions.Types.ListExecutionsOutput> {
  const params: StepFunctions.ListExecutionsInput = {
    stateMachineArn,
    maxResults: 50,
    nextToken,
  };

  const response = await stepfunctions.listExecutions(params).promise();
  return response;
}

export async function fetchExecution(stepfunctions: StepFunctions, executionArn: StepFunctions.Arn): Promise<StepFunctions.GetExecutionHistoryOutput> {
  const params: StepFunctions.GetExecutionHistoryInput = {
    executionArn,
    includeExecutionData: true
  };

  const response = await stepfunctions.getExecutionHistory(params).promise();
  return response;
}
