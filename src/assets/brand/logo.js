export const logo = [
  '280 50',
  `
  <defs>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#E8A0B0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#D4789C;stop-opacity:1" />
    </linearGradient>
  </defs>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
    .logo-text {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      font-weight: 700;
      fill: url(#textGrad);
    }
  </style>
  <text x="10" y="35" class="logo-text">sayakahwin</text>
  <g transform="translate(230, 8)">
    <!-- Sparkle icon -->
    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" fill="#E8A0B0" opacity="0.9"/>
    <path d="M20 4L21 8L25 9L21 10L20 14L19 10L15 9L19 8L20 4Z" fill="#D4789C" opacity="0.7"/>
  </g>
  `,
]

export const logoNarrow = [
  '50 50',
  `
  <defs>
    <linearGradient id="narrowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#E8A0B0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#D4789C;stop-opacity:1" />
    </linearGradient>
  </defs>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
  </style>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
        font-family="'Playfair Display', Georgia, serif" 
        font-size="36" font-weight="700" fill="url(#narrowGrad)">S</text>
  `,
]
