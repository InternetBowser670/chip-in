export function runAdBreak(name: string) {
  if (typeof window === "undefined") return;
  
    console.log(`Running ad break: ${name}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;

  if (typeof w.adBreak !== "function") {
    console.warn("adBreak not ready");
    return;
  }

  w.adBreak({
    type: "start",
    name,
  });
}

export function runRewardedAd(onReward: () => void, pauseGame: () => void, resumeGame: () => void, muteAudio: () => void, unmuteAudio: () => void) {
  if (typeof window === "undefined") return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;

  if (typeof w.adBreak !== "function") {
    console.warn("Rewarded ad not ready");
    return;
  }

  w.adBreak({
    type: "reward",
    name: "rewarded-ad",
    beforeAd: () => {
      pauseGame();
      muteAudio();
    },
    afterAd: () => {
      resumeGame();
      unmuteAudio();
    },
    beforeReward: (showAdFn: () => void) => {
      showAdFn();
    },
    adDismissed: () => {
      console.log("User closed ad early");
    },
    adViewed: () => {
      console.log("Ad fully viewed");
      onReward();
    },
  });
}