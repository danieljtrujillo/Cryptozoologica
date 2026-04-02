/**
 * Compact anti-tropes style sheet for all Gemini text generation.
 * Distilled from the Field Guide to AI Text Generation Tropes.
 * Injected into system instructions to keep generated text
 * sounding like a real person wrote it.
 */

const BANNED_WORDS = [
  'delve', 'tapestry', 'robust', 'leverage', 'harness', 'intricate',
  'utilize', 'streamline', 'underscore', 'multifaceted', 'pivotal',
  'paradigm', 'ecosystem', 'synergy', 'nexus', 'furthermore', 'moreover',
  'indeed', 'certainly', 'arguably', 'remarkably', 'fundamentally',
  'crucial', 'vital', 'testament', 'cornerstone', 'groundbreaking',
  'captivating', 'fascinating', 'majestic', 'vibrant', 'rich cultural heritage',
  'serves as', 'stands as', 'it is important to note',
].join(', ');

const STYLE_RULES_EN = `WRITING RULES (follow strictly):
- BANNED WORDS: Never use: ${BANNED_WORDS}. Use plain alternatives instead.
- NO REFRAMES: Never write "It's not X — it's Y" or "The question isn't X."
- NO SELF-ANSWERED QUESTIONS: Never write "The result? Devastating." or "The worst part? Nobody saw it coming."
- VARY LIST LENGTH: Don't default to groups of three. Use two items, four items, five.
- LIMIT EM DASHES: Maximum two per response. Use commas or parentheses instead.
- NO FAKE SUSPENSE: Never write "Here's the thing," "Here's what most people miss," or "Let's break this down."
- NO HEDGING: Drop "generally speaking," "typically," "tends to" unless citing actual statistics.
- NO FRACTAL SUMMARIES: Don't restate what you just said. No "In conclusion" or "To sum up."
- NO PROMOTIONAL TONE: Don't call things "groundbreaking" or "a testament to." Describe what happened and let the reader judge.
- NO VAGUE ATTRIBUTION: Never write "experts say" or "observers note." Name the source or drop it.
- SPECIFIC DETAILS: Use real place names, dates, measurements, coordinates. No permanent altitude of abstraction.
- VARY RHYTHM: Mix short sentences with long ones. A three-word sentence after a fifty-word one is good. Metronomic uniformity is bad.
- HAVE OPINIONS: If something is unexplained, say so. If a theory is weak, say why. Don't spin everything positive.`;

const STYLE_RULES_ES = `REGLAS DE ESCRITURA (seguir estrictamente):
- PALABRAS PROHIBIDAS: Nunca uses: profundizar, tapiz, robusto, aprovechar, intrínseco, utilizar, ecosistema, sinergia, paradigma, fundamental, crucial, vital, testimonio, fascinante, cautivador, vibrante, sirve como.
- SIN REFORMULACIONES: Nunca escribas "No es X — es Y."
- SIN PREGUNTAS AUTO-RESPONDIDAS: Nunca escribas "¿El resultado? Devastador."
- VARÍA LA LONGITUD DE LISTAS: No siempre tres elementos. Usa dos, cuatro, cinco.
- LIMITA RAYAS: Máximo dos por respuesta.
- SIN SUSPENSO FALSO: Nunca escribas "Aquí está la cosa" o "Vamos a desglosarlo."
- SIN AMBIGÜEDAD: Nada de "generalmente" o "tiende a" sin datos concretos.
- DETALLES ESPECÍFICOS: Nombres reales, fechas, medidas, coordenadas.
- VARÍA EL RITMO: Mezcla oraciones cortas con largas.
- TEN OPINIONES: Si algo no tiene explicación, dilo. No suavices todo.`;

/**
 * Wraps a persona-specific system instruction with the anti-tropes style rules.
 * Use this for all text-generating Gemini calls.
 */
export function withStyle(personaInstruction: string): string {
  return `${personaInstruction}\n\n${STYLE_RULES_EN}`;
}

/**
 * Spanish variant for CryptidLive ES mode.
 */
export function withStyleES(personaInstruction: string): string {
  return `${personaInstruction}\n\n${STYLE_RULES_ES}`;
}
