# Rumble Raffle

It uhh does some battle with birbs.


## How to start

Install all node_modules
Run `yar server` to start server.
Run `yarn start` in another tab to start the app


## Context

[src/App.tsx](src/App.tsx) is the main test UI

[src/Rumble](src/Rumble/) is the entry into the rumble code

[Rumble/types](src/Rumble/types/) is where Typescript types can be found

[Rumble/activities](src/Rumble/activities/) activities are events that can happen. These will be either PVP, PVP or a Revive activity.

### Flow of creating game

1. Admin goes to create room page
    - created room will have options needed to fill out
    - pve chances, revive chance, prize split, cost of entry, coin type, etc
    - slug will be random for now
    - Future unlocks:
      - Select slug to generate
      - Allows params of users that can join (only nft holders, only with certain amount of x coin, etc)
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


### What needs to be done?

- ~~Split apart Rumble / Server / Web~~
  - ~~Clean up folders of useless info~~
- Server
  - ~~Send back the list of possible roomIds to set inside pages/room/[roomId].~~
  - Add more params to the `rooms` db
  - Start / Clear game socket
    - Only allow users with admin permissions
  - Hosting place?
  - Saving / Fetching of all the pve / pvp / revive activity objects
  - Returning only pieces of the activity log every 30s or whatever its set to
    - Should this be customizeable?
  - Smart Contracts?
    - Taking a "buy in" payment
    - Dispense winning payments
- Web
  - Admin view panel on top for starting game, etc
  - ~~Get the list of possible roomIds to set inside pages/rooms/[roomId].~~
  - ~~Routing for game ids~~
  - Only let game creator start game
    - Eventually automate it? Meh?
  - UI to "create" a Rumble with customizeable components
    - Set prize split (RumbleRaffleDAO always takes .5% (maybe less / more?))
    - Set amt players
    - Set buyin amount
  - Once "Join" is clicked, user can not rejoin.
  - ~~Logging in with wallets~~
  - Accepting "buy in"
- Rumble
  - ~~determine how many loops each round should run through~~
  - Add param options for entry price, chance of pve, chance of revive, etc
  - Get more examples for pve / pvp / revive activities
  - Testing

### Known bugs

- Web
  - Logging in on `room/:id` page doesn't update what your user name is
- Rumble
  - Probably need to change activity log `content` to pass through id / walletId instead of just the names.
- DB
  - Change player id to be publicAddress rather than the id.

### Extra Ideas

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
