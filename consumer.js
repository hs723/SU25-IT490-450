const amqp = require('amqplib');
const mysql = require('mysql2/promise');

let dbConnection;

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
      return { success: true, user: rows[0] };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Database error:', error);
    return { success: false, error: 'Database error' };
  }
}

async function registerUser(userData) {
  try {
    // Check if user exists
    const [existing] = await dbConnection.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [userData.email, userData.username]
    );
    
    if (existing.length > 0) {
      return { success: false, error: 'User already exists' };
    }
    
    // Insert new user
    const [result] = await dbConnection.execute(
      'INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)',
      [userData.username, userData.email, userData.password, userData.display_name]
    );
    
    return { success: true, userId: result.insertId };
    
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
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

    channel.consume(q.queue, async msg => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        const { replyTo, correlationId } = msg.properties;

        let result = { success: false };

        switch (data.type) {
          case 'register':
            if (data.username && data.email && data.password && data.display_name) {
              result = await registerUser(data);
            } else {
              result = { success: false, error: 'Missing required fields' };
            }
            break;

          case 'login':
            if (data.email && data.password) {
              result = await loginUser(data);
            } else {
              result = { success: false, error: 'Missing email or password' };
            }
            break;

          case 'checkUser':
            if (data.email) {
              result = await checkUser(data.email);
            } else {
              result = { success: false, error: 'Missing email' };
            }
            break;

          default:
            result = { success: false, error: 'Unknown request type' };
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

  } catch (error) {
    console.error('Failed to start consumer:', error);
  }
}

startConsumer('dbvm').catch(console.error);