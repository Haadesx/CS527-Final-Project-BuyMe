import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { Fade, Slide } from 'react-awesome-reveal';

const featuredAuctions = [
  { id: 1, title: '1967 Shelby GT500', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2670&auto=format&fit=crop', currentBid: 250000 },
  { id: 2, title: 'Patek Philippe Nautilus', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2680&auto=format&fit=crop', currentBid: 120000 },
  { id: 3, title: 'Villa in Tuscany', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop', currentBid: 4500000 },
];

const carouselImages = [
  'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2670&auto=format&fit=crop', // Luxury Hall
  'https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2670&auto=format&fit=crop', // Luxury Car
  'https://images.unsplash.com/photo-1599658880436-c61792e70672?q=80&w=2670&auto=format&fit=crop', // Gold/Jewelry
];

const Hero = () => {
  const navigate = useNavigate();

  const handleAuctionClick = (id) => {
    navigate(`/auction/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-cream-50 min-h-screen">
      {/* Cinematic Hero Slider */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          className="h-full w-full"
        >
          {carouselImages.map((img, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <img
                  src={img}
                  alt={`Luxury ${index + 1}`}
                  className="w-full h-full object-cover animate-slow-zoom"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
          <Fade direction="up" duration={1500} triggerOnce>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-cream-50 mb-6 tracking-tight drop-shadow-lg">
              <span className="block text-gold-400 text-2xl md:text-3xl tracking-[0.3em] font-light mb-4 uppercase">The Collection</span>
              EXCLUSIVE. TIMELESS. <br /> YOURS.
            </h1>
          </Fade>
          <Fade direction="up" delay={500} duration={1500} triggerOnce>
            <p className="text-lg md:text-xl text-cream-100 max-w-2xl mb-10 font-light tracking-wide leading-relaxed">
              Curated for the uncompromising few. If you have to ask the price, you simply do not belong.
            </p>
          </Fade>
          <Fade direction="up" delay={1000} duration={1500} triggerOnce>
            <Link
              to="/auctions"
              className="group relative px-10 py-4 bg-transparent border border-gold-400 text-gold-400 font-serif text-lg tracking-widest uppercase hover:bg-gold-400 hover:text-emerald-900 transition-all duration-500"
            >
              Enter The Vault
              <span className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-gold-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-gold-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
          </Fade>
        </div>
      </div>

      {/* Featured Auctions */}
      <div className="py-24 px-6 md:px-12 bg-cream-50">
        <div className="max-w-7xl mx-auto">
          <Fade direction="up" triggerOnce>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-emerald-900 mb-4">Current Acquisitions</h2>
              <div className="w-24 h-1 bg-gold-400 mx-auto" />
              <p className="mt-4 text-charcoal-900 font-light tracking-wide">Opportunities for the discerning collector.</p>
            </div>
          </Fade>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {featuredAuctions.map((auction, index) => (
              <Fade key={auction.id} direction="up" delay={index * 200} triggerOnce>
                <div className="group cursor-pointer" onClick={() => handleAuctionClick(auction.id)}>
                  <div className="relative overflow-hidden h-96 w-full mb-6 shadow-xl">
                    <div className="absolute inset-0 bg-emerald-900/0 group-hover:bg-emerald-900/20 transition-colors duration-500 z-10" />
                    <img
                      src={auction.image}
                      alt={auction.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-gold-400 font-serif italic text-lg">Current Bid</p>
                      <p className="text-cream-50 text-2xl font-bold">${auction.currentBid.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-serif font-bold text-emerald-900 mb-2 group-hover:text-gold-500 transition-colors">{auction.title}</h3>
                    <button className="text-sm uppercase tracking-widest text-charcoal-900 border-b border-gold-400 pb-1 hover:text-gold-500 transition-colors">
                      View Lot
                    </button>
                  </div>
                </div>
              </Fade>
            ))}
          </div>

          <div className="text-center mt-20">
            <Link to="/auctions" className="inline-block px-12 py-3 bg-emerald-900 text-gold-400 font-serif tracking-widest hover:bg-emerald-800 transition-colors shadow-lg">
              VIEW ALL LOTS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;