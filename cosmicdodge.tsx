import React, { useState, useEffect, useRef } from 'react';
import { Star, Rocket, Zap, Shield, Heart, Bolt } from 'lucide-react';

const CosmicDodgeGame = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 80 });
  const [obstacles, setObstacles] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [shield, setShield] = useState(false);

  const gameAreaRef = useRef(null);
  const animationFrameRef = useRef(null);

  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 600;
  const PLAYER_SIZE = 40;
  const OBSTACLE_SIZE = 30;
  const POWERUP_SIZE = 30;
  const MOVE_SPEED = 5;

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setPlayerPosition({ x: 50, y: 80 });
    setObstacles([]);
    setPowerUps([]);
    setShield(false);
    setLevel(1);
    gameLoop();
  };

  const handleKeyDown = (e) => {
    if (!gameStarted || gameOver) return;

    switch (e.key) {
      case 'ArrowLeft':
        setPlayerPosition((prev) => ({
          ...prev,
          x: Math.max(0, prev.x - MOVE_SPEED),
        }));
        break;
      case 'ArrowRight':
        setPlayerPosition((prev) => ({
          ...prev,
          x: Math.min(GAME_WIDTH - PLAYER_SIZE, prev.x + MOVE_SPEED),
        }));
        break;
      case 'ArrowUp':
        setPlayerPosition((prev) => ({
          ...prev,
          y: Math.max(0, prev.y - MOVE_SPEED),
        }));
        break;
      case 'ArrowDown':
        setPlayerPosition((prev) => ({
          ...prev,
          y: Math.min(GAME_HEIGHT - PLAYER_SIZE, prev.y + MOVE_SPEED),
        }));
        break;
    }
  };

  const createObstacle = () => ({
    x: Math.random() * (GAME_WIDTH - OBSTACLE_SIZE),
    y: -OBSTACLE_SIZE,
    type: 'enemy',
  });

  const createPowerUp = () => ({
    x: Math.random() * (GAME_WIDTH - POWERUP_SIZE),
    y: -POWERUP_SIZE,
    type: Math.random() > 0.5 ? 'shield' : 'boost',
  });

  const gameLoop = () => {
    if (gameOver) return;

    setObstacles((prev) => {
      const updatedObstacles = prev
        .map((obs) => ({ ...obs, y: obs.y + level + 3 }))
        .filter((obs) => obs.y < GAME_HEIGHT);

      if (Math.random() < 0.02 * level) {
        updatedObstacles.push(createObstacle());
      }

      const collided = updatedObstacles.some((obs) =>
        !(
          playerPosition.x > obs.x + OBSTACLE_SIZE ||
          playerPosition.x + PLAYER_SIZE < obs.x ||
          playerPosition.y > obs.y + OBSTACLE_SIZE ||
          playerPosition.y + PLAYER_SIZE < obs.y
        )
      );

      if (collided) {
        if (shield) {
          setShield(false);
        } else {
          setLives((prev) => prev - 1);
          if (lives <= 1) {
            setGameOver(true);
          }
        }
      }

      return updatedObstacles;
    });

    setPowerUps((prev) => {
      const updatedPowerUps = prev
        .map((power) => ({ ...power, y: power.y + level + 2 }))
        .filter((power) => power.y < GAME_HEIGHT);

      if (Math.random() < 0.01) {
        updatedPowerUps.push(createPowerUp());
      }

      updatedPowerUps.forEach((power) => {
        const collected =
          !(
            playerPosition.x > power.x + POWERUP_SIZE ||
            playerPosition.x + PLAYER_SIZE < power.x ||
            playerPosition.y > power.y + POWERUP_SIZE ||
            playerPosition.y + PLAYER_SIZE < power.y
          );
        if (collected) {
          if (power.type === 'shield') {
            setShield(true);
          } else if (power.type === 'boost') {
            // Temporary speed boost
            setTimeout(() => setPlayerPosition((prev) => prev), 3000);
          }
        }
      });

      return updatedPowerUps;
    });

    setScore((prev) => prev + 1);
    if (score % 100 === 0) {
      setLevel((prev) => prev + 1);
    }

    if (!gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  };

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
          background:
            'radial-gradient(circle, rgba(20,20,50,1) 0%, rgba(0,0,0,1) 100%)',
        }}
      >
        {!gameStarted || gameOver ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">
              {gameOver ? 'GAME OVER' : 'COSMIC DODGE'}
            </h1>
            <p className="text-xl mb-6 text-gray-300">
              {gameOver ? `Your Score: ${score}` : 'Dodge cosmic obstacles, collect power-ups!'}
            </p>
            <button
              onClick={startGame}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-110"
            >
              {gameOver ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        ) : null}

        <div
          className="absolute transition-all duration-100"
          style={{
            left: `${playerPosition.x}px`,
            top: `${playerPosition.y}px`,
            width: `${PLAYER_SIZE}px`,
            height: `${PLAYER_SIZE}px`,
          }}
        >
          <Rocket className={shield ? 'text-blue-400' : 'text-white'} size={PLAYER_SIZE} />
        </div>

        {obstacles.map((obs, index) => (
          <div
            key={index}
            className="absolute transition-all duration-100"
            style={{
              left: `${obs.x}px`,
              top: `${obs.y}px`,
              width: `${OBSTACLE_SIZE}px`,
              height: `${OBSTACLE_SIZE}px`,
            }}
          >
            <Zap className="text-red-500" size={OBSTACLE_SIZE} />
          </div>
        ))}

        {powerUps.map((power, index) => (
          <div
            key={index}
            className="absolute transition-all duration-100"
            style={{
              left: `${power.x}px`,
              top: `${power.y}px`,
              width: `${POWERUP_SIZE}px`,
              height: `${POWERUP_SIZE}px`,
            }}
          >
            {power.type === 'shield' ? (
              <Shield className="text-green-400" size={POWERUP_SIZE} />
            ) : (
              <Bolt className="text-yellow-400" size={POWERUP_SIZE} />
            )}
          </div>
        ))}

        <div className="absolute top-2 left-2 flex items-center space-x-4">
          <div className="flex items-center">
            <Heart className="text-red-500 mr-2" size={24} />
            <span className="text-xl font-bold">{lives}</span>
          </div>
          <div className="text-xl font-bold">Score: {score}</div>
          <div className="text-xl font-bold">Level: {level}</div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-gray-300">Use Arrow Keys to Move. Dodge Obstacles. Collect Power-ups!</p>
      </div>
    </div>
  );
};

export default CosmicDodgeGame;
