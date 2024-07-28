"use client";

import WebApp from "@twa-dev/sdk";
import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import Hamster from "./icons/Hamster";
import {
  binanceLogo,
  dailyCipher,
  dailyCombo,
  dailyReward,
  dollarCoin,
  hamsterCoin,
  mainCharacter,
} from "./images";
import Info from "./icons/Info";
import Settings from "./icons/Settings";
import Mine from "./icons/Mine";
import Friends from "./icons/Friends";
import Coins from "./icons/Coins";

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

  const levelNames = [
    "Bronze", // From 0 to 4999 coins
    "Silver", // From 5000 coins to 24,999 coins
    "Gold", // From 25,000 coins to 99,999 coins
    "Platinum", // From 100,000 coins to 999,999 coins
    "Diamond", // From 1,000,000 coins to 2,000,000 coins
    "Epic", // From 2,000,000 coins to 10,000,000 coins
    "Legendary", // From 10,000,000 coins to 50,000,000 coins
    "Master", // From 50,000,000 coins to 100,000,000 coins
    "GrandMaster", // From 100,000,000 coins to 1,000,000,000 coins
    "Lord", // From 1,000,000,000 coins to ∞
  ];

  const levelMinPoints = [
    0, // Bronze
    5000, // Silver
    25000, // Gold
    100000, // Platinum
    1000000, // Diamond
    2000000, // Epic
    10000000, // Legendary
    50000000, // Master
    100000000, // GrandMaster
    1000000000, // Lord
  ];

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [levelIndex, setLevelIndex] = useState(6);
  const [points, setPoints] = useState(22749365);
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>(
    []
  );
  const pointsToAdd = 10000000;
  const profitPerHour = 126420;

  const [dailyRewardTimeLeft, setDailyRewardTimeLeft] = useState("");
  const [dailyCipherTimeLeft, setDailyCipherTimeLeft] = useState("");
  const [dailyComboTimeLeft, setDailyComboTimeLeft] = useState("");

  useEffect(() => {
    if (WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData);
    }
  }, []);
  const calculateTimeLeft = (hours: number) => {
    const now = new Date();
    const nextTarget = new Date();
    nextTarget.setHours(hours, 0, 0, 0);
    if (now > nextTarget) {
      nextTarget.setDate(nextTarget.getDate() + 1);
    }
    const diff = nextTarget.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hoursLeft}ч ${minutesLeft}м`;
  };

  useEffect(() => {
    const updateCountdowns = () => {
      setDailyRewardTimeLeft(calculateTimeLeft(0));
      setDailyCipherTimeLeft(calculateTimeLeft(19));
      setDailyComboTimeLeft(calculateTimeLeft(12));
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    card.style.transform = `perspective(1000px) rotateX(${
      -y / 10
    }deg) rotateY(${x / 10}deg)`;
    setTimeout(() => {
      card.style.transform = "";
    }, 100);

    setPoints(points + pointsToAdd);
    setClicks([...clicks, { id: Date.now(), x: e.pageX, y: e.pageY }]);
  };

  const handleAnimationEnd = (id: number) => {
    setClicks((prevClicks) => prevClicks.filter((click) => click.id !== id));
  };

  const calculateProgress = () => {
    if (levelIndex >= levelNames.length - 1) {
      return 100;
    }
    const currentLevelMin = levelMinPoints[levelIndex];
    const nextLevelMin = levelMinPoints[levelIndex + 1];
    const progress =
      ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
    return Math.min(progress, 100);
  };

  useEffect(() => {
    const currentLevelMin = levelMinPoints[levelIndex];
    const nextLevelMin = levelMinPoints[levelIndex + 1];
    if (points >= nextLevelMin && levelIndex < levelNames.length - 1) {
      setLevelIndex(levelIndex + 1);
    } else if (points < currentLevelMin && levelIndex > 0) {
      setLevelIndex(levelIndex - 1);
    }
  }, [points, levelIndex, levelMinPoints, levelNames.length]);

  const formatProfitPerHour = (profit: number) => {
    if (profit >= 1000000000) return `+${(profit / 1000000000).toFixed(2)}B`;
    if (profit >= 1000000) return `+${(profit / 1000000).toFixed(2)}M`;
    if (profit >= 1000) return `+${(profit / 1000).toFixed(2)}K`;
    return `+${profit}`;
  };

  useEffect(() => {
    const pointsPerSecond = Math.floor(profitPerHour / 3600);
    const interval = setInterval(() => {
      setPoints((prevPoints) => prevPoints + pointsPerSecond);
    }, 1000);
    return () => clearInterval(interval);
  }, [profitPerHour]);

  // Debounce function
  const debounce = (func: () => void, delay: number) => {
    let timerId: NodeJS.Timeout;
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(func, delay);
    };
  };

  // Function to save points to API
  const savePointsToAPI = async () => {
    if (userData) {
      const { first_name, username } = userData;
      const data = {
        name: first_name,
        username: username || "",
        points,
      };
      try {
        await fetch("https://70bd10f92f1843df.mokky.dev/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("Error saving points:", error);
      }
    }
  };

  // Debounced save function
  const debouncedSavePoints = useCallback(debounce(savePointsToAPI, 300), [
    points,
    userData,
  ]);

  useEffect(() => {
    debouncedSavePoints();
  }, [points, debouncedSavePoints]);

  return (
    <div className="bg-black flex justify-center">
      <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
        <div className="px-4 z-10">
          <div className="flex items-center space-x-2 pt-4">
            <div className="p-1 rounded-lg bg-[#1d2025]">
              <Hamster size={24} className="text-[#d4d4d4]" />
            </div>
            <div>
              <p className="text-sm">
                {userData ? userData.first_name : "Guest"} (CEO)
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between space-x-4 mt-1">
            <div className="flex items-center w-1/3">
              <div className="w-full">
                <div className="flex justify-between">
                  <p className="text-sm">{levelNames[levelIndex]}</p>
                  <p className="text-sm">
                    {levelIndex + 1}{" "}
                    <span className="text-[#95908a]">
                      / {levelNames.length}
                    </span>
                  </p>
                </div>
                <div className="flex items-center mt-1 border-2 border-[#43433b] rounded-full">
                  <div className="w-full h-2 bg-[#43433b]/[0.6] rounded-full">
                    <div
                      className="progress-gradient h-2 rounded-full"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center w-2/3 border-2 border-[#43433b] rounded-full px-4 py-[2px] bg-[#43433b]/[0.6] max-w-64">
              <img src={binanceLogo} alt="Exchange" className="w-8 h-8" />
              <div className="h-[32px] w-[2px] bg-[#43433b] mx-2"></div>
              <div className="flex-1 text-center">
                <p className="text-xs text-[#85827d] font-medium">
                  Прибыль в час
                </p>
                <div className="flex items-center justify-center space-x-1">
                  <img
                    src={dollarCoin}
                    alt="Dollar Coin"
                    className="w-[18px] h-[18px]"
                  />
                  <p className="text-sm">
                    {formatProfitPerHour(profitPerHour)}
                  </p>
                  <Info size={20} className="text-[#43433b]" />
                </div>
              </div>
              <div className="h-[32px] w-[2px] bg-[#43433b] mx-2"></div>
              <Settings className="text-white" />
            </div>
          </div>
        </div>

        <div className="flex-grow mt-4 bg-[#f3ba2f] relative rounded-t-3xl">
          <img
            src={mainCharacter}
            alt="Main Character"
            className="absolute -top-20 left-0 right-0 mx-auto w-[270px] h-auto z-10"
          />
          <div className="px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center text-center">
                <p className="text-sm text-[#1d2025]">Ежедневная награда</p>
                <img
                  src={dailyReward}
                  alt="Daily Reward"
                  className="w-[30px] h-[30px]"
                />
                <p className="text-xs text-[#1d2025]">{dailyRewardTimeLeft}</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <p className="text-sm text-[#1d2025]">Ежедневный шифр</p>
                <img
                  src={dailyCipher}
                  alt="Daily Cipher"
                  className="w-[30px] h-[30px]"
                />
                <p className="text-xs text-[#1d2025]">{dailyCipherTimeLeft}</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <p className="text-sm text-[#1d2025]">Ежедневный комбо</p>
                <img
                  src={dailyCombo}
                  alt="Daily Combo"
                  className="w-[30px] h-[30px]"
                />
                <p className="text-xs text-[#1d2025]">{dailyComboTimeLeft}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-2 bg-[#161819] rounded-b-3xl flex items-center justify-between space-x-2">
          <Mine size={28} className="text-[#f3ba2f]" />
          <Friends size={28} className="text-white/[0.5]" />
          <Coins size={28} className="text-white/[0.5]" />
        </div>
      </div>

      {clicks.map((click) => (
        <div
          key={click.id}
          className="click-animation"
          style={{ top: click.y, left: click.x }}
          onAnimationEnd={() => handleAnimationEnd(click.id)}
        >
          <img src={hamsterCoin} alt="Coin" />
        </div>
      ))}
    </div>
  );
};

export default App;
