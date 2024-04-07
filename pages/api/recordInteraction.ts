import { NextRequest, NextResponse } from "next/server";
// Import necessary modules and types
//import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Extract data from the request body
  const { UserID, ButtonName, UserLogTime, GPTMessages, Note } = req.body;

  // Database connection settings
  const connectionConfig = {
    host: 'mysqlserverless.cluster-cautknyafblq.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: '35nPQH!ut;anvcA',
    database: 'GPT_experiment',
  };

  try {
    // Connect to the database
    const connection = await mysql.createConnection(connectionConfig);

    // Insert data into the database
    const [result,buff] = await connection.execute(
      'INSERT INTO UserLogs (UserID, ButtonName, UserLogTime, GPTMessages, Note) VALUES (?, ?, ?, ?, ?)',
      [UserID, ButtonName, UserLogTime, GPTMessages, Note]
    );
    const json: any = results;
    return json.affectedRows;

    // Check if the insertion was successful
    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'Data inserted successfully' });
    } else {
      throw new Error('Failed to insert data');
    }
  } catch (error) {
    console.error('Database connection or query failed:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
