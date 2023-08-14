FROM confluentinc/cp-kafka-connect:7.2.1

COPY bin/start_kafka_connect.sh /bin/

RUN confluent-hub install --no-prompt confluentinc/kafka-connect-jdbc:10.7.4