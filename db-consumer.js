
const amqp = require('amqplib');
const mysql = require('mysql2/promise');

let dbConnection;

async function connectToDatabase() {
  try {
    dbConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'hs723',
      password: 'admin',
      database: 'trivia_app'  // Change this
    });
    console.log('Connected to database');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

async function checkUser(email) {
  try {
    const [rows] = await dbConnection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (rows.length > 0) {
      console.log('User found:', rows[0]);
      return true;
    } else {
      console.log('User not found');
      return false;
    }
  } catch (error) {
    console.error('Database error:', error);
    return false;
  }
}

async function startConsumer(vmname) {
  try {
    await connectToDatabase();
    
    const connection = await amqp.connect('amqp://cjs77:admin@100.107.198.79');
    const channel = await connection.createChannel();

    const exchange = 'vm_exchange';
    await channel.assertExchange(exchange, 'direct', { durable: false });

    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, exchange, vmname);

    console.log(`Waiting for messages for ${vmname}`);

    channel.consume(q.queue, async (msg) => {
      if (msg !== null) {
        try {
          const content = msg.content.toString();
          const messageData = JSON.parse(content);
          
          console.log('\n--- New Message ---');
          console.log('Received:', messageData);
          
          // Simple validation - check if user exists
          if (messageData.email) {
            await checkUser(messageData.email);
          } else {
            console.log('No email provided for validation');
          }
          
          channel.ack(msg);
          
        } catch (error) {
          console.error('Error:', error);
          channel.ack(msg);
        }
      }
    });

  } catch (error) {
    console.error('Failed to start consumer:', error);
  }
}

startConsumer('database-vm').catch(console.error);
