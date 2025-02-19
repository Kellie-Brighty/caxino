export const GAME_SOUNDS = {
  START: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_c8c8a73467.mp3?filename=game-start-6104.mp3",
  SUCCESS: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_12904d4024.mp3?filename=success-1-6297.mp3",
  POP: "https://cdn.pixabay.com/download/audio/2022/10/23/audio_946be89a6b.mp3?filename=pop-click-sound-113125.mp3"
};

export const playSound = (soundUrl: string) => {
  const audio = new Audio(soundUrl);
  audio.play().catch(() => {
    // Silently fail if audio playback is blocked
  });
}; 