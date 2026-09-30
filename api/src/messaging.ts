import { connect, Channel } from 'amqplib';

const RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';
const EXCHANGE = 'signalements';
const QUEUE_NOTIFICATIONS = 'notifications';

let channel: Channel;

export async function initMessaging(): Promise<void> {
  const connection = await connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  // L'exchange : le centre de tri
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

  // La file : là où les messages attendent le worker
  await channel.assertQueue(QUEUE_NOTIFICATIONS, { durable: true });

  // La règle de routage : tout message "signalement.xxx" va dans la file
  await channel.bindQueue(QUEUE_NOTIFICATIONS, EXCHANGE, 'signalement.*');

  console.log('Connecte a RabbitMQ');
}

export function publierEvenement(routingKey: string, contenu: object): void {
  channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(contenu)), {
    persistent: true,
    contentType: 'application/json',
  });
}