/*
 * КОНТЕНТ САЙТА ОРКЕСТРА 1703
 * ---------------------------------------------------------------
 * Всё, что меняется (концерты, новости, контакты, фото), лежит здесь.
 * Этот файл можно править прямо на GitHub — пересобирать сайт не нужно.
 *
 * Правила:
 *  - даты пишем как 'ГГГГ-ММ-ДД' (например, '2026-12-20'), время — '20:00';
 *  - прошедшие даты сами пропадают с сайта — удалять их не обязательно;
 *  - чтобы добавить дату к программе, допишите строку в её sessions;
 *  - пустая строка '' или пустой список [] = блок на сайте скрыт;
 *  - картинки кладём в папку images/ и пишем путь от корня сайта.
 */
window.SITE = {
  contacts: {
    email: 'orchestra1703@gmail.com',
    // Телефон: впишите номер, и он появится на сайте. Пусто = не показывается
    phone: '',
    // Соцсети: пока url пустой, кнопка не показывается
    socials: [
      { label: 'Telegram', url: 'https://t.me/orchestra_1703' },
      { label: 'ВКонтакте', url: 'https://vk.ru/orchestra_1703' },
      { label: 'YouTube', url: 'https://youtube.com/@orchestra_1703' },
    ],
  },

  // Куда ведёт «Билеты», если у программы нет своей ссылки (ticketUrl).
  // Сейчас — taplink оркестра. Пусто = кнопка ведёт на страницу контактов.
  defaultTicketUrl: 'https://taplink.cc/orchestra_1703',

  /*
   * АФИША. Одна запись = одна программа, внутри — все её даты (sessions).
   * У даты можно указать свою площадку или ссылку: { date, time, venue, ticketUrl }.
   * featured: true — программа выводится большим блоком на главной.
   */
  concerts: [
    {
      id: 'cinema-music',
      title: 'Музыка из кино на органе',
      tag: 'Хит',
      venue: 'Анненкирхе',
      address: 'Кирочная ул., 8В',
      ticketUrl: 'https://zernoart.ru/cinemamusic',
      featured: true,
      image: '',
      description:
        'Саундтреки из «Гарри Поттера», «Титаника», «Властелина колец», «Ходячего замка», «Пиратов Карибского моря» и «Амели» — с медиапроекциями, ведущим и участием зала. Играет ансамбль солистов Оркестра 1703.',
      details: '1 час 15 минут без антракта · 6+',
      sessions: [
        { date: '2026-11-05', time: '20:00' },
        { date: '2026-11-12', time: '20:00' },
        { date: '2026-11-19', time: '20:00' },
        { date: '2026-11-21', time: '22:30' },
        { date: '2026-12-10', time: '20:00' },
        { date: '2026-12-11', time: '22:30' },
        { date: '2026-12-12', time: '22:30' },
        { date: '2026-12-17', time: '20:00' },
        { date: '2026-12-19', time: '22:30' },
      ],
    },
    {
      id: 'moonlight',
      title: 'Лунный свет',
      tag: 'Импрессионисты',
      venue: 'Анненкирхе',
      address: 'Кирочная ул., 8В',
      ticketUrl: 'https://zernoart.ru/moonlight',
      image: '',
      description:
        'Дебюсси, Равель и Сати — музыка французских импрессионистов. Обгоревшие стены Анненкирхе становятся холстом для проекций по картинам Моне, Писсарро, Дега и Ван Гога. Композитор и художественный руководитель — Георгий Фёдоров.',
      details: '1 час 15 минут без антракта · 6+',
      sessions: [{ date: '2026-11-14', time: '20:00' }],
    },
    {
      id: 'voice-of-disney',
      title: 'Голос Диснея',
      tag: 'Мультфильмы',
      venue: 'Анненкирхе',
      address: 'Кирочная ул., 8В',
      ticketUrl: 'https://zernoart.ru/voiceofdisney',
      image: '',
      description:
        'Песни из «Русалочки», «Аладдина», «Красавицы и Чудовища» и «Короля Льва» в исполнении вокалистов и ансамбля солистов Оркестра 1703. На стенах Анненкирхе оживают герои мультфильмов, ведущий — Георгий Фёдоров.',
      details: '1 час 15 минут без антракта · 6+',
      sessions: [{ date: '2026-11-21', time: '19:30' }],
    },
    {
      id: 'snow-queen',
      title: 'Снежная королева',
      tag: 'Сказки с оркестром',
      subtitle: 'Абонемент «Сказки с оркестром»',
      venue: 'Капелла',
      ticketUrl: '',
      image: 'images/gallery/snow-queen.jpg',
      description: 'Сказка Андерсена в музыке, слове и образах: путь от уютного дома до ледяного дворца.',
      sessions: [{ date: '2026-12-20', time: '15:00' }],
    },
    {
      id: 'alice-wonderland',
      title: 'Алиса в Стране чудес',
      tag: 'Сказки с оркестром',
      venue: 'Капелла',
      ticketUrl: '',
      image: 'images/gallery/alice.jpg',
      description: '',
      sessions: [{ date: '2027-01-17', time: '15:00' }],
    },
    {
      id: 'pippi',
      title: 'Пеппи Длинныйчулок',
      tag: 'Сказки с оркестром',
      subtitle: 'Абонемент «Сказки с оркестром»',
      venue: 'Капелла',
      ticketUrl: '',
      image: '',
      description: '',
      sessions: [{ date: '2027-02-14', time: '15:00' }],
    },
    {
      id: 'alice-looking-glass',
      title: 'Алиса в Зазеркалье',
      tag: 'Сказки с оркестром',
      venue: 'Капелла',
      ticketUrl: '',
      image: '',
      description: '',
      sessions: [{ date: '2027-03-14', time: '15:00' }],
    },
    {
      id: 'peter-pan',
      title: 'Питер Пэн',
      tag: 'Сказки с оркестром',
      subtitle: 'Абонемент «Сказки с оркестром»',
      venue: 'Капелла',
      ticketUrl: '',
      image: '',
      description: '',
      sessions: [{ date: '2027-04-11', time: '15:00' }],
    },
  ],

  news: {
    tag: 'Итоги сезона',
    title: 'Итоги сезона 2025/2026',
    text: 'Как прошёл концертный год у Оркестра 1703? Всего мы исполнили 192 концерта в сезоне 2025/2026 — и вступаем в новый!',
    slides: [
      { image: 'images/news/news-1.jpg', alt: 'Итоги сезона 2025/2026: как прошёл концертный год у Оркестра 1703' },
      { image: 'images/news/news-2.jpg', alt: '«Снежная королева» — 5 концертов' },
      { image: 'images/news/news-3.jpg', alt: 'Всего мы исполнили 192 концерта в сезоне 2025/2026. Вступаем в новый!' },
    ],
  },

  video: {
    title: 'Оркестр 1703 в Капелле',
    src: 'assets/media/concert.mp4',
    poster: 'assets/media/concert-poster.jpg',
  },

  // Пресса. interview: true — эта ссылка стоит на кнопке «Читать интервью» на странице «Об оркестре»
  press: [
    {
      outlet: 'Фонтанка',
      title: 'Чайковский, Штраус и немного счастья: Оркестр 1703 даст новогодний концерт в Александринском театре',
      url: 'https://www.fontanka.ru/2025/12/25/76189994/',
    },
    {
      outlet: 'Сноб',
      title: '«Петербург — это город не для людей, он существует сам для себя». Интервью композитора Георгия Фёдорова',
      url: 'https://snob.ru/music/peterburg-eto-gorod-ne-dlia-liudei-on-sushchestvuet-sam-dlia-sebia-interviu-kompozitora-georgiia-fedorova/',
      interview: true,
    },
    {
      outlet: 'Люди в культуре',
      title: 'От Шостаковича до Мэйби Бэйби — модный культурный феномен',
      url: 'https://www.xn--b1adeklce4bric0ita.xn--p1ai/ot-shostakovicha-do-mejbi-bejbi-modnyj-kulturnyj-fenomen/',
    },
    {
      outlet: 'Около',
      title: 'Музыка против скроллинга: «Генезис» на Новой сцене Александринского театра',
      url: 'https://okolo.me/2025/08/muzyka-protiv-skrollinga-genezis-na-novoj-stsene-aleksandrinskogo-teatra/',
    },
  ],

  about: {
    lead: 'Петербургский оркестр, который играет классику, современную музыку, саундтреки и собственные сочинения — с юмором и бескомпромиссной подачей. Каждое выступление — результат работы целой команды.',
    facts: [
      { value: '192', label: 'концерта в сезоне 2025/2026' },
      { value: '≈300', label: 'аншлагов «Музыки из кино на органе»' },
      { value: '2017', label: 'год, когда оркестр получил имя «1703»' },
    ],
  },

  director: {
    name: 'Георгий Фёдоров',
    role: 'Художественный руководитель',
    text: 'Композитор, член Союза композиторов России, пианист, аранжировщик и преподаватель. Художественный руководитель Оркестра 1703.',
    photo: 'images/gallery/fedorov.jpg',
  },

  // Оркестранты. Чтобы добавить человека: { name: 'Имя Фамилия', role: 'Инструмент', photo: 'images/...' }
  musicians: [],

  gallery: [
    { image: 'images/gallery/hero.jpg', caption: 'На сцене' },
    { image: 'images/gallery/alice.jpg', caption: '«Алиса в Стране чудес»' },
    { image: 'images/gallery/niaga.jpg', caption: 'Алексей Ньяга' },
    { image: 'images/gallery/keys.jpg', caption: 'За клавишными' },
    { image: 'images/gallery/snow-queen.jpg', caption: '«Снежная королева»' },
    { image: 'images/gallery/courtyard.jpg', caption: 'Концерт под открытым небом' },
    { image: 'images/gallery/fedorov.jpg', caption: 'Георгий Фёдоров' },
  ],
};
