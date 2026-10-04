import { Lato, Manrope, Montserrat } from 'next/font/google';

/**
 * Sistema tipográfico do Entre Paisagens.
 *
 *  - Montserrat (títulos, nomes de lugares, títulos de legenda)
 *  - Lato       (legendas e textos auxiliares — fonte base)
 *  - Manrope    (alternativa minimalista / informações secundárias)
 */
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
  display: 'swap',
});

export const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-manrope',
  display: 'swap',
});
