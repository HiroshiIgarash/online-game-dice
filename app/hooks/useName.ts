import { useEffect, useState } from "react";
import { nameList } from "../nameList";

export const useName = () => {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    const randNameIndex = Math.floor(Math.random() * nameList.length);
    setName(nameList[randNameIndex]);
    return () => {
      setName(null);
    };
  }, []);

  const changeName = () => {
    const randNameIndex = Math.floor(Math.random() * nameList.length);
    setName(nameList[randNameIndex]);
  };

  return { name, changeName };
};
