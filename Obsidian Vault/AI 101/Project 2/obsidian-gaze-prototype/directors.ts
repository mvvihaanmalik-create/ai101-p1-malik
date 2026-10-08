export const DIRECTORS = [
  {
    id: 'wes-anderson',
    name: 'Wes Anderson',
    tagline: 'Pastel symmetry. Cream-lifted shadows. Perfectly centred.',
    accent: '#f4c9c4',
  },
  {
    id: 'wong-kar-wai',
    name: 'Wong Kar-wai',
    tagline: 'Neon saturated. Teal shadows. Magenta midtones.',
    accent: '#e0218a',
  },
  {
    id: 'greta-gerwig',
    name: 'Greta Gerwig',
    tagline: 'Lifted blacks. Lavender shadows. Barbie-mode highlights.',
    accent: '#f78fc0',
  },
  {
    id: 'david-lynch',
    name: 'David Lynch',
    tagline: 'Crushed blacks. Desaturated midtones. Deep vignette.',
    accent: '#c81e3a',
  },
] as const;

export type DirectorId = (typeof DIRECTORS)[number]['id'];
