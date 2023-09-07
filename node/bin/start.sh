#!/bin/bash
set -e;

wait_for() {
  if [ "$#" -ne 3 ]; then
    echo "Usage: wait_for service host port"
    return 1
  fi

  service=$1
  host=$2
  port=$3
  retries=0
  max_retries=10

  echo "Waiting for $service to be ready..."
  while ! nc -z "$host" "$port"; do
    if [ "$retries" -ge "$max_retries" ]; then
      echo "$service didn't become ready in time."
      exit 1
    fi

    echo "$service not ready yet. Sleeping for $((2 ** retries))s."
    sleep $((2 ** retries))
    : $((retries++))
  done

  echo "$service is up and running!"
}

wait_for "Kafka" "kafka" 29092;
wait_for "Postgres" "postgres" 5432;
wait_for "Kafka Connect" "kafka-connect" 8083;

yarn migrate:up && node dist/main.js;