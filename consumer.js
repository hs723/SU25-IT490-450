const amqp = require('amqplib');

async function startConsumer(vmname) {
  const connection = await amqp.connect('amqp://INSERTIPHERE');
  const channel = await connection.createChannel();

  const exchange = 'vm_exchange';
  await channel.assertExchange(exchange, 'direct', { durable: false });

  const q = await channel.assertQueue('', { exclusive: true });
  await channel.bindQueue(q.queue, exchange, vmname);

  console.log(`Waiting for messages for ${vmname}`);

  channel.consume(q.queue, async msg => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      const { replyTo, correlationId } = msg.properties;

      let result;

      switch (data.type) {
        case 'register':
        case 'login':
        case 'updateProfile':
          // Trust validation is already handled
          result = {
            success: data.success || false,
            ...(data.error && { error: data.error }),
            ...(data.token && { token: data.token }) // optional for login
          };
          break;

        default:
          result = { success: false, error: "Unknown request type" };
      }

      if (replyTo && correlationId) {
        channel.sendToQueue(
          replyTo,
          Buffer.from(JSON.stringify(result)),
          { correlationId }
        );
      }

      channel.ack(msg);
    }
  });
}

startConsumer('insertvmname').catch(console.error);