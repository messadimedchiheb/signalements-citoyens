import { connect } from 'amqplib';
import { MongoClient } from 'mongodb';

const RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';
const MONGO_URL = 'mongodb://localhost:27017';
const QUEUE = 'notifications';

// Quel service de la Ville reçoit quel type de signalement
const DESTINATAIRES: Record<string, string> = {
  NID_DE_POULE: 'travaux-publics@ville.test',
  LAMPADAIRE: 'eclairage@ville.test',
  GRAFFITI: 'proprete@ville.test',
  DECHETS: 'collecte@ville.test',
};

async function demarrer(): Promise<void> {
  // 1. Connexion à MongoDB
  const mongo = new MongoClient(MONGO_URL);
  await mongo.connect();
  const notifications = mongo.db('signalements').collection('notifications');
  console.log('Connecte a MongoDB');

  // 2. Connexion à RabbitMQ
  const connection = await connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });
  channel.prefetch(1); // un seul message à la fois
  console.log('En attente de messages...');

  // 3. Consommer les messages
  await channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    try {
      const evenement = JSON.parse(msg.content.toString());
      const s = evenement.signalement;

      const notification = {
        signalementId: s.id,
        destinataire: DESTINATAIRES[s.categorie] ?? 'service-311@ville.test',
        canal: 'COURRIEL',
        message: `Nouveau signalement #${s.id} (${s.categorie}) : ${s.description}`,
        position: { latitude: s.latitude, longitude: s.longitude },
        creeLe: new Date(),
      };

      await notifications.insertOne(notification);
      channel.ack(msg); // "c'est traité, tu peux le retirer de la file"
      console.log(`Notification creee pour le signalement #${s.id}`);
    } catch (err) {
      console.error('Erreur de traitement', err);
      channel.nack(msg, false, false); // rejeté, sans le remettre dans la file
    }
  });
}

demarrer();