# Rumble Raffle

Link to [White Paper](/WHITE_PAPER.md).


## How to start


Install all node modules with `yarn`
Update the `.env` / `.env.local` in each package (server / types / web)
Run `yarn update-types` to get the latest types from the supabase db.

Tab 1: Run `yarn server` to start server.

Tab 2: Run `yarn dev` to start the app.

For local smart contracts you will need to:

Tab 3: Run `yarn hardhat-compile` to compile the contract and spit out the artifacts.

Tab 3 (same one): Run `yarn hardhat-node` to start the local node. Keep this open as it's our local blockchain.

Tab 4: Run `yarn contract-deploy-local` to deploy the local contracts.




## Context

[src/App.tsx](src/App.tsx) is the main test UI

[src/Rumble](src/Rumble/) is the entry into the rumble code

[Rumble/types](src/Rumble/types/) is where Typescript types can be found

[Rumble/activities](src/Rumble/activities/) activities are events that can happen. These will be either PVP, PVP or a Revive activity.

### Flow of creating game

1. Admin goes to create room page
    - created room will have options needed to fill out
    - pve chances, revive chance, prize split, cost of entry, coin type, etc
2. After submission a room will be created in the `/rooms` db table with its params.
    - A link will be generated to send to players
3. Users will sign in with their wallets, and click "join game"
    - Users will be prompted with the "approve spend" tx, we wait for tx to clear then set approve
    - after approval "user" is now converted to a "Player"
    - "player" data will be added to the `players` db table with userid / roomid / walletid
4. Once `player` joins, everyone in the room is sent a socket update to show active players
    - This will also prompt the update of total prize pool to be shown to all "users"
5. On game start Rumble package will calculate all data and then store it in the `tbd` db table
    - Stored data: players, activityLog, winners, room params. (is this stored better not in a db, like an s3 bucket or something for logs?)
6. Game activity data will then be slowly trickled out to players every x amount of seconds via sockets.
7. After winner is announced, payments will be disbursed.

# TODO:

## Other Setup

- Discord
- White Paper
  - All about transparency
- eth domain?
- What else?

## Web

- Make this work with complete free version for now.
  - How Rumble Raffle works page
  - Activities
    - Add some more activities, damn!
  - Rooms
    - Different icons for pvp, pve, revive
  - Create Page
    - Remove contract requirement unless there is an entryFee piece
  - Weapons Page
    - Buy weapon
    - Upgrade weapon

- General:
  - Users can switch between metamask accounts, so we should constantly check for those changes
    - ex: `web3.eth.accounts[0];`
  - User could overwrite cookies and still make calls, so we need to be more vigilant there somehow.
  - Set up different staging (test / production)
  - Determine hosting
  - Finish the `checkChain` piece in wallet.ts
- Players:
  - Allow players to pick a profile picutre.
- Create Room:
  - Allow setting of player limits
  - Allow setting an initial prize purse.
    - Requires the user who is creating the game to deposit a certain amount of coins before making the game.
  - Add a checkbox to replace altSplit with "burn"
  - Allow params of user that can join:
    - Whitelist addresses
    - Only x NFT holder
    - Only with x amount of coin
    - Etc
- Rooms:
  - If the altSplit address is 0x0000000000000000000000000000000000000000 then rename the label to "burn percent" or whatever
- Home Page:
  - Add list of rooms that are open
  - If the user has `admin` rights, show them the `create` room button
  - Add list of past rooms and payouts

## Server

- Security
  - Uhhh, yeah we gotta figure out some better security here.
- General:
  - How do we persist the data across server resets?
  - Set up different staging (test / production)
  - Determine hosting
  - Better error handling
- Create Room:
  - Allow setting of player limits
  - Allow setting an initial prize purse.
  - Allow params of user that can join:
    - Whitelist addresses
    - Only x NFT holder
    - Only with x amount of coin
    - Etc
- Rooms:
  - "Clear Game" should remove all the players from the payouts / set the room `game_started` back to false
    - Only allow game owner to do this
- Users:
  - When user is created on backend they might potentially have the same name as someone else, this could cause errors. Assure that we don't have issues with saving those names.
- Sockets:
  - We need more security when passing them back and forth.
  - Sockets data needs to be encoded from server side somehow
- Testing:

## Database

- Rooms
  - rooms should really only have the `id`, `slug`, `params_id`. The rest of the info should be inside of `room_params`. This allows us to always use the same url, and allow external hardlinks like `rumbleraffle.com/room/fancybirds` so they can have their own specific rooms if needed. then we simply switch out the `params_id` when a new game is going to be started.
    - `payouts` table would need to change `room_id` to be based on `room_params` table instead
    - `game_round_logs` table would need to change `room_id` to be based on `room_params` table instead

## Rumble Package

- Start Game
  - Should throw error if:
    - No activities
    - no players
    - no chance of pve / pvp
- Activities
  - Allow different activity formats
    - Add `PLAYER1 killed PLAYER2 by ACTION WEAPON` format
  - Implement special weapons from users
- Revives:
  - We should increase the amount of revives based on how many players are left. Right now it's only 1 per round.

## Smart Contracts

- Look at staking contract for Coin
- Look into Tokenomics for Coin
- Look into how to release a coin
- Look into how to get early adopters of coins, etc


# Known bugs

- There are some.. just haven't found them yet.

# Extra Ideas

**Discord bot implementation**
  - Just displays a message of where the link is to view / pay
  - Then shows the same messages as the website does inside the discord server.
