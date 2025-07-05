import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Globe, Search, Star, Clock } from 'lucide-react';

const HomePage: React.FC = () => {
  console.log('🏠 HomePage component is loading!');
  const navigate = useNavigate();

  const handleChatClick = () => {
    console.log('navigating to chat interface...');
    navigate('/chat');
  };

  const handleVirtualWorldClick = () => {
    alert('virtual world feature coming soon! 🌱✨');
  };

  const handleButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
  };

  const handleButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(0) scale(1)';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5, #f0fdfa)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        textAlign: 'center'
      }}>
        
        {/* logo section */}
        <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            position: 'relative',
            width: '180px',
            height: '180px',
            margin: '0 auto'
          }}>
            <img 
              src="/transparent.png" 
              alt="Greenthumb Logo" 
              style={{
                width: '180px',
                height: '180px',
                objectFit: 'contain',
                filter: 'brightness(0)',
              }}
            />
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to right, #10b981, #059669)',
              WebkitMask: 'url("/transparent.png") center/contain no-repeat',
              mask: 'url("/transparent.png") center/contain no-repeat'
            }} />
          </div>
        </div>

        {/* title section */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #059669, #10b981, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1.5rem',
            fontFamily: "'Playfair Display', serif",
            letterSpacing: '-0.02em'
          }}>
            Greenthumb
          </h1>
          <p style={{
            fontSize: 'clamp(1.25rem, 4vw, 2rem)',
            color: '#047857',
            fontWeight: '300',
            letterSpacing: '0.05em'
          }}>
            AI Cultivation Assistant
          </p>
        </div>

        {/* description */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: 'clamp(1.875rem, 5vw, 3rem)',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '2rem',
            lineHeight: '1.2',
            fontFamily: "'Playfair Display', serif"
          }}>
            Your Personal Garden Companion
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
            color: '#4b5563',
            lineHeight: '1.6',
            fontWeight: '300',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            Meet your AI-powered cultivation assistant! Whether you're a seasoned gardener or just starting your green journey, 
            Greenthumb provides personalized advice, troubleshooting help, and expert guidance to help your plants thrive. 
            From seed to harvest, we're here to make gardening accessible, enjoyable, and successful for everyone.
          </p>
        </div>

        {/* action buttons */}
        <div style={{ marginBottom: '4rem', display: 'flex', flexDirection: 'row', gap: '1.5rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={handleChatClick}
            onMouseEnter={handleButtonMouseEnter}
            onMouseLeave={handleButtonMouseLeave}
            style={{
              background: 'linear-gradient(to right, #10b981, #059669)',
              color: 'white',
              fontWeight: '600',
              padding: '1rem 2rem',
              borderRadius: '1rem',
              border: 'none',
              fontSize: '1.125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            <MessageCircle style={{ width: '24px', height: '24px' }} />
            Start Chatting
            <span style={{ transition: 'transform 0.3s ease' }}>→</span>
          </button>

          <button 
            onClick={handleVirtualWorldClick}
            onMouseEnter={handleButtonMouseEnter}
            onMouseLeave={handleButtonMouseLeave}
            style={{
              background: 'white',
              color: '#059669',
              fontWeight: '600',
              padding: '1rem 2rem',
              borderRadius: '1rem',
              border: '2px solid #10b981',
              fontSize: '1.125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            <Globe style={{ width: '24px', height: '24px' }} />
            Jump into Virtual World
            <span style={{
              background: 'linear-gradient(to right, #f59e0b, #ea580c)',
              color: 'white',
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              marginLeft: '0.5rem'
            }}>
              Coming Soon
            </span>
          </button>
        </div>

        {/* features grid */}
        <div style={{ marginBottom: '3rem', maxWidth: '1000px', margin: '0 auto 3rem auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #34d399, #10b981)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <Search style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.75rem',
                fontFamily: "'Playfair Display', serif"
              }}>
                Plant Diagnosis
              </h3>
              <p style={{ color: '#4b5563', fontWeight: '300', margin: 0 }}>
                identify issues and get instant solutions for sick plants
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #34d399, #10b981)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <Star style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.75rem',
                fontFamily: "'Playfair Display', serif"
              }}>
                Growth Tips
              </h3>
              <p style={{ color: '#4b5563', fontWeight: '300', margin: 0 }}>
                personalized advice for optimal plant care and growth
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #34d399, #10b981)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <Clock style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.75rem',
                fontFamily: "'Playfair Display', serif"
              }}>
                24/7 Support
              </h3>
              <p style={{ color: '#4b5563', fontWeight: '300', margin: 0 }}>
                always available AI assistant for all your gardening questions
              </p>
            </div>
          </div>
        </div>

        {/* footer */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            color: '#6b7280',
            fontSize: '0.875rem',
            fontWeight: '300',
            margin: 0
          }}>
            built with 💚 by <span style={{ fontWeight: '500', color: '#059669' }}>cheddarqueso</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 