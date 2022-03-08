# Rumble Birds

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

### What needs to be done?

- ~~Split apart Rumble / Server / Web~~
  - Clean up folders of useless info
- Server
  - Hosting place?
  - Saving / Fetching of all the pve / pvp / revive activity objects
  - Returning only pieces of the activity log every 30s or whatever its set to
    - Should this be customizeable?
  - Smart Contracts?
    - Taking a "buy in" payment
    - Dispense winning payments
- Web
  - Routing for game ids
  - Only let game creator start game
    - Eventually automate it? Meh?
  - UI to "create" a Rumble with customizeable components
    - Set prize split (RumbleRaffleDAO always takes .5% (maybe less / more?))
    - Set amt players
    - Set buyin amount
  - Once "Join" is clicked, user can not rejoin.
  - Logging in with wallets
  - Accepting "buy in"
- Rumble
  - determine how many loops each round should run through
  - Get more examples for pve / pvp / revive activities
  - Testing

### Extra Monetary Ideas

- NFT Ideas
  - Winners get NFT's (Gold/Silver/Bronze)
    - Can sell the NFT, but we always get a 5% cut or whatever is the norm.
    - Can trade the NFT up for higher win score NFTs or something?
    - A certain amount of wins can let you burn the NFTs for ability to add your own naming of the activity (pve/pvp/revive round)
- DAO Token?
  - Do similar things as the NFT idea? (I like the NFT idea better, it gives more cashflow for people that may want to buy 5 or whatever winning rounds to make suggestions)
  - Can vote on things that are implement? idk
  - Good to just release and get cashflow as well.
