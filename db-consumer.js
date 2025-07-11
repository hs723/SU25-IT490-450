const amqp = require('amqplib');

async function startConsumer(vmname) {
  const connection = await amqp.connect('amqp://cjs77:admin@100.107.198.79');
  const channel = await connection.createChannel();

  const exchange = 'vm_exchange';
  await channel.assertExchange(exchange, 'direct', { durable: false });

  const q = await channel.assertQueue('', { exclusive: true });
  await channel.bindQueue(q.queue, exchange, vmname);

  console.log(`Waiting for messages for ${vmname}` );

  channel.consume(q.queue, msg => {
    if (msg !== null) {
      const content = msg.content.toString();
      const headers = msg.properties.headers || {};
      console.log('Received', content);
      console.log('Headers:', headers );
      channel.ack(msg);
    }
  });
}

startConsumer('dbvm').catch(console.error);