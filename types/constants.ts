
/** Base Urls */
export const BASE_API_URL_DEV = 'http://localhost:3001';
export const BASE_WEB_URL_DEV = 'http://localhost:3000'
export const BASE_API_URL_PROD = 'https://rumble-raffle-dao.herokuapp.com'
export const BASE_WEB_URL_PROD = 'https://www.rumbleraffle.com'

/** SERVER API PATHS */
export const SERVER_BASE_PATH = '/api'
export const SERVER_ACTIVITIES = '/activities'
export const SERVER_AUTH_DISCORD = '/auth_discord'
export const SERVER_ROOMS = '/rooms'
export const SERVER_USERS = '/users'

/** Auth Discord Url Paths */
export const PATH_VERIFY = '/verify'
export const PATH_VERIFY_INIT = '/init'
export const PATH_UNLINK_DISCORD = '/unlink';

/** External Links */
export const DISCORD_LINK = 'https://discord.gg/5Bn8VKzHKB';
export const TWITTER_LINK = 'https://twitter.com/RumbleRaffle';
export const TWITTER_HANDLE = '@RumbleRaffle';
export const WHITE_PAPER_GIST = 'https://gist.github.com/blaynem/24af9ceb93baf00debed738cec212874';

/** CONTRACT VARS */
export const ALCHEMY_BASE_URL_POLYGON = 'https://polygon-mainnet.g.alchemy.com/v2';
export const NETWORK_NAME_POLYGON = 'polygon';

/** SOCKET VARS */
export const NEW_GAME_CREATED = 'new_game_created';
export const GAME_START_COUNTDOWN = 'game_start_countdown';
export const JOIN_GAME_ERROR = 'join_game_error';
export const JOIN_ROOM = 'join_room';
export const SYNC_PLAYERS_REQUEST = 'sync_players_request';
export const SYNC_PLAYERS_RESPONSE = 'sync_players_response';
export const NEXT_ROUND_START_COUNTDOWN = 'next_round_start_countdown';
export const UPDATE_ACTIVITY_LOG_ROUND = 'update_activity_log_round'
export const UPDATE_ACTIVITY_LOG_WINNER = 'update_activity_log_winner'
export const UPDATE_PLAYER_LIST = 'update_player_list'

/** DEFAULT GAME ROOM VARS */
export const DEFAULT_ROOM_URL = '/play';
export const DEFAULT_GAME_ROOM = 'DEFAULT';

/** MESSAGES SIGNED WITH ETH TOOLS */
export const LOGIN_MESSAGE = 'I am ready to rumble!'
export const SETTINGS_MESSAGE = 'Changing user settings'