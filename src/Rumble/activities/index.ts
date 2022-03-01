import {ActivityTypes} from '../types';
const PVE_ACTIVITIES: ActivityTypes[] = require('./pve.json');
const PVP_ACTIVITIES: ActivityTypes[] = require('./pvp.json');
const REVIVE_ACTIVITIES: ActivityTypes[] = require('./revive.json');

// todo: This doesn't actually do any type checking at all. So will need to figure alternative out.
export {
  PVE_ACTIVITIES,
  PVP_ACTIVITIES,
  REVIVE_ACTIVITIES
}