#!/bin/bash

set -e;

yarn migrate:up && node dist/main.js;