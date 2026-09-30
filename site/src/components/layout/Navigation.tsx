import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { navItems } from '../../data/navigation';
import { getUrl } from '../../utils/url';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsOpen(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b-2 border-graphite transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      style={{ backgroundColor: 'var(--md-sunbeam-dark)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
    >
      <div className="md-container">
        <div
          className="flex justify-between items-center"
          style={{ height: 'var(--header-desktop)', minHeight: 'var(--header-desktop)' }}
        >
          <h2><a
            href={getUrl('')}
            className="text-h1 font-bold uppercase tracking-[0.08em] transition-all duration-200 inline-block hover:shadow-[-6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:-translate-y-0.5 px-3 py-2"
            style={{ color: 'var(--md-graphite)', border: '2px solid var(--md-graphite)' }}
          >
            陈天 AI 训练营
          </a></h2>

          <nav className=" flex items-center gap-2 text-xl font-bold uppercase tracking-[0.08em]">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative transition-transform duration-150 group hover:-translate-y-1 px-3"
                style={{ color: 'var(--md-graphite)' }}
              >
                {item.label}
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 transition-all duration-200 group-hover:w-full" style={{ backgroundColor: 'var(--md-graphite)' }} />
              </a>
            ))}
          </nav>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 border-2 transition-transform duration-150 md:hidden rounded-micro hover:-translate-y-1"
            style={{ borderColor: 'var(--md-graphite)', color: 'var(--md-graphite)' }}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden fixed inset-x-0 border-t-2 border-graphite transition-all duration-300 ${isOpen ? 'opacity-100 top-[var(--header-desktop)]' : 'top-0 opacity-0 pointer-events-none'
          }`}
        style={{ backgroundColor: 'var(--md-sunbeam)' }}
      >
        <div className="flex flex-col md-container gap-8 py-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-body font-bold uppercase tracking-[0.08em] border-b-2 border-transparent pb-3 px-2 transition-all duration-150"
              style={{ color: 'var(--md-graphite)' }}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
