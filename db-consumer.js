const amqp = require('amqplib');
const mysql = require('mysql2/promise');

let dbConnection;

async function sendToVM(targetVM, payload) {
  const connection = await amqp.connect('amqp://hs723:hs723@100.107.198.79'); 
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

async function connectToDatabase() {
  try {
    dbConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'hs723',
      password: 'admin',
      database: 'trivia_app'
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

async function registerUser(userData) {
  try {
    // Check if user already exists
    const [existing] = await dbConnection.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [userData.email, userData.username]
    );
    
    if (existing.length > 0) {
      console.log('Registration failed: User already exists');
      return false;
    }
    
    // Insert new user
    const [result] = await dbConnection.execute(
      'INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)',
      [userData.username, userData.email, userData.password, userData.display_name]
    );
    
    console.log('User registered successfully:', userData.username);
    return true;
    
  } catch (error) {
    console.error('Registration error:', error);
    return false;
  }
}

async function startConsumer(vmname) {
  try {
    await connectToDatabase();
    
    const connection = await amqp.connect('amqp://hs723:hs723@100.107.198.79');
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

          if (messageData.type === 'register') {
            if (messageData.username && messageData.email && messageData.password && messageData.display_name) {
                const success = await registerUser(messageData);
                
                await sendToVM('mqvm', {
                'success' : success,
                type: 'registration_response'
              });
            } else {
                console.log('Registration failed: Missing required fields');

                await sendToVM('mqvm', {
                result: 'Registration failed - Missing fields',
                type: 'registration_response',
                success: false
              });
            }
          } else if (messageData.email) {
            await checkUser(messageData.email);

            await sendToVM('appvm', {
                'success': success,
                email: messageData.email
            });
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

startConsumer('dbvm').catch(console.error);