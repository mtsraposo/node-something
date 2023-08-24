#!/bin/bash

set -e;

echo 'Waiting for Kafka to be ready...';
until cub kafka-ready -b kafka:29092 1 30; do
  sleep 1
done
echo "Kafka is up and running!"

while ! nc -z postgres 5432; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done
echo "Postgres is up and running!"

while ! nc -z kafka-schema-registry 8081; do
  echo "Kafka Schema Registry is unavailable - sleeping"
  sleep 1
done
echo "Kafka Schema Registry is up and running!"

yarn migrate:up && node dist/main.js;