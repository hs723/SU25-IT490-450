const amqp = require('amqplib');

async function sendToVM(targetVM, payload) {
  const connection = await amqp.connect('amqp://cjs77:admin@100.107.198.79'); 
  const channel = await connection.createChannel();

  const exchange = 'vm_exchange';
  await channel.assertExchange(exchange, 'direct', { durable: false });

  const message = Buffer.from(JSON.stringify(payload));

  channel.publish(exchange, targetVM, message, {
    headers: {
      destination: targetVM,     
      source: 'vm-sender-1',     
    }
  });

  console.log( `Message sent to: ${targetVM} with header` );

  setTimeout(() => connection.close(), 500);
}

sendToVM('MQ VM', { text: 'Hello VM2!' }).catch(console.error);