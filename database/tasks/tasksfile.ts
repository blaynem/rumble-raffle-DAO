#!/usr/bin/env nod
import 'dotenv/config'

import { SeedDbAsUser, ClearAllData } from './seed'

// RunMakeUsers(10)

require('yargs')
  .scriptName('task-runner')
  .usage('$0 <cmd> [args]')
  .command(
    'make-users [numberOfUsers]',
    'makes n fake users',
    yargs => {
      yargs.positional('numberOfUsers', {
        type: 'number',
        default: 1,
        describe: 'How many users you want'
      })
    },
    async argv => {
      console.log('Creating ', argv.numberOfUsers, ' users')
      await ClearAllData()
      await SeedDbAsUser(argv.numberOfUsers)
      console.log('Complete!')
    }
  )
  .help().argv