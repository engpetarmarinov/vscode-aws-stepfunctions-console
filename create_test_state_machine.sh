#!/bin/bash
docker run -d -p 8083:8083 --name vscode-stepfunctions-console amazon/aws-stepfunctions-local

aws stepfunctions --endpoint-url http://localhost:8083 create-state-machine --definition "$(cat ./hello-world.asl.json)" --name "Hello-World"\
 --role-arn arn:aws:iam::012345678901:role/DummyRole --region us-east-1

 aws stepfunctions --endpoint-url http://localhost:8083 create-state-machine --definition "$(cat ./parallel.asl.json)" --name "Parallel"\
 --role-arn arn:aws:iam::012345678901:role/DummyRole --region us-east-1
