import React, { useState } from 'react';
import { Movie } from '../types';
import { useCinema } from '../context/CinemaContext';
import { Play, Ticket, Star, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface MovieCardProps {
  movie: Movie;
  onSelect?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelect }) => {
  const { startBooking, setTrailerUrl } = useCinema();
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.getBoundingClientRect();
    const cardWidth = card.width;
    const cardHeight = card.height;
    const centerX = card.left + cardWidth / 2;
    const centerY = card.top + cardHeight / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    const rotateXValue = (mouseY / (cardHeight / 2)) * -12;
    const rotateYValue = (mouseX / (cardWidth / 2)) * 12;
    setRotate({ x: rotateXValue, y: rotateYValue });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const handleBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(movie);
    } else {
      startBooking(movie);
    }
  };

  const handleTrailer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTrailerUrl(movie.youtubeTrailerUrl);
  };

  return (
    <motion.div
      id={`movie-card-${movie.id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => (onSelect ? onSelect(movie) : startBooking(movie))}
      animate={{
        rotateX: rotate.x,
        rotateY: rotate.y,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{ perspective: 1000 }}
      className="group relative bg-[#12131C] rounded-2xl border border-white/10 hover:border-[#D4AF37]/60 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(212,175,55,0.25)] overflow-hidden flex flex-col cursor-pointer transform-gpu"
    >
      {/* Dynamic Gold Light Highlight Reflection */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
        style={{
          background: `radial-gradient(600px circle at ${rotate.y * 10 + 50}% ${
            rotate.x * -10 + 50
          }%, rgba(212, 175, 55, 0.15), transparent 80%)`,
        }}
      />

      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-black/80 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] shadow-lg">
            {movie.hallType.includes('IMAX') ? 'IMAX 3D' : 'Dolby Atmos'}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center gap-1 shadow-lg">
            <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
            <span>{movie.rating}</span>
          </span>
        </div>

        {/* Play Trailer Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 gap-3 z-20 backdrop-blur-[2px]">
          <button
            id={`play-trailer-btn-${movie.id}`}
            onClick={handleTrailer}
            className="w-13 h-13 rounded-full bg-[#D4AF37] text-black flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.8)] hover:scale-115 transition-transform duration-300"
            title="Watch Official YouTube Trailer"
          >
            <Play className="w-6 h-6 fill-black ml-0.5" />
          </button>
        </div>

        {/* Bottom Tag */}
        {movie.status === 'COMING_SOON' && (
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <span className="block text-center py-1 rounded-lg text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg">
              RELEASE: {movie.releaseDate}
            </span>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-4 flex flex-col justify-between flex-1 space-y-3 z-10">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1 font-serif">
            {movie.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{movie.duration}</span>
            </span>
            <span>•</span>
            <span className="line-clamp-1">{movie.genre.slice(0, 2).join(', ')}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          id={`book-card-btn-${movie.id}`}
          onClick={handleBook}
          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-amber-400 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-slate-200 hover:text-black font-extrabold text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-md"
        >
          <Ticket className="w-4 h-4 text-[#D4AF37] group-hover/btn:text-black transition-colors" />
          <span>{movie.status === 'COMING_SOON' ? 'PRE-BOOK TICKET' : 'GET TICKETS'}</span>
        </button>
      </div>
    </motion.div>
  );
};

