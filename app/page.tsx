"use client";

import { useSocket } from "./hooks/useSocket";
import { useName } from "./hooks/useName";
import { Button } from "@/components/ui/button";

export default function Home() {
  const {
    isConnected,
    roomId,
    connectToSocket,
    rollDice,
    dice,
    waitingPlayers,
    result: results,
  } = useSocket();
  const { name, changeName } = useName();

  const handleClickConnect = () => {
    if (!name) return;
    connectToSocket({ name });
  };

  const handleClickDice = () => {
    rollDice();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">マッチングゲーム</h1>
        <p>
          ようこそ！{name || "--------"}さん
          <Button
            onClick={changeName}
            className="rounded-full px-4 ml-2"
            disabled={isConnected}
          >
            変更
          </Button>
        </p>
        <p className={isConnected ? "text-green-500" : "text-red-500"}>
          {isConnected ? "接続しています" : "接続していません"}
        </p>
        <p>待機中メンバー：{waitingPlayers?.join(" ")}</p>
        <p>入室中のルームID：{roomId || "--------"}</p>
        <Button onClick={handleClickConnect} disabled={isConnected}>
          {isConnected ? "接続中" : "socketIOに接続する"}
        </Button>
        {roomId && (
          <Button onClick={handleClickDice} disabled={!!dice}>
            {dice ? `あなたの目は${dice}です` : "サイコロを振る"}
          </Button>
        )}
        {roomId && (
          <div className="flex flex-col items-center border p-4">
            <h2>結果</h2>
            <ul>
              {results &&
                results.map((result) => (
                  <li key={result.socketId}>
                    {result.playerName}:{result.dice}
                  </li>
                ))}
            </ul>
          </div>
        )}
        {results?.every((result) => result.dice !== undefined) && (
          <p>
            あなたは
            {
              // resultsを,diceが大きい順に並べる
              results
                .toSorted((a, b) => (b.dice || 0) - (a.dice || 0))
                .findIndex((result) => result.dice === dice)
            }
            位です！
          </p>
        )}
      </div>
    </main>
  );
}
