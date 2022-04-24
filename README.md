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

- All the things
- Accepting Payments
- Dispensing payouts


# Known bugs

- There are some.. just haven't found them yet.


# Game Modes

**DEATHROLL APP**
  - In WoW we would deathroll our gold. How it works:
    - Challenge someone to deathroll of x value. you'd type `/roll x` and it would randomly pick a number between 1 and x.
    - Ex: "I challenge you to roll of `50,000` coins"
    - Person who started the game would type `/roll 500000`
    - the console would spit out random number `Blah rolled: 34562`
    - You repeat this until the last person rolls `1`. That person would then owe the other person the `50,000`

**HIGH ROLLER**
  - You would set the game to go off of `10,000`
  - 20 people agree to roll `/roll 10000` each
  - The person who rolled the lowest then owes the person who rolled the highest, the difference between theyre rolls.
  - ex: Person1 rolls `120` Person2 rolls `9450`. Person 1 then pays `9450 -120` to Person 2.


# Extra Ideas

**Discord bot implementation**
  - Just displays a message of where the link is to view / pay
  - Then shows the same messages as the website does inside the discord server.

**Different designs for different coins?**
  - Allows it to be tailored towards the individuals branding

**END OF WEEK TOURNEY**
  - At the end of the week, all the remainder money goes into a prize pool. Anyone who has played this week will be automatically entered into this massive raffle and then paid out how we determine. (This sounds like it's easily manipulated though by entering different raffles or something. Still good for hype.)

# Extra Ideas

## Profile Pictures
- Rumble Raffle specific PFPs based on what you own?
  - Weapons, armor, helmet (they do nothing. Just for flexing)
- External NFT PFPs (different options)
    1. Show the NFT
    2. Implement weapon layers or a "serum" similar to BAYC that could be used to add weapons to your NFT?