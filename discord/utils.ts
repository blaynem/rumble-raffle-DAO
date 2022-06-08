import client from "./client";

export const getUserFromUserTag = (tag: string) => {
  const user = client.users.cache.find(u => {
    return u.tag === tag;
  })
  return user;
}

/**
 * Returns the template literal for discord to tag a user 
 * @param discordId - The id of the discord user
 */
export const tagUser = (discordId: string) => `<@${discordId}>`