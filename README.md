# Rumble Raffle

It uhh does some battle with birbs.


## How to start


Install all node modules with `yarn`
Update the `.env` / `.env.local` in each package (server / types / web)
Run `yarn update-types` to get the latest types from the supabase db.

Run `yar server` to start server.
Run `yarn dev` in another tab to start the app


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
  - Determine hosting
- Players:
  - Allow players to change their names.
- Create Room:
  - Allow setting of player limits
  - Allow setting entry fee to 0.
  - Allow setting an initial prize purse.
  - Allow params of user that can join:
    - Whitelist addresses
    - Only x NFT holder
    - Only with x amount of coin
    - Etc
- Rooms:
  - ~~Should show the users public address on hover of their name.~~
    - Should style this better
  - Request payment before joining a game.
- Home Page:
  - Add list of rooms that have are open
  - If the user has `admin` rights, show them the `create` room button
  - Add list of past rooms and payouts
- Sockets:
  - Socket data should be encoded from client side somehow

## Server

- General:
  - Determine hosting
  - Better error handling
- Create Room:
  - Allow setting of player limits
  - Allow setting entry fee to 0.
  - Allow setting an initial prize purse.
  - Allow params of user that can join:
    - Whitelist addresses
    - Only x NFT holder
    - Only with x amount of coin
    - Etc
  - ~~Only admins should be able to create a room.~~
- Rooms:
  - Trickle out the activity log.
  - "Clear Game" should remove all the players from the payouts / set the room `game_started` back to false
    - Only allow game owner to do this
- Users:
  - Allow users to alter their names.
- Players (users who have joined agame):
  - Listen for address activity and only convert a `user` -> `player` when a payment tx goes through
- Sockets:
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
