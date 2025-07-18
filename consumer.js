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
    const [existing] = await dbConnection.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [userData.email, userData.username]
    );
    
    if (existing.length > 0) {
      return { success: false, error: 'User already exists' };
    }

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
          case 'login':
          case 'checkUser':
            let dbResult;
            if (data.type === 'register' && data.username && data.email && data.password && data.display_name) {
              dbResult = await registerUser(data);
            } else if (data.type === 'login' && data.email && data.password) {
              dbResult = await loginUser(data);
            } else if (data.type === 'checkUser' && data.email) {
              dbResult = await checkUser(data.email);
            } else {
              dbResult = { success: false, error: 'Missing required fields' };
            }

            result = {
              success: dbResult.success || false,
              ...(dbResult.error && { error: dbResult.error }),
              ...(dbResult.token && { token: dbResult.token }),
              ...(dbResult.user && { user: dbResult.user }),
              ...(dbResult.userId && { userId: dbResult.userId })
            };
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