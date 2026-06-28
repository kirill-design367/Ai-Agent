import React from 'react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative py-10" style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--gold)' }}>
              <span className="font-syne font-bold text-xs text-bg-primary">A</span>
            </div>
            <span className="font-syne font-bold text-text-primary text-sm tracking-widest">AUREA</span>
          </div>

          <p className="font-inter text-text-muted text-xs text-center">
            © {year} AUREA. Сайты, которые работают.
          </p>

          <div className="flex items-center gap-5">
            <a href="https://t.me/Sk_Mac1" target="_blank" rel="noopener noreferrer"
              className="font-inter text-text-muted text-xs hover:text-gold transition-colors duration-200">
              Telegram
            </a>
            <a href="https://wa.me/79185367424" target="_blank" rel="noopener noreferrer"
              className="font-inter text-text-muted text-xs hover:text-gold transition-colors duration-200">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
