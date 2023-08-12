#!/bin/sh

echo 'Waiting for Kafka to be ready...';

cub kafka-ready -b kafka:29092 1 30;

topics="dev.binance.quote.received.v1.json dev.binance.quote.processed.v1.json";

for topic in $topics; do
    kafka-topics --create --if-not-exists \
    --topic "$topic" \
    --partitions 1 \
    --replication-factor 1 \
    --bootstrap-server kafka:29092
done