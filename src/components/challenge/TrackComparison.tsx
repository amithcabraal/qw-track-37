import React from 'react';
import { GameResult } from '../../types/game';

interface TrackComparisonProps {
  original: GameResult;
  player?: GameResult;
}

export const TrackComparison: React.FC<TrackComparisonProps> = ({ original, player }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
    <div className="flex-shrink-0">
      <img
        src={original.albumImage}
        alt={original.trackName}
        className="w-16 h-16 rounded-lg object-cover"
      />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-lg truncate dark:text-white">
        {original.trackName}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
        {original.artistName}
      </p>
    </div>
    <div className="text-right flex-shrink-0">
      <div className="font-bold text-lg dark:text-white">
        {original.score} vs {player?.score || 0}
      </div>
      <div className="text-sm text-gray-500">
        {original.time.toFixed(1)}s vs {player?.time.toFixed(1) || '0.0'}s
      </div>
    </div>
  </div>
);