export { PrismaClient } from '@prisma/client';
import sockets from './src/sockets/server';
sockets();
// const port = 3005
// const express = require('express');
// const bodyParser = require('body-parser');
// const app = express();
// // const port = process.env.PORT || 3002;

// app.use(bodyParser.json());
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );

// app.get('/', (req: any, res: any) => {
//   res.json({'message': 'ok'});
// })


// /* Error handler middleware */
// app.use((err: any, req: any, res: any, next: any) => {
//   const statusCode = err.statusCode || 500;
//   console.error(err.message, err.stack);
//   res.status(statusCode).json({'message': err.message});
  
//   return;
// });

// app.listen(port, '0.0.0.0', () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// });