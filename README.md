# Node Something (or Node _Algo_)

This is a work-in-progress connector to major crypto and fiat exchanges, to serve as an engine for algorithmic trading.
Currently, only Binance is supported.

## Setup
You'll need to fill out a file similar to `.env.template` with environment variables. The ones related to Binance can be
obtained by following the [documentation](https://testnet.binance.vision).
You'll also need private key files saved at the root of `node-something/node`.
This is a suggestion on how those should be named (configuration to change accordingly): 
- prod-prv-key.pem
- prod-pub-key.pem
- unit-test-prv-key.pem
- unit-test-pub-key.pem

## To run in Docker (recommended)

```
   $ docker-compose up --build
```

## To run locally

```
   $ yarn start
```

## To run the tests

```
   node-something/node $ yarn test
```

## TODO

-   [ ] Persist balances
-   [ ] Set up a regular Kafka topic for trading orders
-   [ ] Set up Python project
-   [ ] Set up cron to train model and consider Apache Airflow

# Roadmap:

There are three major strategy types for node-something:
    - high latency / high throughput: Python,
    - low latency / high throughput: Kafka Streams ML pipeline,
    - and ultra-low latency: C++.

Here's a more detailed overview, in order of priority for this project:

1. **High Latency / High Throughput**:
    - **Use Case**: More complex strategies, perhaps involving deep learning or other ML models that require significant computational resources. These strategies might look for patterns over longer periods, e.g., hours or days.
    - **Tech Stack**:
        - Python is often the language of choice, given its extensive ecosystem for data processing and ML (e.g., TensorFlow, PyTorch, Pandas).
        - Kafka for ingesting and perhaps emitting decisions, but the primary analysis is off the critical path.
        - Cloud platforms with GPU support for model training.
        - Databases like TimescaleDB, InfluxDB, or even cloud databases like BigQuery for storing and analyzing vast datasets.

2. **Low Latency / High Throughput**:
    - **Use Case**: Quantitative trading strategies where you're dealing with a larger volume of data (e.g., various data sources beyond price/tick data) and need to process it quickly but not necessarily at HFT speeds.
    - **Tech Stack**:
        - Kafka and Kafka Streams for processing large volumes of data in near real-time.
        - Java (or Scala) for Kafka Streams applications. While they are higher-level languages compared to C++, they still offer good performance and are more maintainable and scalable in many situations.
        - Machine Learning models (possibly pre-trained) for prediction within the Kafka Streams app.
        - Databases like kdb+/q or TimescaleDB for historical data storage and querying.

3. **Ultra-Low Latency**:
    - **Use Case**: Primarily used by high-frequency trading (HFT) firms. Trades are often based on small price inefficiencies that disappear in milliseconds, so speed is paramount.
    - **Tech Stack**:
        - Typically involves C++ for algorithm development.
        - FPGA for processing market data feeds and order execution.
        - Direct market data feeds and custom UDP protocols for minimal networking overhead.
        - Co-location with the exchange to reduce network latency.
        - Minimal to no reliance on traditional databases for real-time decision making; data is often kept in-memory.