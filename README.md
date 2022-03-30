# Rumble Raffle

It uhh does some battle with birbs.


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

## Web

- General:
  - Users can switch between metamask accounts, so we should constantly check for those changes
    - ex: `web3.eth.accounts[0];`
  - User could overwrite cookies and still make calls, so we need to be more vigilant there somehow.
  - Set up different staging (test / production)
  - Determine hosting
  - Finish the `checkChain` piece in wallet.ts
- Players:
  - Allow players to change their names.
- Create Room:
  - Allow setting of player limits
  - Allow setting an initial prize purse.
  - Allow params of user that can join:
    - Whitelist addresses
    - Only x NFT holder
    - Only with x amount of coin
    - Etc
- Rooms:
  - ~~Request payment before joining a game.~~
  - Should show a running tally of all the kills so players can see as the game goes on
    - added killCount to activityLogs specific activity
  - When you are in an activity, it should highlight the row / your name or something to bring awareness to it.
- Home Page:
  - Add list of rooms that are open
  - If the user has `admin` rights, show them the `create` room button
  - Add list of past rooms and payouts

## Server

- General:
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
  - Allow users to alter their names.
- Sockets:
  - We need more security when passing them back and forth.
  - Sockets data needs to be encoded from server side somehow
- Testing:

## Rumble Package

- General:
  - TESTING. We have zero tests. Not great!
- Revives:
  - We should increase the amount of revives based on how many players are left. Right now it's only 1 per round.
- replaceActivityDescPlaceholders
  - Right now it only shows the player names. We need to be able to hover a players name and show their publicAddress.

## Smart Contracts

- All the things
- Accepting Payments
- Dispensing payouts


# Known bugs

- There are some.. just haven't found them yet.

# Extra Ideas

- DEATHROLL APP
  - In WoW we would deathroll our gold. How it works:
    - Challenge someone to deathroll of x value. you'd type `/roll x` and it would randomly pick a number between 1 and x.
    - Ex: "I challenge you to roll of `50,000` coins"
    - Person who started the game would type `/roll 500000`
    - the console would spit out random number `Blah rolled: 34562`
    - You repeat this until the last person rolls `1`. That person would then owe the other person the `50,000`
- WOW GAMBLING APP
  - You would set the game to go off of `10,000`
  - 20 people agree to roll `/roll 10000` each
  - The person who rolled the lowest then owes the person who rolled the highest, the difference between theyre rolls.
  - ex: Person1 rolls `120` Person2 rolls `9450`. Person 1 then pays `9450 -120` to Person 2.
- END OF WEEK TOURNEY
  - At the end of the week, all the remainder money goes into a prize pool. Anyone who has played this week will be automatically entered into this massive raffle and then paid out how we determine. (This sounds like it's easily manipulated though by entering different raffles or something. Still good for hype.)
- NFT Ideas
  - Winners get NFT's (Gold/Silver/Bronze)
    - Can sell the NFT, but we always get a 5% cut or whatever is the norm.
    - Can trade the NFT up for higher win score NFTs or something?
    - A certain amount of wins can let you burn the NFTs for ability to add your own naming of the activity (pve/pvp/revive round)
- DAO Token?
  - Do similar things as the NFT idea? (I like the NFT idea better, it gives more cashflow for people that may want to buy 5 or whatever winning rounds to make suggestions)
  - Can vote on things that are implement? idk
  - Good to just release and get cashflow as well.
