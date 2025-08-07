import { useEffect, useState } from "react";

const AttivitaGrid = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const activities = [
    {
      title: "Animazione territoriale",
      href: "/le-nostre-attivita?categoria=Animazione+territoriale",
      animationClass: "animate-fade-in-right"
    },
    {
      title: "Educazione alla legalità", 
      href: "/le-nostre-attivita?categoria=Educazione+alla+legalit%C3%A0",
      animationClass: "animate-fade-in-left"
    },
    {
      title: "Politiche giovanili",
      href: "/le-nostre-attivita?categoria=Politiche+giovanili", 
      animationClass: "animate-fade-in-left"
    },
    {
      title: "Sviluppo di ricerche/Intervento",
      href: "/le-nostre-attivita?categoria=Sviluppo+di+ricerche%2FIntervento",
      animationClass: "animate-fade-in-right"
    },
    {
      title: "Promozione del territorio",
      href: "/le-nostre-attivita?categoria=Promozione+del+territorio",
      animationClass: "animate-fade-in-right"
    },
    {
      title: "Inclusione sociale",
      href: "/le-nostre-attivita?categoria=Inclusione+sociale",
      animationClass: "animate-fade-in-left"
    }
  ];

  return (
    <div
      className={`flex flex-wrap justify-center relative w-full py-12 transition-all duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundColor: 'rgb(241, 235, 225)',
        minHeight: '400px'
      }}
    >
      {/* Background absolute div */}
      <div className="absolute inset-0 h-full w-full" style={{ zIndex: 0 }}></div>
      
      {activities.map((activity, index) => (
        <div
          key={index}
          className={`
            box-border relative text-center w-full sm:w-1/2 lg:w-1/3
            ${activity.animationClass}
          `}
          style={{
            animation: '1s ease 0s 1 normal both running',
            animationDuration: '1s',
            animationFillMode: 'both',
            backgroundRepeat: 'no-repeat',
            zIndex: 10,
            minHeight: '80px'
          }}
        >
          <div className="box-border mb-8 mx-3 relative text-center">
            <a
              href={activity.href}
              className="
                inline-block relative text-center w-full max-w-xs cursor-pointer
                text-white border-none text-base
                transition-all duration-200 hover:scale-105 transform
                shadow-lg hover:shadow-xl
              "
              style={{
                backgroundColor: 'rgb(255, 117, 14)',
                borderRadius: '28px',
                fontSize: '16.5px',
                padding: '12px 24px',
                verticalAlign: 'middle',
                transitionDuration: '0.2s',
                overflow: 'hidden',
                display: 'block',
                margin: '0 auto'
              }}
            >
              <span
                className="inline text-center text-white cursor-pointer font-medium"
                style={{
                  fontSize: '16.5px',
                  color: 'rgb(255, 255, 255)'
                }}
              >
                {activity.title}
              </span>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttivitaGrid;
