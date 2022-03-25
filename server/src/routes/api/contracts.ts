import express from 'express';
import bodyParser from 'body-parser';
import { definitions } from '@rumble-raffle-dao/types';
import client from '../../client';

const router = express.Router();
const jsonParser = bodyParser.json()

/**
 * Flow of create contract
 * - Add the contract data..?
 */
router.post('/:id', jsonParser, async (req: any, res: any) => {
  console.log('---req.body', req.body);
  // Insert contract
  const { data, error } = await client.from<definitions['contracts']>('contracts').insert({ ...req.body })
  if (error) {
    res.status(res.statusCode).json({ error });
    return;
  }
  res.json({ data });
})

/**
 * Gets the contract data from the contract_address
 */
router.get('/:contract_address', async (req: any, res: any) => {
  const contract_address = req.params.contract_address;
  const { data, error } = await client.from<definitions['contracts']>('contracts').select(`
    decimals, name, network_name, symbol, contract_address
  `).eq('contract_address', contract_address)
  if (error) {
    res.status(res.statusCode).json({ error });
    return;
  }
  res.json({ data });
})

module.exports = router;