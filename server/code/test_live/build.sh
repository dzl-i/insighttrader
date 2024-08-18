#!/usr/bin/env bash

cd `dirname $0`
rm -r ./package/
pip install -r requirements.txt -t ./package/
cd ./package/
cp -r . ../ && rm -r ../package/
