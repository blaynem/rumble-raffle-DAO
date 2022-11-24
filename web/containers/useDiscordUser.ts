import { useEffect, useState } from 'react'
import { BASE_WEB_URL, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from '../lib/constants';

// Url to request `identify` info found here: https://discord.com/developers/applications Oauth2 -> Url Generator (make sure you click 'identity')

type Token = {
  access_token: string;
  expires_in: number
  refresh_token: string;
  scope: string;
  token_type: string;
}

type State = { guild_id: string }

const useDiscordUser = (query: { code: string; state: State }) => {
  const [userId, setUserId] = useState('');
  const [guildId, setGuildId] = useState('');

  const authorizeDiscord = async () => {
    const body = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      redirect_uri: `${BASE_WEB_URL}/suggest`,

      grant_type: 'authorization_code',
      scope: 'identify',
      code: query.code
    })

    const tokenData = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }).then(res => res.json())

    return tokenData;
  }

  const getUserData = async (token: Token) => {
    if (!token) {
      console.error('Missing authorization token');
      return
    };
    const userData = await fetch("https://discordapp.com/api/v9/users/@me", {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    }).then(res => res.json())
    if (userData) {
      setUserId(userData.id)
    }
  }

  useEffect(() => {
    if (!query.state) return;
    const state = JSON.parse(query?.state as any) as State
    // If we don't have these, don't do anything.
    if (!query.code || !state.guild_id) {
      console.error('Missing query params.', query);
      return;
    }
    (async () => {
      // setUserId('USERID')
      const token = await authorizeDiscord()
      await getUserData(token);
    })()
    setGuildId(state.guild_id)
  }, [query.code, query?.state?.guild_id])

  return { userId, guildId, authorizeDiscord, getUserData }
}


export { useDiscordUser }