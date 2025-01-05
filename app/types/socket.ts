interface Result {
  socketId: string;
  playerName: string;
  dice?: number;
}

export interface ServerToClientEvents {
  playerListChanged: (playersList: string[]) => void;
  matched: (roomId: string) => void;
  result: (results: Result[]) => void;
}

export interface ClientToServerEvents {
  "roll dice": (arg: {
    socketId: string;
    dice: number;
    roomId: string;
  }) => void;
}
