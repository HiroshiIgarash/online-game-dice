import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "../types/socket";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [dice, setDice] = useState<number | null>(null);
  const [waitingPlayers, setWaitingPlayers] = useState<string[] | null>(null);
  const [result, setResult] = useState<
    | {
        socketId: string;
        playerName: string;
        dice?: number;
      }[]
    | null
  >(null);

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  const connectToSocket = ({ name }: { name: string }) => {
    if (socket) return;
    const socketIo: Socket<ServerToClientEvents, ClientToServerEvents> = io({
      query: { name },
    });

    socketIo.on("connect", () => {
      setIsConnected(true);
    });

    socketIo.on("disconnect", () => {
      setIsConnected(false);
    });

    socketIo.on("matched", (roomId) => {
      console.log("Matched!");
      setRoomId(roomId);
    });

    socketIo.on("playerListChanged", (playersList) => {
      setWaitingPlayers(playersList);
    });

    socketIo.on(
      "result",
      (
        result: {
          socketId: string;
          playerName: string;
          dice?: number;
        }[]
      ) => {
        setResult(result);
      }
    );

    setSocket(socketIo);
  };

  const rollDice = () => {
    const random = Math.floor(Math.random() * 1000) + 1;
    setDice(random);
    if (socket) {
      socket.emit("roll dice", {
        socketId: socket.id,
        dice: random,
        roomId,
      });
    }
  };

  return {
    isConnected,
    roomId,
    connectToSocket,
    rollDice,
    dice,
    waitingPlayers,
    result,
  };
};
