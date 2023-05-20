/* Copyright 2020 Confluent Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * =============================================================================
 *
 * Produce messages to Confluent Cloud
 * Using the node-rdkafka client for Apache Kafka
 *
 * =============================================================================
 */ 

const Kafka = require('node-rdkafka');

const ERR_TOPIC_ALREADY_EXISTS = 36;

function ensureTopicExists() {
  const adminClient = Kafka.AdminClient.create({
    'bootstrap.servers': process.env.bootstrap_servers,
    'sasl.username': process.env.sasl_username,
    'sasl.password': process.env.sasl_password,
    'security.protocol': process.env.security_protocol,
    'sasl.mechanisms': process.env.sasl_mechanisms
  });

  return new Promise((resolve, reject) => {
    adminClient.createTopic({
      topic: process.env.topic,
      num_partitions: 1,
      replication_factor: 3
    }, (err) => {
      if (!err) {
        console.log(`Created topic ${process.env.topic}`);
        return resolve();
      }

      if (err.code === ERR_TOPIC_ALREADY_EXISTS) {
        return resolve();
      }

      return reject(err);
    });
  });
}

function createProducer(onDeliveryReport) {
  const producer = new Kafka.Producer({
    'bootstrap.servers': process.env.bootstrap_servers,
    'sasl.username': process.env.sasl_username,
    'sasl.password': process.env.sasl_password,
    'security.protocol': process.env.security_protocol,
    'sasl.mechanisms': process.env.sasl_mechanisms,
    'dr_msg_cb': true
  });

  return new Promise((resolve, reject) => {
    producer
      .on('ready', () => resolve(producer))
      .on('delivery-report', onDeliveryReport)
      .on('event.error', (err) => {
        console.warn('event.error', err);
        reject(err);
      });
    producer.connect();
  });
}

async function produceRecommendation(nome, mensagem, filmeOuSerie, categoria) {

  if (process.env.usage) {
    return console.log(process.env.usage);
  }

  await ensureTopicExists();

  const producer = await createProducer((err, report) => {
    if (err) {
      console.warn('Error producing', err)
    } else {
      const {topic, partition, value} = report;
      console.log(`Successfully produced record to topic "${topic}" partition ${partition} ${value}`);
    }
  });

  const key = 'recommendation';
  const value = Buffer.from(JSON.stringify({
      nome: nome,
      mensagem: mensagem,
      filmeOuSerie: filmeOuSerie,
      categoria: categoria,
      data: (new Date()).toLocaleString()
  }));

  console.log(`Producing record ${key}\t${value}`);

  producer.produce(process.env.topic, -1, value, key);

  producer.flush(10000, () => {
    producer.disconnect();
  });
}

produceRecommendation()
  .catch((err) => {
    console.error(`Something went wrong:\n${err}`);
    process.exit(1);
  });

exports.produceRecommendation = produceRecommendation;