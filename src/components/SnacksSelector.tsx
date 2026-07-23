import React from 'react';
import { useCinema } from '../context/CinemaContext';
import { FoodItem } from '../types';
import { Plus, Minus, Popcorn, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';

export const SnacksSelector: React.FC = () => {
  const {
    foodItems,
    selectedSnacks,
    updateSnackQuantity,
    proceedToPayment,
    selectedSeats,
    bookingShowtime
  } = useCinema();

  // Calculate totals
  const snacksTotal = selectedSnacks.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#090A0E] border border-[#D4AF37]/30 rounded-3xl p-4 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] my-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] mb-1">
            <Popcorn className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">GAJURI CINEMAS REFRESHMENTS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Pre-Order Popcorn, Momos & Beverages
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Skip the concession line! Your snacks will be freshly prepared and delivered right to your seat.
          </p>
        </div>

        <button
          id="skip-snacks-btn"
          onClick={proceedToPayment}
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
        >
          Skip Snacks
        </button>
      </div>

      {/* Food Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
        {foodItems.map((item) => {
          const selected = selectedSnacks.find((s) => s.foodId === item.id);
          const quantity = selected ? selected.quantity : 0;

          return (
            <div
              key={item.id}
              id={`food-item-card-${item.id}`}
              className={`relative bg-[#12131C] rounded-2xl border p-4 transition-all flex flex-col justify-between overflow-hidden ${
                quantity > 0
                  ? 'border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {item.popular && (
                <div className="absolute top-3 right-3 bg-[#D4AF37] text-black font-extrabold text-[10px] px-2 py-0.5 rounded shadow">
                  BESTSELLER
                </div>
              )}

              <div className="flex gap-4 items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/10"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-light">{item.description}</p>
                  <p className="text-sm font-bold text-[#D4AF37] mt-2">NPR {item.price}</p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-400">Add to order:</span>
                <div className="flex items-center gap-3 bg-[#1A1B28] rounded-xl border border-white/10 p-1">
                  <button
                    id={`snack-minus-${item.id}`}
                    onClick={() => updateSnackQuantity(item, -1)}
                    disabled={quantity === 0}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold text-white w-6 text-center">{quantity}</span>
                  <button
                    id={`snack-plus-${item.id}`}
                    onClick={() => updateSnackQuantity(item, 1)}
                    className="p-1 rounded-lg bg-[#D4AF37] text-black font-bold hover:bg-amber-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#12131C] p-4 sm:p-6 rounded-2xl border border-[#D4AF37]/30">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Added Refreshments ({selectedSnacks.length} items)</p>
            <p className="text-xl font-bold text-white">NPR {snacksTotal.toLocaleString()}</p>
          </div>
        </div>

        <button
          id="proceed-to-payment-btn"
          onClick={proceedToPayment}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-300 hover:to-amber-500 text-black font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>CONTINUE TO PAYMENT</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
