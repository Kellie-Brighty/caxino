import {
  ref,
  set,
  onValue,
  get,
  update,
  DataSnapshot,
} from "firebase/database";
import { db } from "../config/firebase";
import { LeaderboardEntry, Player, GameStats } from "../types";

export const firebaseService = {
  // User Management
  async createUser(username: string, walletAddress: string): Promise<void> {
    const userRef = ref(db, `users/${walletAddress}`);
    await set(userRef, {
      username,
      walletAddress,
      points: 0,
      gamesPlayed: 0,
      createdAt: new Date().toISOString(),
    });
  },

  // Points Management
  async updatePoints(walletAddress: string, newPoints: number): Promise<void> {
    const userRef = ref(db, `users/${walletAddress}`);
    const snapshot = await get(userRef);
    const userData = snapshot.val();

    await update(userRef, {
      points: (userData?.points || 0) + newPoints,
      gamesPlayed: (userData?.gamesPlayed || 0) + 1,
      lastUpdated: new Date().toISOString(),
      gameHistory: [
        ...(userData?.gameHistory || []),
        {
          points: newPoints,
          timestamp: new Date().toISOString(),
        },
      ],
    });
  },

  // Leaderboard
  onLeaderboardChange(
    callback: (entries: LeaderboardEntry[]) => void,
    period: "all" | "today" | "week" = "all"
  ): () => void {
    const leaderboardRef = ref(db, "users");

    const unsubscribe = onValue(leaderboardRef, (snapshot: DataSnapshot) => {
      const users = snapshot.val();
      if (!users) return callback([]);

      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const startOfWeek = new Date(
        now.setDate(now.getDate() - 7)
      ).toISOString();

      const entries = Object.values(users)
        .map((user: any) => {
          const lastGamePoints =
            user.gameHistory?.[user.gameHistory.length - 1]?.points || 0;
          const previousGamePoints =
            user.gameHistory?.[user.gameHistory.length - 2]?.points || 0;

          let trend: "up" | "down" | "stable" = "stable";
          if (lastGamePoints > previousGamePoints) trend = "up";
          else if (lastGamePoints < previousGamePoints) trend = "down";

          return {
            username: user.username,
            address: user.walletAddress,
            points: user.points || 0,
            rank: 0,
            gamesPlayed: user.gamesPlayed || 0,
            averagePoints: user.points / (user.gamesPlayed || 1),
            lastPlayed: user.lastUpdated || user.createdAt,
            trend,
          };
        })
        .filter((user) => {
          if (period === "today") return user.lastPlayed >= startOfDay;
          if (period === "week") return user.lastPlayed >= startOfWeek;
          return true;
        })
        .sort((a, b) => b.points - a.points)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))
        .slice(0, 5);

      callback(entries);
    });

    return unsubscribe;
  },

  // User Stats
  async getUserStats(walletAddress: string): Promise<Player | null> {
    const userRef = ref(db, `users/${walletAddress}`);
    const snapshot = await get(userRef);
    return snapshot.val();
  },

  onUserStatsChange(
    walletAddress: string,
    callback: (stats: Player) => void
  ): () => void {
    const userRef = ref(db, `users/${walletAddress}`);

    const unsubscribe = onValue(userRef, (snapshot: DataSnapshot) => {
      const userData = snapshot.val();
      if (userData) {
        callback({
          address: userData.walletAddress,
          points: userData.points || 0,
          gamesPlayed: userData.gamesPlayed || 0,
          username: userData.username,
          lastUpdated: userData.lastUpdated,
          gameHistory: userData.gameHistory || [],
        });
      }
    });

    return unsubscribe;
  },

  // Stats
  onGameStatsChange(callback: (stats: GameStats) => void): () => void {
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(usersRef, (snapshot: DataSnapshot) => {
      const users = snapshot.val();
      if (!users) {
        callback({
          totalPlayers: 0,
          totalRegistered: 0,
          totalPoints: 0,
          averagePointsPerPlayer: 0,
          topPlayerToday: null,
          gamesPlayedToday: 0,
        });
        return;
      }

      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();

      const statsData = Object.values(users).reduce(
        (acc: GameStats, user: any) => {
          const hasPoints = user.points > 0;
          const playedToday = user.lastUpdated >= startOfDay;

          return {
            ...acc,
            totalPlayers: hasPoints ? acc.totalPlayers + 1 : acc.totalPlayers,
            totalRegistered: acc.totalRegistered + 1,
            totalPoints: acc.totalPoints + (user.points || 0),
            gamesPlayedToday: playedToday
              ? acc.gamesPlayedToday + (user.gamesPlayed || 0)
              : acc.gamesPlayedToday,
            topPlayerToday:
              playedToday &&
              (!acc.topPlayerToday || user.points > acc.topPlayerToday.points)
                ? { username: user.username, points: user.points }
                : acc.topPlayerToday,
          };
        },
        {
          totalPlayers: 0,
          totalRegistered: 0,
          totalPoints: 0,
          gamesPlayedToday: 0,
          topPlayerToday: null,
          averagePointsPerPlayer: 0,
        }
      );

      callback({
        ...statsData,
        averagePointsPerPlayer:
          statsData.totalPlayers > 0
            ? Math.round(statsData.totalPoints / statsData.totalPlayers)
            : 0,
      });
    });

    return unsubscribe;
  },

  async getSixthPlace(): Promise<LeaderboardEntry | null> {
    const usersRef = ref(db, "users");
    const snapshot = await get(usersRef);
    const users = snapshot.val();

    if (!users) return null;

    const entries = Object.values(users)
      .map((user: any) => {
        const lastGamePoints =
          user.gameHistory?.[user.gameHistory.length - 1]?.points || 0;
        const previousGamePoints =
          user.gameHistory?.[user.gameHistory.length - 2]?.points || 0;

        let trend: "up" | "down" | "stable" = "stable";
        if (lastGamePoints > previousGamePoints) trend = "up";
        else if (lastGamePoints < previousGamePoints) trend = "down";

        return {
          username: user.username,
          address: user.walletAddress,
          points: user.points || 0,
          rank: 6,
          gamesPlayed: user.gamesPlayed || 0,
          averagePoints: user.points / (user.gamesPlayed || 1),
          lastPlayed: user.lastUpdated || user.createdAt,
          trend,
        };
      })
      .filter((user) => user.points > 0)
      .sort((a, b) => b.points - a.points)[5];

    return entries || null;
  },

  onAllPlayersChange(
    callback: (entries: LeaderboardEntry[]) => void
  ): () => void {
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(usersRef, (snapshot: DataSnapshot) => {
      const users = snapshot.val();
      if (!users) return callback([]);

      const entries = Object.values(users)
        .map((user: any) => {
          const lastGamePoints =
            user.gameHistory?.[user.gameHistory.length - 1]?.points || 0;
          const previousGamePoints =
            user.gameHistory?.[user.gameHistory.length - 2]?.points || 0;

          let trend: "up" | "down" | "stable" = "stable";
          if (lastGamePoints > previousGamePoints) trend = "up";
          else if (lastGamePoints < previousGamePoints) trend = "down";

          return {
            username: user.username,
            address: user.walletAddress,
            points: user.points || 0,
            rank: 0,
            gamesPlayed: user.gamesPlayed || 0,
            averagePoints: user.points / (user.gamesPlayed || 1),
            lastPlayed: user.lastUpdated || user.createdAt,
            trend,
          };
        })
        .sort((a, b) => b.points - a.points)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      callback(entries);
    });

    return unsubscribe;
  },
};
