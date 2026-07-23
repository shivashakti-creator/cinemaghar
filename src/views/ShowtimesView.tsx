import React, { useState } from 'react';
import { useCinema } from '../context/CinemaContext';
import { Calendar, Clock, Armchair, Ticket, Sparkles } from 'lucide-react';

export const ShowtimesView: React.FC = () => {
  const { showtimes, movies, startBooking } = useCinema();

  const [selectedDate, setSelectedDate] = useState('2026-07-23');

  const dates = [
    { label: 'Today (23 Jul)', date: '2026-07-23' },
    { label: 'Tomorrow (24 Jul)', date: '2026-07-24' },
    { label: 'Saturday (25 Jul)', date: '2026-07-25' },
    { label: 'Sunday (26 Jul)', date: '2026-07-26' }
  ];

  const filteredShowtimes = showtimes.filter((s) => s.date === selectedDate);

  // Group by movie
  const groupedMovieIds = Array.from(new Set(filteredShowtimes.map((s) => s.movieId)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-[#D4AF37] mb-1">
          <Calendar className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">GAJURI CINEMAS SCHEDULE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white">
          Showtimes & Booking
        </h1>
        <p className="text-xs text-slate-400 mt-1">Select your preferred movie date and time slot to reserve your seats.</p>
      </div>

      {/* Date Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Date Tabs */}
        <div className="flex flex-wrap gap-2">
          {dates.map((d) => (
            <button
              key={d.date}
              id={`date-tab-${d.date}`}
              onClick={() => setSelectedDate(d.date)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedDate === d.date
                  ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'bg-[#12131C] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

      </div>

      {/* Grouped Showtimes List */}
      {groupedMovieIds.length > 0 ? (
        <div className="space-y-8">
          {groupedMovieIds.map((movieId) => {
            const movie = movies.find((m) => m.id === movieId);
            if (!movie) return null;

            const movieShowtimes = filteredShowtimes.filter((s) => s.movieId === movieId);

            return (
              <div
                key={movieId}
                className="bg-[#12131C] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-14 h-20 rounded-xl object-cover border border-white/10"
                    />
                    <div>
                      <h3 className="text-xl font-bold font-serif text-white">{movie.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{movie.duration}</span>
                        <span>•</span>
                        <span>{movie.languages.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                    {movie.hallType}
                  </span>
                </div>

                {/* Showtimes Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {movieShowtimes.map((st) => {
                    const totalSeatsCount = 84;
                    const availableSeats = totalSeatsCount - st.bookedSeatIds.length - st.blockedSeatIds.length;

                    return (
                      <div
                        key={st.id}
                        id={`showtime-card-${st.id}`}
                        onClick={() => startBooking(movie, st)}
                        className="group bg-[#1A1B28] rounded-2xl border border-white/10 hover:border-[#D4AF37] p-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-white font-mono group-hover:text-[#D4AF37] transition-colors">
                            {st.time}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black text-[#D4AF37] border border-[#D4AF37]/30">
                            {st.format}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-slate-400">
                          <p className="line-clamp-1">{st.hallName}</p>
                          <p className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Armchair className="w-3.5 h-3.5" />
                            <span>{availableSeats} Seats Available</span>
                          </p>
                          <p className="text-slate-300 font-medium">
                            Starts at <strong className="text-white">NPR {st.prices.regular}</strong>
                          </p>
                        </div>

                        <button
                          id={`select-seat-btn-${st.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            startBooking(movie, st);
                          }}
                          className="w-full py-2 rounded-xl bg-[#D4AF37]/10 group-hover:bg-[#D4AF37] text-[#D4AF37] group-hover:text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>SELECT SEATS</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#12131C] rounded-3xl border border-white/10 space-y-3">
          <Clock className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-lg font-bold text-white">No showtimes scheduled for this date & hall filter</p>
          <p className="text-xs text-slate-400">Try choosing a different date above.</p>
        </div>
      )}

    </div>
  );
};
