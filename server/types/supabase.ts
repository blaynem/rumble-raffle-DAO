/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/": {
    get: {
      responses: {
        /** OK */
        200: unknown;
      };
    };
  };
  "/activities": {
    get: {
      parameters: {
        query: {
          id?: parameters["rowFilter.activities.id"];
          created_at?: parameters["rowFilter.activities.created_at"];
          environment?: parameters["rowFilter.activities.environment"];
          description?: parameters["rowFilter.activities.description"];
          amountOfPlayers?: parameters["rowFilter.activities.amountOfPlayers"];
          activityWinner?: parameters["rowFilter.activities.activityWinner"];
          activityLoser?: parameters["rowFilter.activities.activityLoser"];
          killCounts?: parameters["rowFilter.activities.killCounts"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["activities"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** activities */
          activities?: definitions["activities"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          id?: parameters["rowFilter.activities.id"];
          created_at?: parameters["rowFilter.activities.created_at"];
          environment?: parameters["rowFilter.activities.environment"];
          description?: parameters["rowFilter.activities.description"];
          amountOfPlayers?: parameters["rowFilter.activities.amountOfPlayers"];
          activityWinner?: parameters["rowFilter.activities.activityWinner"];
          activityLoser?: parameters["rowFilter.activities.activityLoser"];
          killCounts?: parameters["rowFilter.activities.killCounts"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          id?: parameters["rowFilter.activities.id"];
          created_at?: parameters["rowFilter.activities.created_at"];
          environment?: parameters["rowFilter.activities.environment"];
          description?: parameters["rowFilter.activities.description"];
          amountOfPlayers?: parameters["rowFilter.activities.amountOfPlayers"];
          activityWinner?: parameters["rowFilter.activities.activityWinner"];
          activityLoser?: parameters["rowFilter.activities.activityLoser"];
          killCounts?: parameters["rowFilter.activities.killCounts"];
        };
        body: {
          /** activities */
          activities?: definitions["activities"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
  "/players": {
    get: {
      parameters: {
        query: {
          player_id?: parameters["rowFilter.players.player_id"];
          room_id?: parameters["rowFilter.players.room_id"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["players"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** players */
          players?: definitions["players"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          player_id?: parameters["rowFilter.players.player_id"];
          room_id?: parameters["rowFilter.players.room_id"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          player_id?: parameters["rowFilter.players.player_id"];
          room_id?: parameters["rowFilter.players.room_id"];
        };
        body: {
          /** players */
          players?: definitions["players"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
  "/rooms": {
    get: {
      parameters: {
        query: {
          id?: parameters["rowFilter.rooms.id"];
          created_at?: parameters["rowFilter.rooms.created_at"];
          slug?: parameters["rowFilter.rooms.slug"];
          params?: parameters["rowFilter.rooms.params"];
          created_by?: parameters["rowFilter.rooms.created_by"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["rooms"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** rooms */
          rooms?: definitions["rooms"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          id?: parameters["rowFilter.rooms.id"];
          created_at?: parameters["rowFilter.rooms.created_at"];
          slug?: parameters["rowFilter.rooms.slug"];
          params?: parameters["rowFilter.rooms.params"];
          created_by?: parameters["rowFilter.rooms.created_by"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          id?: parameters["rowFilter.rooms.id"];
          created_at?: parameters["rowFilter.rooms.created_at"];
          slug?: parameters["rowFilter.rooms.slug"];
          params?: parameters["rowFilter.rooms.params"];
          created_by?: parameters["rowFilter.rooms.created_by"];
        };
        body: {
          /** rooms */
          rooms?: definitions["rooms"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
  "/users": {
    get: {
      parameters: {
        query: {
          publicAddress?: parameters["rowFilter.users.publicAddress"];
          created_at?: parameters["rowFilter.users.created_at"];
          nonce?: parameters["rowFilter.users.nonce"];
          id?: parameters["rowFilter.users.id"];
          name?: parameters["rowFilter.users.name"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["users"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** users */
          users?: definitions["users"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          publicAddress?: parameters["rowFilter.users.publicAddress"];
          created_at?: parameters["rowFilter.users.created_at"];
          nonce?: parameters["rowFilter.users.nonce"];
          id?: parameters["rowFilter.users.id"];
          name?: parameters["rowFilter.users.name"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          publicAddress?: parameters["rowFilter.users.publicAddress"];
          created_at?: parameters["rowFilter.users.created_at"];
          nonce?: parameters["rowFilter.users.nonce"];
          id?: parameters["rowFilter.users.id"];
          name?: parameters["rowFilter.users.name"];
        };
        body: {
          /** users */
          users?: definitions["users"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
}

export interface definitions {
  activities: {
    /**
     * Format: uuid
     * @description Note:
     * This is a Primary Key.<pk/>
     * @default extensions.uuid_generate_v4()
     */
    id: string;
    /**
     * Format: timestamp with time zone
     * @default now()
     */
    created_at?: string;
    /** Format: text */
    environment: string;
    /** Format: text */
    description: string;
    /** Format: numeric */
    amountOfPlayers: number;
    /** Format: ARRAY */
    activityWinner?: unknown[];
    /** Format: ARRAY */
    activityLoser?: unknown[];
    /** Format: ARRAY */
    killCounts?: unknown[];
  };
  /** @description Current players in a given room */
  players: {
    /**
     * Format: uuid
     * @description Note:
     * This is a Primary Key.<pk/>
     * This is a Foreign Key to `users.id`.<fk table='users' column='id'/>
     */
    player_id: string;
    /**
     * Format: uuid
     * @description Note:
     * This is a Primary Key.<pk/>
     * This is a Foreign Key to `rooms.id`.<fk table='rooms' column='id'/>
     */
    room_id: string;
  };
  rooms: {
    /**
     * Format: uuid
     * @description Note:
     * This is a Primary Key.<pk/>
     * @default extensions.uuid_generate_v4()
     */
    id: string;
    /**
     * Format: timestamp with time zone
     * @default now()
     */
    created_at?: string;
    /** Format: text */
    slug: string;
    /** Format: jsonb */
    params?: string;
    /** Format: uuid */
    created_by?: string;
  };
  users: {
    /**
     * Format: character varying
     * @description Note:
     * This is a Primary Key.<pk/>
     */
    publicAddress: string;
    /**
     * Format: timestamp with time zone
     * @default now()
     */
    created_at?: string;
    /** Format: character varying */
    nonce: string;
    /**
     * Format: uuid
     * @default extensions.uuid_generate_v4()
     */
    id: string;
    /** Format: text */
    name: string;
  };
}

export interface parameters {
  /**
   * @description Preference
   * @enum {string}
   */
  preferParams: "params=single-object";
  /**
   * @description Preference
   * @enum {string}
   */
  preferReturn: "return=representation" | "return=minimal" | "return=none";
  /**
   * @description Preference
   * @enum {string}
   */
  preferCount: "count=none";
  /** @description Filtering Columns */
  select: string;
  /** @description On Conflict */
  on_conflict: string;
  /** @description Ordering */
  order: string;
  /** @description Limiting and Pagination */
  range: string;
  /**
   * @description Limiting and Pagination
   * @default items
   */
  rangeUnit: string;
  /** @description Limiting and Pagination */
  offset: string;
  /** @description Limiting and Pagination */
  limit: string;
  /** @description activities */
  "body.activities": definitions["activities"];
  /** Format: uuid */
  "rowFilter.activities.id": string;
  /** Format: timestamp with time zone */
  "rowFilter.activities.created_at": string;
  /** Format: text */
  "rowFilter.activities.environment": string;
  /** Format: text */
  "rowFilter.activities.description": string;
  /** Format: numeric */
  "rowFilter.activities.amountOfPlayers": string;
  /** Format: ARRAY */
  "rowFilter.activities.activityWinner": string;
  /** Format: ARRAY */
  "rowFilter.activities.activityLoser": string;
  /** Format: ARRAY */
  "rowFilter.activities.killCounts": string;
  /** @description players */
  "body.players": definitions["players"];
  /** Format: uuid */
  "rowFilter.players.player_id": string;
  /** Format: uuid */
  "rowFilter.players.room_id": string;
  /** @description rooms */
  "body.rooms": definitions["rooms"];
  /** Format: uuid */
  "rowFilter.rooms.id": string;
  /** Format: timestamp with time zone */
  "rowFilter.rooms.created_at": string;
  /** Format: text */
  "rowFilter.rooms.slug": string;
  /** Format: jsonb */
  "rowFilter.rooms.params": string;
  /** Format: uuid */
  "rowFilter.rooms.created_by": string;
  /** @description users */
  "body.users": definitions["users"];
  /** Format: character varying */
  "rowFilter.users.publicAddress": string;
  /** Format: timestamp with time zone */
  "rowFilter.users.created_at": string;
  /** Format: character varying */
  "rowFilter.users.nonce": string;
  /** Format: uuid */
  "rowFilter.users.id": string;
  /** Format: text */
  "rowFilter.users.name": string;
}

export interface operations {}

export interface external {}
