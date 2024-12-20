import React, { useState, useEffect } from 'react';
import { PlaylistSelector } from '../components/PlaylistSelector';
import { GamePlayer } from '../components/GamePlayer';
import { Header } from '../components/Header';
import { ChallengeMode } from '../components/ChallengeMode';
import { SpotifyPlaylist, SpotifyTrack } from '../types/spotify';
import { getUserPlaylists, getPlaylistTracks, getTrackById } from '../services/spotifyApi';
import { GameResult } from '../types/game';

interface HomeProps {
  challengeData?: any;
}

export const Home: React.FC<HomeProps> = ({ challengeData }) => {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playedTracks, setPlayedTracks] = useState<Set<string>>(new Set());
  const [isReadyForNextTrack, setIsReadyForNextTrack] = useState(true);
  const [playerResults, setPlayerResults] = useState<GameResult[]>([]);
  const [showChallengeResults, setShowChallengeResults] = useState(false);

  useEffect(() => {
    if (!challengeData) {
      getUserPlaylists()
        .then(data => {
          setPlaylists(data.items);
        })
        .catch(error => {
          console.error('Failed to fetch playlists:', error);
          setError('Failed to load playlists. Please try again.');
        });
    } else if (challengeData.length > 0 && isReadyForNextTrack) {
      const currentIndex = playedTracks.size;
      if (currentIndex < challengeData.length) {
        getTrackById(challengeData[currentIndex].trackId)
          .then(track => {
            setCurrentTrack(track);
            setIsReadyForNextTrack(false);
          })
          .catch(error => {
            console.error('Failed to fetch challenge track:', error);
            setError('Failed to load challenge track');
          });
      } else if (currentIndex === challengeData.length) {
        setShowChallengeResults(true);
      }
    }
  }, [challengeData, playedTracks, isReadyForNextTrack]);

  const handlePlaylistSelect = async (playlist: SpotifyPlaylist) => {
    try {
      setCurrentPlaylist(playlist);
      
      if (challengeData) {
        setIsReadyForNextTrack(true);
      } else {
        const response = await getPlaylistTracks(playlist.id);
        const validTracks = response.items
          .map(item => item.track)
          .filter(track => !playedTracks.has(track.id));

        if (validTracks.length === 0) {
          setError('No more unplayed tracks in this playlist!');
          return;
        }

        const randomTrack = validTracks[Math.floor(Math.random() * validTracks.length)];
        setCurrentTrack(randomTrack);
        setPlayedTracks(prev => new Set([...prev, randomTrack.id]));
      }
      
      setError(null);
    } catch (error) {
      console.error('Failed to get tracks:', error);
      setError('Failed to load tracks. Please try again.');
    }
  };

  const handleGameComplete = (score: number) => {
    if (currentTrack) {
      const gameResult: GameResult = {
        trackId: currentTrack.id,
        trackName: currentTrack.name,
        artistName: currentTrack.artists[0].name,
        albumImage: currentTrack.album.images[0]?.url || '',
        score,
        time: Number(document.querySelector('.text-4xl.font-bold.mb-2')?.textContent?.replace('s', '') || 0),
        timestamp: Date.now()
      };

      setPlayedTracks(prev => new Set([...prev, currentTrack.id]));
      if (challengeData) {
        setPlayerResults(prev => [...prev, gameResult]);
      }
    }
  };

  const handlePlayAgain = () => {
    setIsReadyForNextTrack(true);
    if (!challengeData && currentPlaylist) {
      handlePlaylistSelect(currentPlaylist);
    }
  };

  const handleNewGame = () => {
    setCurrentTrack(null);
    setCurrentPlaylist(null);
    setPlayedTracks(new Set());
    setPlayerResults([]);
    setShowChallengeResults(false);
    setIsReadyForNextTrack(true);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header onNewGame={handleNewGame} />
      
      <main className="pt-16">
        {showChallengeResults && challengeData ? (
          <ChallengeMode
            originalResults={challengeData}
            playerResults={playerResults}
            onClose={handleNewGame}
            onNewGame={handleNewGame}
          />
        ) : !currentTrack ? (
          <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">
              {challengeData ? 'Challenge Mode' : 'Your Playlists'}
            </h2>
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200">
                {error}
              </div>
            )}
            <PlaylistSelector 
              playlists={playlists} 
              onSelect={handlePlaylistSelect}
              challengeData={challengeData}
            />
          </div>
        ) : (
          <GamePlayer 
            track={currentTrack} 
            onGameComplete={handleGameComplete}
            onPlayAgain={handlePlayAgain}
            challengeData={challengeData}
          />
        )}
      </main>
    </div>
  );
};