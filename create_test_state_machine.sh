#!/bin/bash

# Start aws-stepfunctions-local
docker rm -f vscode-stepfunctions-console && docker run -d --rm -p 8084:8083 --name vscode-stepfunctions-console amazon/aws-stepfunctions-local

# Create state machines
aws stepfunctions --endpoint-url http://localhost:8084 create-state-machine --definition "$(cat ./hello-world.asl.json)" --name "Hello-World"\
 --role-arn arn:aws:iam::012345678901:role/DummyRole --region us-east-1
aws stepfunctions --endpoint-url http://localhost:8084 create-state-machine --definition "$(cat ./parallel.asl.json)" --name "Parallel"\
 --role-arn arn:aws:iam::012345678901:role/DummyRole --region us-east-1

# Start executions
aws stepfunctions --endpoint-url http://localhost:8084 start-execution --state-machine-arn arn:aws:states:us-east-1:123456789012:stateMachine:Hello-World
aws stepfunctions --endpoint-url http://localhost:8084 start-execution --state-machine-arn arn:aws:states:us-east-1:123456789012:stateMachine:Hello-World
aws stepfunctions --endpoint-url http://localhost:8084 start-execution --state-machine-arn arn:aws:states:us-east-1:123456789012:stateMachine:Parallel
aws stepfunctions --endpoint-url http://localhost:8084 start-execution --state-machine-arn arn:aws:states:us-east-1:123456789012:stateMachine:Parallel
aws stepfunctions --endpoint-url http://localhost:8084 start-execution --state-machine-arn arn:aws:states:us-east-1:123456789012:stateMachine:Parallel
