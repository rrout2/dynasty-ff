#!/bin/bash

if [ -z "$1" ]; then
  echo "No component name provided. Exiting."
  exit 1
fi

npx generate-react-cli component $1 --path=src/components/Blueprint/v2/modules
