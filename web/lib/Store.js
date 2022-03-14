import { useState, useEffect } from 'react'
import supabase from '../client';

/**
 * Fetch a single user
 * @param {number} userId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
 export const fetchUser = async (userId, setState) => {
  try {
    let { body } = await supabase.from('users').select(`*`).eq('id', userId)
    let user = body[0]
    if (setState) setState(user)
    return user
  } catch (error) {
    console.log('error', error)
  }
}