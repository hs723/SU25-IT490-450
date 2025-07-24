const amqp = require('amqplib');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

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
    console.log('Checking for user');
    const [existing] = await dbConnection.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [userData.email, userData.username]
    );
    console.log('User found in DB');
    if (existing.length > 0) {
      console.log('User already exists in DB');
      return { success: false, error: 'User already exists' };
    }
    console.log('Trying to insert data into DB');
    const [result] = await dbConnection.execute(
      'INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)',
      [userData.username, userData.email, userData.password, userData.display_name]
    );
    console.log('Successfully added into DB');
    return { success: true, userId: result.insertId };
    
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

async function loginUser(loginData) {
  try {
    // Check if user exists in DB
    // If so, hash the password and check to see if that password_hash matches the one in the DB
    console.log('Checking for email in database');
    const userResult = await checkUser(loginData.email);

    if (!userResult.success) {
      console.log('User not found');
      return { success: false, message: 'Invalid username/email'};
    }
    console.log('User found successfully');

    const passwordMatch = await bcrypt.compare(loginData.password, userResult.user.password_hash);
    console.log('Login password (plain text): ', loginData.password);
    console.log('Stored password hash:' , userResult.user.password_hash);

    console.log('Comparing hashed login password with stored password');
    if(passwordMatch) {
      console.log('Password match. Login successful');
      return { success: true, user: userResult.user};
    } else {
      console.log('Password do not match. Login failed');
      return { success: false, message: 'Invalid credentials'};
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed'};
  }
}

async function updateProfile(updateData) { //updateData is the object that gets passed to the updateProfile function
  try {
    if (!updateData.userId) {
      console.log('Error: Missing userID');
      return { success: false, error: 'User ID is required'};
    }
    
    console.log('Building update query with provided fields');
    // arrays used to dynamically build the SQL UPDATE query based on which fields the user wants to update
    const updates = [];
    const values = [];

    if (updateData.username) {
      console.log('Adding username to update:', updateData.username);
      updates.push('username = ?');
      values.push(updateData.username);
    }
    if (updateData.email) {
      console.log('Adding email to update:', updateData.email);
      updates.push('email = ?');
      values.push(updateData.email);
    }
    if (updateData.password) {
      // Has the password before storing
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updates.push('password_hash = ?');
      values.push(updateData.password);
    }
    if (updateData.display_name) {
      console.log('Adding display name to update: ', updateData.display_name);
      updates.push('display_name = ?');
      values.push(updateData.display_name);
    }

    console.log('Fields to update:', updates);
    console.log('Values to use:', values);

    if (updates.length === 0) {
      return { success: false, error: 'No fields to update' };
    }

    values.push(updateData.userId);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

    console.log('Executing database update...');
    const [result] = await dbConnection.execute(query, values);
    console.log('Database update result: ', result);
    
    if (result.afffectedRows === 0) {
      return { success: false, error: 'User not found' };
    }

    return {success: true, message: 'Profile updated successfully'};
  }catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Failed to update profile' };
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
            console.log('Processing registration request');
            if (data.username && data.email && data.password && data.display_name) {
              result = await registerUser(data);
            } else {
              result = { success: false, error: 'Missing required fields' };
            }
            break;

          case 'login':
            console.log();
            if (data.email && data.password) {
              result = await loginUser(data)
            } else {
              result = { success: false, error: 'Invalid credentials' };
            }
            break;

          case 'checkUser':
            console.log('Processing checkUser request');
            if (data.email) {
              result = await checkUser(data.email);
            } else {
              result = { success: false, error: 'Missing email' };
            }
            break;

          case 'updateProfile':
            console.log('Processing updateProfile request');
            if (data.userId) {
              result = await updateProfile(data)
            } else {
              result = { success: false, error: 'Missing user ID' };
            }
            break;

          default:
            console.warn('Unknown request type received');
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