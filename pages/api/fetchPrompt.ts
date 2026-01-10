import pool from '../../lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import mysql2 from 'mysql2/promise';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 确保使用POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  let connection: mysql.PoolConnection | undefined;
  const connectionConfig = {
    host: 'mysqlserverless.cluster-cautknyafblq.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: '35nPQH!ut;anvcA',
    database: 'GPT_experiment',
  };

  try {
    // const connection = await mysql2.createConnection(connectionConfig);
    //const connection = await pool.getConnection();
    const { action, promptID } = req.body;
    try{
      // 处理基于promptID的查询
      if (action === 'fetchPrompt') {
        // 确保 promptID 是字符串类型
        //const promptID = String(promptID);
        const [rows] = await pool.execute<RowDataPacket[]>(
          'SELECT Prompts FROM prompt_xm WHERE PromptID = ?',
          [promptID]
        );

        if (rows.length > 0) {
          res.status(200).json({ success: true, prompt: rows[0] });
        } else {
          res.status(404).json({ success: false, message: 'Prompt not found' });
        }
      } else {
        res.status(400).json({ message: 'Invalid action' });
      }
  } finally {
    // 确保释放连接
    if (connection) connection.release();
  }
  } catch (error) {
    console.error('Database connection or query failed:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

