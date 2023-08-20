#!/bin/sh

set -e;

echo 'Waiting for Kafka to be ready...';
until cub kafka-ready -b kafka:29092 1 30; do
  echo 'Sleeping 1...';
  sleep 1
done
echo "Kafka is up and running!"

echo 'Waiting for Schema Registry to be ready...';
until cub sr-ready kafka-schema-registry 8081 30; do
  echo 'Sleeping 1...';
  sleep 1;
done
echo 'Schema Registry is up and running!'

create_schema() {
  file=$1
  name=$2

  response=$(
    curl -X POST -s \
      -o /dev/stderr \
      -w "%{http_code}"\
      -H "Content-Type: application/vnd.schemaregistry.v1+json" \
      --data @"$file" \
      kafka-schema-registry:8081/subjects/"$name"/versions
  )

  if [ "$response" -ne 200 ]; then
    echo "Error registering key schema: HTTP status code $response"
    exit 1;
  else
    echo "Schema $name registered successfully!"
  fi
}

create_schema /schema/quote/key.json quote-key
create_schema /schema/quote/value.json quote-value