#!/bin/bash

set -e;

retries=0;

echo 'Waiting for Kafka to be ready...';
while ! nc -z kafka 29092; do
  sleep $((2 ** "$retries"))
done
echo "Kafka is up and running!"

echo "Waiting for Postgres to be available"
while ! nc -z postgres 5432; do
  echo "Postgres is unavailable - sleeping"
  sleep $((2 ** "$retries"))
done
echo "Postgres is up and running!"

echo "Waiting for Kafka Connect to be available"
while ! nc -z kafka-connect 8083; do
  echo "Kafka Connect is unavailable - sleeping"
  sleep $((2 ** "$retries"))
done
echo "Kafka Connect is up and running!"

yarn migrate:up && node dist/main.js;