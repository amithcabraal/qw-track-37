import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { GameResult } from '../../types/game';
import { SpotifyTrack } from '../../types/spotify';
import { ChallengeHeader } from './ChallengeHeader';
import { ChallengeTrackList } from './ChallengeTrackList';
import { NewGameButton } from './NewGameButton';
import { calculateGameStats } from '../../utils/gameStats';
import { getTrackById } from '../../services/spotifyApi';

interface ChallengeModeProps {
  originalResults: GameResult[];
  playerResults: GameResult[];
  onClose: () => void;
  onNewGame: () => void;
}

export const ChallengeMode: React.FC<ChallengeModeProps> = ({
  originalResults,
  playerResults,
  onNewGame,
}) => {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { 
    originalTotal, 
    playerTotal, 
    originalAvgTime, 
    playerAvgTime, 
    playerWon 
  } = calculateGameStats(originalResults, playerResults);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const trackPromises = originalResults.map(result => 
          getTrackById(result.trackId)
        );
        const fetchedTracks = await Promise.all(trackPromises);
        setTracks(fetchedTracks);
      } catch (error) {
        console.error('Failed to fetch tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, [originalResults]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
        <ChallengeHeader
          playerWon={playerWon}
          originalTotal={originalTotal}
          playerTotal={playerTotal}
          originalAvgTime={originalAvgTime}
          playerAvgTime={playerAvgTime}
        />

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
          </div>
        ) : (
          <ChallengeTrackList
            originalResults={originalResults}
            playerResults={playerResults}
            tracks={tracks}
          />
        )}

        <NewGameButton onClick={onNewGame} />
      </div>
    </div>
  );
};