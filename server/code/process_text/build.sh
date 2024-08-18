#!/usr/bin/env bash
cd "$(dirname "$0")"
docker build -t processing-img:latest . || { echo 'Docker build failed'; exit 1; }
# aws ecr create-repository --repository-name seng3011-f11a-crunch-processing --region ap-southeast-2 || { echo 'Repo creation failed'; exit 1; }
aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin 381491885579.dkr.ecr.ap-southeast-2.amazonaws.com 
docker tag processing-img:latest 381491885579.dkr.ecr.ap-southeast-2.amazonaws.com/seng3011-f11a-crunch-processing:latest
docker push 381491885579.dkr.ecr.ap-southeast-2.amazonaws.com/seng3011-f11a-crunch-processing:latest
