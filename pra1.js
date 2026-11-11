/**
 * =============================================================================
 * PROGRAMACIÓN WEB - PRÁCTICA 1
 * Seguimiento de series de TV con JavaScript (datos de TVmaze)
 * =============================================================================
 *
 * Este archivo debe implementar las 9 etapas de la práctica utilizando:
 *   - Clases con campos privados, getters y setters
 *   - Métodos de clase y funciones flecha
 *   - Recursividad, reduce, map, filter
 *   - Destructuring y spread operator
 *   - Manejo de fechas con el objeto Date
 *
 * Convenciones a seguir:
 *   - Se usa `const` para valores que no cambian y `let` para los que sí.
 *   - Las funciones anónimas se escriben como arrow functions.
 *   - Los nombres siguen camelCase (variables/funciones) y PascalCase (clases).
 *   - Todos los identificadores se escriben en inglés.
 *   - Las comparaciones son siempre estrictas (=== / !==).
 *   - Se usan métodos de Array en lugar de bucles for/while
 *     (excepto en la función recursiva de la etapa 5.1).
 *   - Los datos no válidos se gestionan siempre igual: aviso con console.warn,
 *     sin modificar ningún dato, y devolviendo false / null / [].
 *   - Los comentarios siguen las 9 reglas de Ellen Spertus:
 *     explicar el "por qué", no el "qué" evidente en el código.
 *
 * Las firmas de este archivo (nombres y parámetros) son las que pide el
 * enunciado: no las cambiéis. Podéis añadir las funciones auxiliares que
 * necesitéis.
 * =============================================================================
 */

/* =============================================================================
   ETAPA 1 — Clase Show (3 puntos)
   Representa una serie con sus datos de catálogo (los que vendrán de la API).
   ============================================================================= */

class Show {
  // La valoració queda privada per controlar els valors que s'hi assignen.
  #rating;

  constructor({
    id,
    name,
    summary,
    premiered,
    status,
    rating,
    type,
    genres,
    network,
    webChannel,
    imageUrl,
    weight,
    episodes,
  }) {
    // Comprovem que l'identificador sigui un enter positiu.
    if (!Number.isInteger(id) || id <= 0) {
      console.warn('Show: id ha de ser un nombre enter positiu.');
    }

    // El nom de la sèrie no pot ser buit.
    if (typeof name !== 'string' || name.trim() === '') {
      console.warn('Show: name ha de ser un text no buit.');
    }

    this.id = id;
    this.name = name;
    this.summary = summary;
    this.premiered = premiered;
    this.status = status;

    // Si la valoració no és vàlida, inicialitzem el camp a null.
    this.#rating = Number.isFinite(rating) && rating >= 0 && rating <= 10
      ? rating
      : null;

    this.type = type;

    // Els gèneres sempre han de ser un array.
    if (Array.isArray(genres)) {
      this.genres = genres;
    } else {
      console.warn('Show: genres ha de ser un array.');
      this.genres = [];
    }

    this.network = network;
    this.webChannel = webChannel;
    this.imageUrl = imageUrl;
    this.weight = weight;

    // Els episodis també han de ser un array.
    if (Array.isArray(episodes)) {
      this.episodes = episodes;
    } else {
      console.warn('Show: episodes ha de ser un array.');
      this.episodes = [];
    }
  }

  // Retorna la valoració actual de la sèrie.
  get rating() {
    return this.#rating;
  }

  // Només acceptem valoracions entre 0 i 10 o null.
  set rating(newRating) {
    if (
      newRating !== null &&
      (!Number.isFinite(newRating) || newRating < 0 || newRating > 10)
    ) {
      console.warn('Show: rating ha de ser null o un nombre entre 0 i 10.');
      return;
    }

    this.#rating = newRating;
  }

  // Retorna la cadena de televisió o la plataforma en línia.
  get platform() {
    if (this.network !== null && this.network !== undefined) {
      return this.network.name;
    }

    if (this.webChannel !== null && this.webChannel !== undefined) {
      return this.webChannel.name;
    }

    return null;
  }
}

/* =============================================================================
   ETAPA 2 — Clase Progress (2 puntos)
   Progreso de visionado de un usuario en una serie concreta.
   ============================================================================= */

class Progress {
  constructor(showId) {
    this.showId = showId;
    this.currentSeason = 0;
    this.currentEpisode = 0;
  }

  /**
   * Marca com a últim vist l'episodi indicat.
   * Retorna true si s'ha actualitzat el progrés.
   */
  advance(season, number) {
    // Només acceptem temporades i episodis amb nombres enters positius.
    if (
      !Number.isInteger(season) ||
      season <= 0 ||
      !Number.isInteger(number) ||
      number <= 0
    ) {
      console.warn('Progress: season i number han de ser nombres enters positius.');
      return false;
    }

    this.currentSeason = season;
    this.currentEpisode = number;

    return true;
  }

  /**
   * Torna el progrés a 0 / 0 (sense començar).
   */
  reset() {
    this.currentSeason = 0;
    this.currentEpisode = 0;
  }

  // Indica si l'usuari ha començat a veure la sèrie.
  get hasStarted() {
    return this.currentSeason > 0 && this.currentEpisode > 0;
  }
}


/* =============================================================================
   ETAPA 3 — Clase ShowList (3 puntos)
   Lista de series que sigue el usuario: array de pares { show, progress }.
   ============================================================================= */

class ShowList {
  // Guardem internament les sèries amb el seu progrés.
  #entries;

  constructor() {
    this.#entries = [];
  }

  // Retorna una còpia de l'array intern.
  get entries() {
    return [...this.#entries];
  }

  // Retorna un array nou que conté només les sèries.
  get shows() {
    return this.#entries.map(entry => entry.show);
  }

  /**
   * Afegeix una sèrie creant el seu Progress inicial.
   * Retorna true si s'ha afegit.
   */
  addShow(show) {
    // Comprovem que l'objecte sigui una instància de Show.
    if (!(show instanceof Show)) {
      console.warn('ShowList: show ha de ser una instància de Show.');
      return false;
    }

    // Evitem afegir una sèrie que ja estigui a la llista.
    const alreadyExists = this.#entries.some(
      entry => entry.show.id === show.id
    );

    if (alreadyExists) {
      console.warn('ShowList: aquesta sèrie ja existeix a la llista.');
      return false;
    }

    // Creem el progrés inicial associat a la sèrie.
    const progress = new Progress(show.id);

    this.#entries.push({ show, progress });

    return true;
  }

  /**
   * Elimina una sèrie i el seu progrés pel seu id.
   * Retorna true si s'ha eliminat.
   */
  removeShow(showId) {
    const showExists = this.#entries.some(
      entry => entry.show.id === showId
    );

    if (!showExists) {
      console.warn('ShowList: no s\'ha trobat la sèrie indicada.');
      return false;
    }

    this.#entries = this.#entries.filter(
      entry => entry.show.id !== showId
    );

    return true;
  }

  /**
   * Reinicia el progrés d'una sèrie.
   * Retorna true si s'ha reiniciat.
   */
  resetProgress(showId) {
    const entry = this.#entries.find(
      item => item.show.id === showId
    );

    if (!entry) {
      console.warn('ShowList: no s\'ha trobat la sèrie indicada.');
      return false;
    }

    entry.progress.reset();

    return true;
  }

  /**
   * Mostra per consola la informació de cada sèrie.
   */
  showList() {
    if (this.#entries.length === 0) {
      console.log('La llista de sèries està buida.');
      return;
    }

    this.#entries.forEach(({ show, progress }) => {
      const rating = show.rating === null
        ? 'Sense valoració'
        : show.rating;

      const currentProgress = progress.hasStarted
        ? `${progress.currentSeason}x${progress.currentEpisode}`
        : 'Sense començar';

      console.log(
        `${show.name} | ${show.type} | ${rating} | ${currentProgress}`
      );
    });
  }


  /* ===========================================================================
     ETAPA 4 — Funciones flecha dentro de ShowList (2 puntos)
     =========================================================================== */

  /**
   * Afegeix diverses sèries alhora.
   * Retorna el nombre de sèries que s'han afegit.
   */

  addMultipleShows = (...shows) => {
    let added = 0;

    shows.forEach(show => {
      if (this.addShow(show)) {
        added++;
      }
    });

    return added;
  };

  /**
   * Retorna les sèries amb una valoració dins del rang indicat.
   */
  getShowsByRatingRange = (minRating, maxRating) => {
    if (
      !Number.isFinite(minRating) ||
      !Number.isFinite(maxRating) ||
      minRating < 0 ||
      minRating > 10 ||
      maxRating < 0 ||
      maxRating > 10 ||
      minRating > maxRating
    ) {
      console.warn('ShowList: el rang de valoració no és vàlid.');
      return [];
    }

    return this.#entries.filter(({ show }) =>
      show.rating !== null &&
      show.rating >= minRating &&
      show.rating <= maxRating
    );
  };

  /**
   * Retorna les sèries ordenades per popularitat.
   */
  sortShowsByPopularity = () => {
    return [...this.#entries].sort(
      (a, b) => b.show.weight - a.show.weight
    );
  };

  /* ===========================================================================
     ETAPA 5.2 — markEpisodeWatched (forma parte de la etapa 5)
     =========================================================================== */

   /**
   * Avanza el progreso de una serie hasta su siguiente episodio.
   * Devuelve el episodio marcado como visto, o null.
   */
  markEpisodeWatched(showId) {
    const entry = this.#entries.find(item => item.show.id === showId);

    // Comprovem que la sèrie existeixi a la llista.
    if (!entry) {
      console.warn('ShowList: no s\'ha trobat la sèrie indicada.');
      return null;
    }

    const show = entry.show;
    const progress = entry.progress;
    let episode = null;

    // Si la sèrie encara no ha començat, busquem el primer episodi.
    if (!progress.hasStarted) {
      episode = findEpisodeByNumber(show.episodes, 1, 1);
    } else {
      // Primer busquem el següent episodi de la mateixa temporada.
      episode = findEpisodeByNumber(
        show.episodes,
        progress.currentSeason,
        progress.currentEpisode + 1
      );

      // Si no existeix, busquem el primer episodi de la temporada següent.
      if (episode === null) {
        episode = findEpisodeByNumber(
          show.episodes,
          progress.currentSeason + 1,
          1
        );
      }
    }

    // Si no trobem cap episodi, la sèrie ja està acabada.
    if (episode === null) {
      console.warn(`ShowList: la sèrie ${show.name} ja està acabada.`);
      return null;
    }

    // Actualitzem el progrés amb l'episodi trobat.
    progress.advance(episode.season, episode.number);

    return episode;
  }
}

/* =============================================================================
   ETAPA 5 — Función recursiva (4 puntos)
   ============================================================================= */

/**
 * 5.1 — Busca recursivamente un episodio por temporada y número.
 * Devuelve el episodio o null si no existe.
 */
const findEpisodeByNumber = (episodes, season, number, index = 0) => {
  // Comprovem que les dades d'entrada siguin vàlides.
  if (
    !Array.isArray(episodes) ||
    !Number.isInteger(season) || season <= 0 ||
    !Number.isInteger(number) || number <= 0
  ) {
    return null;
  }

  // Si hem arribat al final de l'array, no hem trobat l'episodi.
  if (index >= episodes.length) {
    return null;
  }

  const episode = episodes[index];

  // Comprovem si aquest és l'episodi que estem buscant.
  if (episode.season === season && episode.number === number) {
    return episode;
  }

  // Si no coincideix, continuem amb el següent element.
  return findEpisodeByNumber(episodes, season, number, index + 1);
};


/* =============================================================================
   ETAPA 6 — Uso de reduce (4 puntos)
   ============================================================================= */

/**
 * Retorna el gènere que apareix més vegades a les sèries.
 */

const getMostCommonGenre = (shows) => {
  // Comprovem que l'entrada sigui un array amb contingut.
  if (!Array.isArray(shows) || shows.length === 0) {
    return null;
  }

  // Comptem les aparicions de cada gènere.
  const genreCounts = shows.reduce((counts, show) => {
    if (Array.isArray(show.genres)) {
      show.genres.forEach(genre => {
        counts[genre] = (counts[genre] || 0) + 1;
      });
    }

    return counts;
  }, {});

  // Si no hem trobat cap gènere, retornem null.
  const genres = Object.entries(genreCounts);

  if (genres.length === 0) {
    return null;
  }

  // Ordenem per nombre d'aparicions i, en cas d'empat, alfabèticament.
  genres.sort((a, b) => {
    return b[1] - a[1] || a[0].localeCompare(b[0]);
  });

  return {
    genre: genres[0][0],
    count: genres[0][1]
  };
};


/* =============================================================================
   ETAPA 7 — Destructuring y spread (3 puntos)
   ============================================================================= */

/**
 * Muestra la información principal de una serie y devuelve una copia
 * con el campo following: true.
 */

const getShowInfo = (show) => {
  // Comprovem que sigui una instància de Show.
  if (!(show instanceof Show)) {
    console.warn('getShowInfo: cal proporcionar una sèrie vàlida.');
    return null;
  }

  // Extraiem les dades principals de la sèrie.
  const {
    name,
    type,
    rating,
    genres: [firstGenre = 'Sense gènere'] = [],
    network,
    webChannel
  } = show;

  // Extraiem el nom de la cadena i de la plataforma.
  const { name: networkName } = network ?? {};
  const { name: webChannelName } = webChannel ?? {};

  // Preparem els valors que mostrarem.
  const showRating = rating || 'Sense valorar';
  const platformName = networkName ?? webChannelName ?? 'Desconeguda';

  // Mostrem la informació de manera organitzada.
  console.log('--- Informació de la sèrie ---');
  console.log('Títol:', name);
  console.log('Tipus:', type);
  console.log('Valoració:', showRating);
  console.log('Gènere:', firstGenre);
  console.log('Plataforma:', platformName);

  // Creem una còpia de la sèrie i afegim el camp following.
  const newShow = {
    ...show,
    rating: show.rating,
    following: true
  };

  return newShow;
};


/* =============================================================================
   ETAPA 8 — Manejo de fechas (4 puntos)
   ============================================================================= */

/**
 * Retorna els dies naturals que falten fins a una data.
 */
const daysUntil = (isoDate, today = new Date()) => {
  // Comprovem que la data tingui el format correcte.
  if (typeof isoDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    console.warn('daysUntil: la data ha de tenir el format aaaa-mm-dd.');
    return null;
  }

  // Convertim la data ISO.
  const targetDate = new Date(`${isoDate}T00:00:00Z`);

  // Comprovem que sigui una data real.
  if (
    Number.isNaN(targetDate.getTime()) ||
    targetDate.toISOString().slice(0, 10) !== isoDate
  ) {
    console.warn('daysUntil: la data indicada no és vàlida.');
    return null;
  }

  // Comprovem que today sigui una data vàlida.
  if (!(today instanceof Date) || Number.isNaN(today.getTime())) {
    console.warn('daysUntil: la data de referència no és vàlida.');
    return null;
  }

  // Agafem només l'any, el mes i el dia de la data actual.
  const currentDate = new Date(Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ));

  // Calculem la diferència en dies naturals.
  const difference = targetDate.getTime() - currentDate.getTime();

  return difference / (1000 * 60 * 60 * 24);
};


/**
 * Retorna el següent episodi pendent de veure d'una sèrie.
 */
const getNextPendingEpisode = (show, progress) => {
  // Comprovem que les dades d'entrada siguin correctes.
  if (
    !(show instanceof Show) ||
    !(progress instanceof Progress) ||
    progress.showId !== show.id
  ) {
    console.warn('getNextPendingEpisode: cal proporcionar una sèrie i un progrés vàlids que corresponguin.');
    return null;
  }

  let episode = null;

  // Si encara no s'ha començat la sèrie, busquem el primer episodi.
  if (!progress.hasStarted) {
    episode = findEpisodeByNumber(show.episodes, 1, 1);
  } else {
    // Busquem el següent episodi de la temporada actual.
    episode = findEpisodeByNumber(
      show.episodes,
      progress.currentSeason,
      progress.currentEpisode + 1
    );

    // Si no existeix, busquem el primer episodi de la temporada següent.
    if (episode === null) {
      episode = findEpisodeByNumber(
        show.episodes,
        progress.currentSeason + 1,
        1
      );
    }
  }

  // Retornem l'episodi trobat o null si no en queden més.
  return episode;
};

/* =============================================================================
   ETAPA 9 — Función avanzada con múltiples operadores (5 puntos)
   ============================================================================= */

/**
 * Devuelve { platform, count, shows, averageRating } para una cadena
 * o plataforma concreta.
 */

const getShowsByPlatform = (shows, platformName) => {
  // Comprovem que les dades d'entrada siguin correctes.
  if (
    !Array.isArray(shows) ||
    typeof platformName !== 'string' ||
    platformName.trim() === ''
  ) {
    console.warn('getShowsByPlatform: cal proporcionar un array de sèries i un nom de plataforma vàlid.');
    return null;
  }

  // Eliminem possibles espais al principi i al final del nom.
  const platform = platformName.trim();

  // Seleccionem les sèries que pertanyen a aquesta plataforma.
  const platformShows = shows.filter(show => show.platform === platform);

  // Obtenim només els títols de les sèries trobades.
  const showTitles = platformShows.map(show => show.name);

  // Separem les sèries que tenen valoració.
  const ratedShows = platformShows.filter(show => show.rating !== null);

  // Calculem la mitjana si hi ha alguna valoració.
  let averageRating = null;

  if (ratedShows.length > 0) {
    const totalRating = ratedShows.reduce(
      (total, show) => total + show.rating,
      0
    );

    averageRating = totalRating / ratedShows.length;
  }

  return {
    platform,
    count: platformShows.length,
    shows: showTitles,
    averageRating
  };
};


/* =============================================================================
   DATOS DE PRUEBA
   Datos reales de la API de TVmaze (consultados en septiembre de 2026),
   simplificados para la práctica: cada serie incluye solo algunos episodios
   por temporada y el resumen está en castellano y en texto plano.
   Hay tres excepciones, pensadas para poder probar todos los casos:
     - weight: en la API vale 100 en todas estas series. Aquí usamos valores
       distintos para que ordenar por popularidad dé un resultado visible.
     - El episodio T3E1 de The Last of Us, anunciado pero sin fecha.
     - La serie "Proyecto Aurora", sin valoración, sin géneros, sin cadena
       ni plataforma y con estrenos futuros.
   ============================================================================= */

const breakingBad = new Show({
  id: 169,
  name: 'Breaking Bad',
  summary: 'Un profesor de química con cáncer terminal empieza a fabricar metanfetamina para asegurar el futuro de su familia.',
  premiered: '2008-01-20',
  status: 'Ended',
  rating: 9.2,
  type: 'Scripted',
  genres: ['Drama', 'Crime', 'Thriller'],
  network: { name: 'AMC', country: { name: 'United States', code: 'US', timezone: 'America/New_York' } },
  webChannel: null,
  imageUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/501/1253519.jpg',
  weight: 98,
  episodes: [
    { season: 1, number: 1, name: 'Pilot', airdate: '2008-01-20', summary: '', runtime: 60 },
    { season: 1, number: 2, name: "Cat's in the Bag...", airdate: '2008-01-27', summary: '', runtime: 60 },
    { season: 1, number: 3, name: "...and the Bag's in the River", airdate: '2008-02-10', summary: '', runtime: 60 },
    { season: 2, number: 1, name: 'Seven Thirty-Seven', airdate: '2009-03-08', summary: '', runtime: 60 },
    { season: 2, number: 2, name: 'Grilled', airdate: '2009-03-15', summary: '', runtime: 60 },
  ],
});

const gameOfThrones = new Show({
  id: 82,
  name: 'Game of Thrones',
  summary: 'Varias familias nobles luchan por el control del Trono de Hierro de los Siete Reinos.',
  premiered: '2011-04-17',
  status: 'Ended',
  rating: 8.9,
  type: 'Scripted',
  genres: ['Drama', 'Adventure', 'Fantasy'],
  network: { name: 'HBO', country: { name: 'United States', code: 'US', timezone: 'America/New_York' } },
  webChannel: null,
  imageUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/498/1245274.jpg',
  weight: 99,
  episodes: [
    { season: 1, number: 1, name: 'Winter is Coming', airdate: '2011-04-17', summary: '', runtime: 60 },
    { season: 1, number: 2, name: 'The Kingsroad', airdate: '2011-04-24', summary: '', runtime: 60 },
    { season: 2, number: 1, name: 'The North Remembers', airdate: '2012-04-01', summary: '', runtime: 60 },
  ],
});

const strangerThings = new Show({
  id: 2993,
  name: 'Stranger Things',
  summary: 'Tras la desaparición de un niño, un pueblo descubre experimentos secretos y fuerzas sobrenaturales.',
  premiered: '2016-07-15',
  status: 'Ended',
  rating: 8.4,
  type: 'Scripted',
  genres: ['Drama', 'Horror', 'Science-Fiction'],
  network: null,
  webChannel: { name: 'Netflix', country: null },
  imageUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/595/1489169.jpg',
  weight: 99,
  episodes: [
    { season: 1, number: 1, name: 'Chapter One: The Vanishing of Will Byers', airdate: '2016-07-15', summary: '', runtime: 49 },
    { season: 1, number: 2, name: 'Chapter Two: The Weirdo on Maple Street', airdate: '2016-07-15', summary: '', runtime: 56 },
    { season: 2, number: 1, name: 'Chapter One: MADMAX', airdate: '2017-10-27', summary: '', runtime: 48 },
  ],
});

const theLastOfUs = new Show({
  id: 46562,
  name: 'The Last of Us',
  summary: 'Veinte años después de una pandemia, un superviviente escolta a una adolescente a través de un país devastado.',
  premiered: '2023-01-15',
  status: 'Running',
  rating: 7.9,
  type: 'Scripted',
  genres: ['Drama', 'Action', 'Horror'],
  network: { name: 'HBO', country: { name: 'United States', code: 'US', timezone: 'America/New_York' } },
  webChannel: null,
  imageUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/563/1409008.jpg',
  weight: 97,
  episodes: [
    { season: 1, number: 1, name: 'When You\'re Lost in the Darkness', airdate: '2023-01-15', summary: '', runtime: 85 },
    { season: 1, number: 2, name: 'Infected', airdate: '2023-01-22', summary: '', runtime: 56 },
    { season: 2, number: 1, name: 'Future Days', airdate: '2025-04-13', summary: '', runtime: 62 },
    // Ficticio: episodio anunciado pero sin fecha de emisión conocida.
    // (En la API, un episodio sin fecha llega con airdate ""; aquí usamos null.)
    { season: 3, number: 1, name: 'TBA', airdate: null, summary: '', runtime: null },
  ],
});

const severance = new Show({
  id: 44933,
  name: 'Severance',
  summary: 'Los empleados de una empresa se someten a un procedimiento que separa sus recuerdos del trabajo y de su vida personal.',
  premiered: '2022-02-18',
  status: 'Running',
  rating: 7.7,
  type: 'Scripted',
  genres: ['Drama', 'Science-Fiction', 'Mystery'],
  network: null,
  webChannel: { name: 'Apple TV', country: null },
  imageUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/548/1371406.jpg',
  weight: 96,
  episodes: [
    { season: 1, number: 1, name: 'Good News About Hell', airdate: '2022-02-18', summary: '', runtime: 57 },
    { season: 1, number: 2, name: 'Half Loop', airdate: '2022-02-18', summary: '', runtime: 53 },
    { season: 2, number: 1, name: 'Hello, Ms. Cobel', airdate: '2025-01-17', summary: '', runtime: 48 },
  ],
});

// Serie ficticia pensada para los casos límite: sin valoración, sin géneros,
// sin cadena ni plataforma y con episodios que se emitirán en el futuro.
const proyectoAurora = new Show({
  id: 90001,
  name: 'Proyecto Aurora',
  summary: 'Serie ficticia para las pruebas de la práctica.',
  premiered: '2026-11-20',
  status: 'To Be Determined',
  rating: null,
  type: 'Documentary',
  genres: [],
  network: null,
  webChannel: null,
  imageUrl: '',
  weight: 40,
  episodes: [
    { season: 1, number: 1, name: 'Episodio 1', airdate: '2026-11-20', summary: '', runtime: 45 },
    { season: 1, number: 2, name: 'Episodio 2', airdate: '2026-11-27', summary: '', runtime: 45 },
  ],
});

// Fecha fija para que los resultados de las pruebas de fechas no dependan del
// día en que se ejecuten: 13 de noviembre de 2026 en hora local.
const TODAY = new Date(2026, 10, 13);


/* =============================================================================
   PRUEBAS
   Añadid aquí las llamadas necesarias para probar todas las etapas y ver los
   resultados por consola. Incluid también pruebas con datos no válidos y con
   los casos límite que indica el enunciado.
   ============================================================================= */

// PROVA - ETAPA 1 

console.log('--- ETAPA 1: proves de Show ---');

// Comprovem una sèrie amb cadena de televisió.
console.log('Breaking Bad:', breakingBad.name);
console.log('Rating:', breakingBad.rating);
console.log('Platform:', breakingBad.platform);

// Comprovem una sèrie amb plataforma en línia.
console.log('Stranger Things:', strangerThings.name);
console.log('Platform:', strangerThings.platform);

// Comprovem una sèrie sense plataforma.
console.log('Proyecto Aurora:', proyectoAurora.platform);

// Comprovem que el setter rebutja una valoració incorrecta.
const previousRating = breakingBad.rating;

breakingBad.rating = 12;

console.log('Rating conservat:', breakingBad.rating === previousRating);

// Comprovem que també podem assignar null.
breakingBad.rating = null;
console.log('Rating després d assignar null:', breakingBad.rating);

breakingBad.rating = previousRating;

// Provem dades incorrectes al constructor.
const invalidShow = new Show({
  id: 0,
  name: '   ',
  summary: '',
  premiered: null,
  status: 'To Be Determined',
  rating: 11,
  type: 'Scripted',
  genres: null,
  network: null,
  webChannel: null,
  imageUrl: '',
  weight: 0,
  episodes: null,
});

console.log('Sèrie amb dades incorrectes:', invalidShow);
// Comprovem que el setter accepta una valoració correcta.
breakingBad.rating = 8.5;

console.log('Rating actualitzat:', breakingBad.rating);

// Comprovem que una valoració incorrecta al constructor queda a null.
console.log('Rating de la sèrie incorrecta:', invalidShow.rating);


// PROVA - ETAPA 2
console.log('--- ETAPA 2: proves de Progress ---');

// Creem el progrés d'una sèrie.
const breakingBadProgress = new Progress(breakingBad.id);

console.log('Identificador de la sèrie:', breakingBadProgress.showId);
console.log('Temporada inicial:', breakingBadProgress.currentSeason);
console.log('Episodi inicial:', breakingBadProgress.currentEpisode);
console.log('Ha començat?', breakingBadProgress.hasStarted);

// Actualitzem el progrés a l'episodi 3 de la temporada 1.
console.log('Actualització correcta:', breakingBadProgress.advance(1, 3));
console.log('Temporada actual:', breakingBadProgress.currentSeason);
console.log('Episodi actual:', breakingBadProgress.currentEpisode);
console.log('Ha començat?', breakingBadProgress.hasStarted);

// Provem dades incorrectes.
console.log('Actualització amb temporada 0:', breakingBadProgress.advance(0, 5));
console.log('Progrés conservat:', breakingBadProgress.currentSeason === 1 &&
  breakingBadProgress.currentEpisode === 3);

// Reiniciem el progrés.
breakingBadProgress.reset();

console.log('Temporada després del reinici:', breakingBadProgress.currentSeason);
console.log('Episodi després del reinici:', breakingBadProgress.currentEpisode);
console.log('Ha començat després del reinici?', breakingBadProgress.hasStarted);
// Comprovem que un número d'episodi negatiu és rebutjat.
console.log('Episodi incorrecte:', breakingBadProgress.advance(2, -1));

// Comprovem que no s'accepten nombres decimals.
console.log('Temporada decimal:', breakingBadProgress.advance(1.5, 3));

// PROVA - ETAPA 3

console.log('--- ETAPA 3: proves de ShowList ---');

// Creem una llista de sèries.
const myShowList = new ShowList();

// Afegim dues sèries.
console.log('Afegir Breaking Bad:', myShowList.addShow(breakingBad));
console.log('Afegir Stranger Things:', myShowList.addShow(strangerThings));

// Comprovem el contingut de la llista.
console.log('Nombre de sèries:', myShowList.shows.length);
console.log('Sèries:', myShowList.shows.map(show => show.name));

// Comprovem que no es poden afegir duplicats.
console.log('Afegir Breaking Bad de nou:', myShowList.addShow(breakingBad));

// Comprovem que no es poden afegir objectes que no siguin Show.
console.log('Afegir un objecte incorrecte:', myShowList.addShow({ name: 'Sèrie incorrecta' }));

// Comprovem el progrés de Breaking Bad.
const breakingBadEntry = myShowList.entries.find(
  entry => entry.show.id === breakingBad.id
);

breakingBadEntry.progress.advance(1, 4);

console.log('Progrés abans de reiniciar:', 
  breakingBadEntry.progress.currentSeason,
  breakingBadEntry.progress.currentEpisode
);

// Reiniciem el progrés.
console.log('Reiniciar progrés:', myShowList.resetProgress(breakingBad.id));
console.log('Progrés després de reiniciar:',
  breakingBadEntry.progress.currentSeason,
  breakingBadEntry.progress.currentEpisode
);

// Intentem reiniciar una sèrie que no existeix.
console.log('Reiniciar sèrie inexistent:', myShowList.resetProgress(999999));

// Mostrem la llista per consola.
console.log('Contingut de la llista:');
myShowList.showList();

// Eliminem una sèrie.
console.log('Eliminar Stranger Things:', myShowList.removeShow(strangerThings.id));
console.log('Nombre de sèries després d eliminar:', myShowList.shows.length);

// Intentem eliminar una sèrie inexistent.
console.log('Eliminar sèrie inexistent:', myShowList.removeShow(999999));

// Comprovem el contingut final.
console.log('Llista final:', myShowList.shows.map(show => show.name));

// Comprovem que entries retorna una còpia de l'array.
const entriesCopy = myShowList.entries;
entriesCopy.pop();

console.log(
  'La llista interna conserva les sèries:',
  myShowList.entries.length === 1
);

// Comprovem que shows retorna un array nou.
const showsCopy = myShowList.shows;
showsCopy.pop();

console.log(
  'La llista interna conserva els objectes Show:',
  myShowList.shows.length === 1
);

// PROVA - ETAPA 4

console.log('--- ETAPA 4: proves de funcions fletxa ---');

// Creem una llista per provar l'addició múltiple.
const multipleShowList = new ShowList();

// Afegim diverses sèries, incloent-hi una de duplicada.
console.log(
  'Sèries afegides:',
  multipleShowList.addMultipleShows(
    breakingBad,
    strangerThings,
    breakingBad,
    proyectoAurora
  )
);

// Comprovem el nombre de sèries afegides.
console.log('Total de sèries:', multipleShowList.shows.length);

// Cerquem sèries amb valoracions entre 8 i 10.
const highlyRatedShows = multipleShowList.getShowsByRatingRange(8, 10);

console.log(
  'Sèries amb valoració entre 8 i 10:',
  highlyRatedShows.map(entry => entry.show.name)
);

// Provem un rang de valoració incorrecte.
console.log(
  'Rang incorrecte:',
  multipleShowList.getShowsByRatingRange(11, 5)
);

// Ordenem les sèries per popularitat.
const popularShows = multipleShowList.sortShowsByPopularity();

console.log(
  'Sèries ordenades per popularitat:',
  popularShows.map(entry => ({
    name: entry.show.name,
    weight: entry.show.weight
  }))
);

// Comprovem que l'ordenació no modifica la llista original.
console.log(
  'Llista original conservada:',
  multipleShowList.shows.length === 3
);

// PROVA - ETAPA 5.1

// Buscar un episodi existent.
console.log(findEpisodeByNumber(breakingBad.episodes, 1, 1));

// Buscar un episodi inexistent.
console.log(findEpisodeByNumber(breakingBad.episodes, 99, 99));

// Array incorrecte.
console.log(findEpisodeByNumber(null, 1, 1));

// Temporada no vàlida.
console.log(findEpisodeByNumber(breakingBad.episodes, 0, 1));

// Número d'episodi no vàlid.
console.log(findEpisodeByNumber(breakingBad.episodes, 1, -1));

// PROVA - ETAPA 5.2
 
console.log('--- ETAPA 5.2: proves de markEpisodeWatched ---');

// Crear una llista de proves.
const watchedList = new ShowList();
watchedList.addShow(breakingBad);
watchedList.addShow(strangerThings);

// Marcar el primer episodi de Breaking Bad.
console.log('Primer episodi:', watchedList.markEpisodeWatched(breakingBad.id));
console.log('Progrés:', watchedList.entries[0].progress);

// Marcar el següent episodi.
console.log('Segon episodi:', watchedList.markEpisodeWatched(breakingBad.id));
console.log('Progrés:', watchedList.entries[0].progress);

// Provar una sèrie inexistent.
console.log('Sèrie inexistent:', watchedList.markEpisodeWatched(999999));

// PROVA - ETAPA 6

console.log('--- ETAPA 6: getMostCommonGenre ---');

// Prova amb les sèries del projecte.
console.log(
  'Gènere més freqüent:',
  getMostCommonGenre([breakingBad, strangerThings])
);

// Array buit.
console.log('Array buit:', getMostCommonGenre([]));

// Valor que no és un array.
console.log('Valor incorrecte:', getMostCommonGenre(null));

// Sèrie sense gèneres.
const showWithoutGenres = new Show({
  id: 301,
  name: 'Sèrie sense gèneres',
  genres: [],
  episodes: []
});

console.log(
  'Sense gèneres:',
  getMostCommonGenre([showWithoutGenres])
);

// Comprovem què passa quan hi ha un empat.
const tieShows = [
  new Show({
    id: 302,
    name: 'Sèrie A',
    genres: ['Drama', 'Comedy'],
    episodes: []
  }),
  new Show({
    id: 303,
    name: 'Sèrie B',
    genres: ['Comedy', 'Drama'],
    episodes: []
  }),
  new Show({
    id: 304,
    name: 'Sèrie C',
    genres: ['Action'],
    episodes: []
  })
];

console.log(
  'Empat de gèneres:',
  getMostCommonGenre(tieShows)
);

// PROVA - ETAPA 7

console.log('--- ETAPA 7: proves de getShowInfo ---');

// Mostrar informació de Breaking Bad.
const followedShow = getShowInfo(breakingBad);

// Comprovar les dades de l'objecte retornat.
console.log('Valoració de la còpia:', followedShow.rating);
console.log('Following:', followedShow.following);

// Comprovar que l'objecte original no s'ha modificat.
console.log('Original sense modificar:', breakingBad.following === undefined);

// Provar una sèrie sense plataforma.
console.log('Sèrie sense plataforma:');
const followedAurora = getShowInfo(proyectoAurora);

// Comprovar una entrada incorrecta.
console.log('Objecte incorrecte:', getShowInfo({ name: 'Sèrie incorrecta' }));

// PROVA - ETAPA 8

console.log('--- ETAPA 8: proves de les funcions de dates i episodis ---');

// -----------------------------------------------------------------------------
// PROVES DE daysUntil()
// -----------------------------------------------------------------------------

console.log('--- Proves de daysUntil ---');

// 1. Data futura: han de faltar 7 dies.
console.log(
  'Data futura (esperat: 7):',
  daysUntil('2026-11-20', TODAY)
);

// 2. Data d'avui: han de faltar 0 dies.
console.log(
  'Data d avui (esperat: 0):',
  daysUntil('2026-11-13', TODAY)
);

// 3. Data passada: han de sortir -3 dies.
console.log(
  'Data passada (esperat: -3):',
  daysUntil('2026-11-10', TODAY)
);

// 4. Canvi d'any: han de faltar 2 dies.
console.log(
  'Canvi d any (esperat: 2):',
  daysUntil('2027-01-01', new Date(2026, 11, 30))
);

// 5. Any de traspàs: el 29 de febrer ha de ser vàlid.
console.log(
  'Any de traspàs (esperat: 1):',
  daysUntil('2024-02-29', new Date(2024, 1, 28))
);

// 6. Format incorrecte: ha de retornar null.
console.log(
  'Format incorrecte (esperat: null):',
  daysUntil('20-11-2026', TODAY)
);

// 7. Mes impossible: ha de retornar null.
console.log(
  'Mes impossible (esperat: null):',
  daysUntil('2026-13-45', TODAY)
);

// 8. Dia impossible: ha de retornar null.
console.log(
  'Dia impossible (esperat: null):',
  daysUntil('2026-02-30', TODAY)
);

// 9. Text buit: ha de retornar null.
console.log(
  'Text buit (esperat: null):',
  daysUntil('', TODAY)
);

// 10. Data de referència incorrecta: ha de retornar null.
console.log(
  'Data de referència incorrecta (esperat: null):',
  daysUntil('2026-11-20', '2026-11-13')
);


// -----------------------------------------------------------------------------
// PROVES DE getNextPendingEpisode()
// -----------------------------------------------------------------------------

console.log('--- Proves de getNextPendingEpisode ---');

// 1. Sèrie sense començar: ha de retornar el primer episodi.
const pendingProgress = new Progress(breakingBad.id);

console.log(
  'Primer episodi (esperat: Pilot):',
  getNextPendingEpisode(breakingBad, pendingProgress)
);

// 2. Després de veure el primer episodi, ha de retornar el segon.
pendingProgress.advance(1, 1);

console.log(
  'Segon episodi (esperat: Cat\'s in the Bag...):',
  getNextPendingEpisode(breakingBad, pendingProgress)
);

// 3. Final de temporada: ha de retornar el primer episodi de la següent.
pendingProgress.advance(1, 3);

console.log(
  'Primer episodi de la temporada 2 (esperat: Seven Thirty-Seven):',
  getNextPendingEpisode(breakingBad, pendingProgress)
);

// 4. Progrés a la temporada 2: ha de retornar el segon episodi.
pendingProgress.advance(2, 1);

console.log(
  'Segon episodi de la temporada 2 (esperat: Grilled):',
  getNextPendingEpisode(breakingBad, pendingProgress)
);

// 5. Sèrie acabada: ha de retornar null.
pendingProgress.advance(2, 2);

console.log(
  'Sèrie acabada (esperat: null):',
  getNextPendingEpisode(breakingBad, pendingProgress)
);

// 6. Objecte Show incorrecte: ha de retornar null.
console.log(
  'Sèrie incorrecta (esperat: null):',
  getNextPendingEpisode({ id: 169 }, pendingProgress)
);

// 7. Objecte Progress incorrecte: ha de retornar null.
console.log(
  'Progrés incorrecte (esperat: null):',
  getNextPendingEpisode(breakingBad, {})
);

// 8. Progrés que no correspon a la sèrie: ha de retornar null.
const otherProgress = new Progress(strangerThings.id);

console.log(
  'Progrés d una altra sèrie (esperat: null):',
  getNextPendingEpisode(breakingBad, otherProgress)
);

// 9. Comprovem que la funció no modifica el progrés.
console.log(
  'Progrés conservat (esperat: temporada 2, episodi 2):',
  pendingProgress.currentSeason,
  pendingProgress.currentEpisode
);


// PROVA - ETAPA 9

console.log('--- ETAPA 9: getShowsByPlatform ---');

// Agrupem les sis sèries de prova.
const allShows = [
  breakingBad,
  gameOfThrones,
  strangerThings,
  theLastOfUs,
  severance,
  proyectoAurora
];

// 1. Cercar sèries d'HBO.
console.log('Sèries d HBO:', getShowsByPlatform(allShows, 'HBO'));

// 2. Cercar sèries de Netflix.
console.log('Sèries de Netflix:', getShowsByPlatform(allShows, 'Netflix'));

// 3. Plataforma que no existeix.
console.log('Plataforma inexistent:', getShowsByPlatform(allShows, 'Disney+'));

// 4. Array incorrecte.
console.log('Array incorrecte:', getShowsByPlatform(null, 'HBO'));

// 5. Nom de plataforma buit.
console.log('Nom buit:', getShowsByPlatform(allShows, '   '));