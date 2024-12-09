import React, { useState, useEffect, useRef } from 'react';
import { Star, Rocket, Zap, Shield, Heart } from 'lucide-react';

// Cosmic Dodge: An epic space survival game
const CosmicDodgeGame = () => {
  // Game state
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 80 });
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Refs for game loop and canvas
  const gameAreaRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Game configuration
  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 600;
  const PLAYER_SIZE = 40;
  const OBSTACLE_SIZE = 30;
  const MOVE_SPEED = 5;

  // Start game function
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setPlayerPosition({ x: 50, y: 80 });
    setObstacles([]);
    gameLoop();
  };

  // Handle player movement
  const handleKeyDown = (e) => {
    if (!gameStarted || gameOver) return;

    switch(e.key) {
      case 'ArrowLeft':
        setPlayerPosition(prev => ({
          ...prev, 
          x: Math.max(0, prev.x - MOVE_SPEED)
        }));
        break;
      case 'ArrowRight':
        setPlayerPosition(prev => ({
          ...prev, 
          x: Math.min(GAME_WIDTH - PLAYER_SIZE, prev.x + MOVE_SPEED)
        }));
        break;
      case 'ArrowUp':
        setPlayerPosition(prev => ({
          ...prev, 
          y: Math.max(0, prev.y - MOVE_SPEED)
        }));
        break;
      case 'ArrowDown':
        setPlayerPosition(prev => ({
          ...prev, 
          y: Math.min(GAME_HEIGHT - PLAYER_SIZE, prev.y + MOVE_SPEED)
        }));
        break;
    }
  };

  // Create obstacles
  const createObstacle = () => {
    return {
      x: Math.random() * (GAME_WIDTH - OBSTACLE_SIZE),
      y: -OBSTACLE_SIZE,
      type: Math.random() > 0.7 ? 'enemy' : 'bonus'
    };
  };

  // Game loop
  const gameLoop = () => {
    if (gameOver) return;

    // Move obstacles
    setObstacles(prev => {
      const updatedObstacles = prev
        .map(obs => ({ ...obs, y: obs.y + 5 }))
        .filter(obs => obs.y < GAME_HEIGHT);

      // Randomly add new obstacles
      if (Math.random() < 0.1) {
        updatedObstacles.push(createObstacle());
      }

      // Collision detection
      const collided = updatedObstacles.some(obs => 
        !(playerPosition.x > obs.x + OBSTACLE_SIZE ||
          playerPosition.x + PLAYER_SIZE < obs.x ||
          playerPosition.y > obs.y + OBSTACLE_SIZE ||
          playerPosition.y + PLAYER_SIZE < obs.y)
      );

      if (collided) {
        setLives(prev => prev - 1);
        if (lives <= 1) {
          setGameOver(true);
        }
      }

      return updatedObstacles;
    });

    // Increment score
    setScore(prev => prev + 1);

    // Continue game loop
    if (!gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-blue-900 to-indigo-900 text-white">
      <div 
        ref={gameAreaRef}
        className="relative border-4 border-white rounded-lg overflow-hidden"
        style={{
          width: `${GAME_WIDTH}px`, 
          height: `${GAME_HEIGHT}px`,
          background: 'radial-gradient(circle, rgba(20,20,50,1) 0%, rgba(0,0,0,1) 100%)'
        }}
      >
        {!gameStarted || gameOver ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">
              {gameOver ? 'GAME OVER' : 'COSMIC DODGE'}
            </h1>
            <p className="text-xl mb-6 text-gray-300">
              {gameOver ? `Your Score: ${score}` : 'Dodge the cosmic obstacles!'}
            </p>
            <button 
              onClick={startGame}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-110"
            >
              {gameOver ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        ) : null}

        {/* Player Rocket */}
        <div 
          className="absolute transition-all duration-100"
          style={{
            left: `${playerPosition.x}px`, 
            top: `${playerPosition.y}px`,
            width: `${PLAYER_SIZE}px`,
            height: `${PLAYER_SIZE}px`
          }}
        >
          <Rocket className="text-blue-400" size={PLAYER_SIZE} />
        </div>

        {/* Obstacles */}
        {obstacles.map((obs, index) => (
          <div 
            key={index}
            className="absolute transition-all duration-100"
            style={{
              left: `${obs.x}px`, 
              top: `${obs.y}px`,
              width: `${OBSTACLE_SIZE}px`,
              height: `${OBSTACLE_SIZE}px`
            }}
          >
            {obs.type === 'enemy' ? (
              <Zap className="text-red-500" size={OBSTACLE_SIZE} />
            ) : (
              <Star className="text-yellow-300" size={OBSTACLE_SIZE} />
            )}
          </div>
        ))}

        {/* Game HUD */}
        <div className="absolute top-2 left-2 flex items-center space-x-4">
          <div className="flex items-center">
            <Heart className="text-red-500 mr-2" size={24} />
            <span className="text-xl font-bold">{lives}</span>
          </div>
          <div className="text-xl font-bold">
            Score: {score}
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-gray-300">
          Use Arrow Keys to Move. Dodge Obstacles. Survive!
        </p>
      </div>
    </div>
  );
};

export default CosmicDodgeGame;
