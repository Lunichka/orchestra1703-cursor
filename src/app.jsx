/* Оркестр 1703 — исходник сайта.
   Контент (концерты, новости, контакты) — в content.js, здесь только вёрстка и логика.
   После правок этого файла: npm run build (см. README.md). */

const { useState, useEffect, useRef, useCallback } = React;
const SITE = window.SITE || {};

/* ================= утилиты ================= */

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

function parseDate(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
}
function fmtDate(iso) {
  const d = parseDate(iso);
  if (!d) return { day: '', month: '', weekday: '', full: iso || '' };
  return { day: String(d.getDate()), month: MONTHS[d.getMonth()], weekday: WEEKDAYS[d.getDay()], full: d.getDate() + ' ' + MONTHS[d.getMonth()] };
}
function isUpcoming(iso) {
  const d = parseDate(iso);
  if (!d) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}
const byDate = (a, b) => (parseDate(a.date) || 0) - (parseDate(b.date) || 0);
/* Даты программы: старый формат (date/time/otherDates) тоже понимаем */
function sessionsOf(c) {
  const raw = c.sessions || [{ date: c.date, time: c.time }, ...(c.otherDates || [])];
  return raw
    .filter((s) => s && s.date)
    .map((s) => ({ ...s, time: s.time || c.time || '', venue: s.venue || c.venue || '', ticketUrl: s.ticketUrl || c.ticketUrl || '' }))
    .sort(byDate);
}
const upcomingSessions = (c) => sessionsOf(c).filter((s) => isUpcoming(s.date));
/* Программы, у которых есть будущие даты; next — ближайшая дата */
const upcomingConcerts = () =>
  (SITE.concerts || [])
    .map((c) => ({ ...c, upcoming: upcomingSessions(c) }))
    .filter((c) => c.upcoming.length)
    .map((c) => ({ ...c, next: c.upcoming[0] }))
    .sort((a, b) => byDate(a.next, b.next));
/* Все будущие даты всех программ — для календаря */
const allUpcomingSessions = () =>
  upcomingConcerts()
    .flatMap((c) => c.upcoming.map((s) => ({ ...s, concert: c })))
    .sort((a, b) => byDate(a, b) || String(a.time).localeCompare(String(b.time)));
const plural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
};
const rub = (n) => (n ? 'от ' + Number(n).toLocaleString('ru-RU') + ' ₽' : '');
const isExternal = (url) => /^https?:\/\//.test(url || '');

function ticketHref(primary) {
  return primary || SITE.defaultTicketUrl || '#/contacts';
}
function linkProps(href) {
  return isExternal(href) ? { href, target: '_blank', rel: 'noopener noreferrer' } : { href };
}

/* ---------- маршрутизация по #/адресу: работает на любом статическом хостинге ---------- */
function readRoute() {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return { page: parts[0] || 'home', id: parts[1] ? decodeURIComponent(parts[1]) : null };
}
function useRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

/* ---------- появление блоков при прокрутке ---------- */
function useReveal(dep) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal:not(.in)'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }),
      { rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}

/* ---------- блокировка прокрутки и Esc для модальных окон ---------- */
function useModal(open, onClose) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
}

/* ================= мелкие элементы ================= */

function Star({ className = '', fill = '#ffba55' }) {
  const pts = [];
  for (let i = 0; i < 24; i++) {
    const r = i % 2 === 0 ? 48 : 27;
    const a = (Math.PI * 2 * i) / 24 - Math.PI / 2;
    pts.push((50 + r * Math.cos(a)).toFixed(1) + ',' + (50 + r * Math.sin(a)).toFixed(1));
  }
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <polygon points={pts.join(' ')} fill={fill} stroke="#143127" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="11" fill="#fffae7" stroke="#143127" strokeWidth="5" />
    </svg>
  );
}

function Btn({ href, children, variant = '', size = '', block = false, className = '', ...rest }) {
  const cls = ['btn', variant && 'btn-' + variant, size && 'btn-' + size, block && 'btn-block', className].filter(Boolean).join(' ');
  if (href) {
    return (
      <a className={cls} {...linkProps(href)} {...rest}>
        <span>{children}</span>
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      <span>{children}</span>
    </button>
  );
}

function SectionHead({ eyebrow, title, children, center = false }) {
  return (
    <div className={'reveal mb-10 sm:mb-14 ' + (center ? 'text-center' : '')}>
      {eyebrow && <span className="sticker mb-5">{eyebrow}</span>}
      <h2 className="h-display text-[clamp(32px,7.4vw,76px)]">{title}</h2>
      {children && <p className={'mt-4 max-w-2xl text-base sm:text-lg ' + (center ? 'mx-auto' : '')}>{children}</p>}
    </div>
  );
}

function Initials({ name, className = '' }) {
  const ini = String(name || '')
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
  return (
    <div className={'halftone flex items-center justify-center bg-mustard ' + className} style={{ '--dot': 'rgba(20,49,39,.18)' }} aria-hidden="true">
      <span className="font-display text-[2.4em] leading-none">{ini}</span>
    </div>
  );
}

/* Постер концерта: фото в фирменной гравюре или типографский плакат, если фото нет */
const POSTER_THEMES = [
  { bg: 'bg-coral', fg: 'text-paper', dot: 'rgba(20,49,39,.22)' },
  { bg: 'bg-mustard', fg: 'text-green', dot: 'rgba(20,49,39,.2)' },
  { bg: 'bg-green', fg: 'text-paper', dot: 'rgba(255,250,231,.16)' },
];
function Poster({ concert, index = 0, large = false }) {
  if (concert.image) {
    return <img src={concert.image} alt="" loading="lazy" className="duotone h-full w-full object-cover" />;
  }
  const t = POSTER_THEMES[index % POSTER_THEMES.length];
  return (
    <div className={'halftone relative flex h-full w-full flex-col justify-end overflow-hidden p-5 sm:p-7 ' + t.bg + ' ' + t.fg} style={{ '--dot': t.dot }} aria-hidden="true">
      {large && <span className="absolute right-6 top-4 font-deco text-7xl leading-none opacity-90 sm:text-8xl">1703</span>}
      {!large && <Star className="absolute -left-4 top-6 w-16" fill={index % 3 === 1 ? '#ff5757' : '#ffba55'} />}
      <span className={'h-display relative ' + (large ? 'text-[clamp(34px,5vw,64px)]' : 'text-[clamp(24px,2.4vw,32px)]')}>{concert.title}</span>
    </div>
  );
}

function DateBadge({ iso, className = '' }) {
  const d = fmtDate(iso);
  return (
    <div className={'border-4 border-green bg-paper px-3 pb-2 pt-2.5 text-center shadow-[4px_4px_0_#143127] ' + className}>
      <div className="font-display text-[34px] leading-none">{d.day}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[.12em]">{d.month}</div>
    </div>
  );
}

/* ================= модальные окна ================= */

function Lightbox({ items, index, onClose, onIndex }) {
  const closeRef = useRef(null);
  const open = index !== null && index !== undefined;
  const close = useCallback(() => onClose(), [onClose]);
  useModal(open, close);
  useEffect(() => {
    if (!open) return;
    closeRef.current && closeRef.current.focus();
    const onKey = (e) => {
      if (items.length < 2) return;
      if (e.key === 'ArrowRight') onIndex((index + 1) % items.length);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, items.length, onIndex]);
  if (!open) return null;
  const item = items[index];
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-green/95 p-4" role="dialog" aria-modal="true" aria-label={item.caption || item.alt || 'Фото'} onClick={close}>
      <figure className="relative max-h-full" onClick={(e) => e.stopPropagation()}>
        <img src={item.image} alt={item.alt || item.caption || ''} className="block max-h-[78vh] w-auto rounded-[22px] border-4 border-paper bg-green" />
        {(item.caption || items.length > 1) && (
          <figcaption className="mt-4 flex items-center justify-between gap-4 text-paper">
            <span className="text-sm font-semibold uppercase tracking-[.1em]">{item.caption || ''}</span>
            {items.length > 1 && (
              <span className="text-sm tabular-nums opacity-70">
                {index + 1} / {items.length}
              </span>
            )}
          </figcaption>
        )}
        <button ref={closeRef} type="button" onClick={close} aria-label="Закрыть" className="absolute -right-3 -top-3 flex h-12 w-12 items-center justify-center rounded-full border-4 border-green bg-coral text-xl font-semibold text-paper shadow-[4px_4px_0_#143127]">
          ✕
        </button>
        {items.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-2">
            <button type="button" aria-label="Предыдущее фото" onClick={() => onIndex((index - 1 + items.length) % items.length)} className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border-4 border-green bg-paper text-2xl shadow-[4px_4px_0_#143127]">
              ‹
            </button>
            <button type="button" aria-label="Следующее фото" onClick={() => onIndex((index + 1) % items.length)} className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border-4 border-green bg-paper text-2xl shadow-[4px_4px_0_#143127]">
              ›
            </button>
          </div>
        )}
      </figure>
    </div>
  );
}

/* ================= каркас ================= */

const NAV = [
  { id: 'afisha', label: 'Афиша' },
  { id: 'about', label: 'Об оркестре' },
  { id: 'gallery', label: 'Галерея' },
  { id: 'contacts', label: 'Контакты' },
];

function Logo({ light = false }) {
  return (
    <a href="#/" className="flex items-center gap-3 no-underline" aria-label="Оркестр 1703 — на главную">
      <img src="images/logo-badge.png" alt="" width="576" height="392" className={'h-11 w-auto sm:h-12 ' + (light ? 'brightness-0 invert' : '')} />
      <span className={'font-display text-[13px] uppercase leading-[1.05] tracking-wide sm:text-[15px] ' + (light ? 'text-paper' : 'text-green')}>
        Оркестр
        <br />
        1703
      </span>
    </a>
  );
}

function Header({ page }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useModal(open, close);
  useEffect(() => setOpen(false), [page]);
  const active = page === 'concert' ? 'afisha' : page;

  return (
    <header className="sticky top-0 z-50 border-b-4 border-green bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Основное меню">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={'#/' + n.id}
              aria-current={active === n.id ? 'page' : undefined}
              className={'rounded-full px-4 py-2 text-[13px] font-semibold uppercase tracking-[.1em] no-underline transition-colors ' + (active === n.id ? 'bg-green text-paper' : 'hover:bg-mustard')}
            >
              {n.label}
            </a>
          ))}
          <Btn href="#/afisha" size="sm" className="ml-4">
            Билеты
          </Btn>
        </nav>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-12 w-12 flex-col items-center justify-center gap-1.5 rounded-2xl border-4 border-green bg-paper shadow-[3px_3px_0_#143127] md:hidden"
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <span className={'block h-[3px] w-6 bg-green transition-transform ' + (open ? 'translate-y-[9px] rotate-45' : '')} />
          <span className={'block h-[3px] w-6 bg-green transition-opacity ' + (open ? 'opacity-0' : '')} />
          <span className={'block h-[3px] w-6 bg-green transition-transform ' + (open ? '-translate-y-[9px] -rotate-45' : '')} />
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[76px] z-40 overflow-y-auto border-t-4 border-green bg-cream px-4 pb-10 pt-6 md:hidden" aria-label="Меню">
          <div className="flex flex-col gap-4">
            {[{ id: '', label: 'Главная' }, ...NAV].map((n, i) => (
              <a
                key={n.id}
                href={'#/' + n.id}
                onClick={close}
                className={'card block px-6 py-5 no-underline ' + (i % 2 ? 'tilt-r' : 'tilt-l') + ' ' + ((active === n.id || (!n.id && active === 'home')) ? 'bg-coral text-paper' : '')}
              >
                <span className="h-display text-[30px]">{n.label}</span>
              </a>
            ))}
          </div>
          <Btn href="#/afisha" variant="green" size="lg" block className="mt-8" onClick={close}>
            Купить билеты
          </Btn>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const c = SITE.contacts || {};
  const socials = (c.socials || []).filter((s) => s.url);
  return (
    <footer className="relative overflow-hidden border-t-4 border-green bg-green text-paper">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-6 max-w-xs font-deco text-3xl leading-tight text-mustard">Самый дружелюбный оркестр</p>
        </div>
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[.14em] text-paper/60">Разделы</h2>
          <ul className="grid gap-2">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={'#/' + n.id} className="font-semibold text-paper no-underline hover:text-mustard">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[.14em] text-paper/60">Связаться</h2>
          {c.phone && (
            <a href={'tel:' + c.phone.replace(/[^\d+]/g, '')} className="mb-2 block font-display text-xl text-paper no-underline">
              {c.phone}
            </a>
          )}
          {c.email && (
            <a href={'mailto:' + c.email} className="text-paper underline decoration-coral decoration-2 underline-offset-4 hover:text-mustard">
              {c.email}
            </a>
          )}
          {socials.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              {socials.map((s) => (
                <a key={s.label} {...linkProps(s.url)} className="chip border-paper text-paper no-underline hover:bg-paper hover:text-green">
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-t-2 border-paper/15 px-4 py-6 text-xs text-paper/60 sm:px-6">© {new Date().getFullYear()} Оркестр 1703, Санкт-Петербург</div>
    </footer>
  );
}

/* ================= карточка концерта ================= */

function ConcertCard({ concert, index }) {
  const s = concert.next;
  const d = fmtDate(s.date);
  const more = concert.upcoming.length - 1;
  const href = '#/concert/' + concert.id;
  return (
    <article className={'reveal card card-hover group flex flex-col p-4 sm:p-5 ' + (index % 2 ? 'tilt-r' : 'tilt-l')}>
      <a href={href} className="frame block aspect-[4/3]" tabIndex={-1} aria-hidden="true">
        <Poster concert={concert} index={index} />
      </a>
      <DateBadge iso={s.date} className="absolute right-7 top-7 rotate-3 sm:right-8 sm:top-8" />
      {concert.tag && <span className="chip absolute left-7 top-7 bg-coral text-paper sm:left-8 sm:top-8">{concert.tag}</span>}
      <div className="flex flex-1 flex-col px-1 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[.12em] text-green/70">
          {d.weekday} · <span className="text-coral">{s.time}</span>
          {more > 0 && <span className="ml-2 rounded-full bg-mustard px-2 py-0.5 text-green">ещё {more} {plural(more, 'дата', 'даты', 'дат')}</span>}
        </p>
        <h3 className="mt-2 font-display text-[24px] uppercase leading-[1.02]">
          <a href={href} className="no-underline hover:text-coral">
            {concert.title}
          </a>
        </h3>
        <p className="mt-2 text-sm">{s.venue}</p>
        <div className="mt-auto flex items-center gap-3 pt-6">
          <Btn href={href} variant="paper" size="sm">
            Подробнее
          </Btn>
          <Btn href={ticketHref(s.ticketUrl)} size="sm" block>
            Билеты
          </Btn>
        </div>
      </div>
    </article>
  );
}

/* Календарь: все ближайшие даты по месяцам, как список билетов */
function Calendar() {
  const sessions = allUpcomingSessions();
  if (!sessions.length) return null;
  const months = [];
  sessions.forEach((s) => {
    const dt = parseDate(s.date);
    const key = dt.getFullYear() + '-' + dt.getMonth();
    let m = months.find((x) => x.key === key);
    if (!m) months.push((m = { key, name: MONTHS_NOM[dt.getMonth()], year: dt.getFullYear(), items: [] }));
    m.items.push(s);
  });
  const thisYear = new Date().getFullYear();
  return (
    <section className="mt-20 sm:mt-28">
      <SectionHead eyebrow="Все даты" title="Календарь" />
      <div className="grid gap-12">
        {months.map((m, mi) => (
          <div key={m.key} className="reveal">
            <h3 className={'mb-5 inline-block font-display text-[clamp(26px,4vw,40px)] uppercase ' + (mi % 2 ? 'text-coral' : '')}>
              {m.name}
              {m.year !== thisYear ? ' ' + m.year : ''}
            </h3>
            <ul className="card divide-y-[3px] divide-dashed divide-green/30 overflow-hidden p-0">
              {m.items.map((s) => {
                const d = fmtDate(s.date);
                return (
                  <li key={s.concert.id + s.date + s.time} className="grid grid-cols-[84px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 px-4 py-4 sm:grid-cols-[130px_minmax(0,1fr)_auto] sm:gap-x-6 sm:px-7">
                    <div>
                      <span className="font-display text-2xl leading-none">{d.day}</span>
                      <span className="block text-sm font-semibold sm:ml-1.5 sm:inline">{d.month}</span>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-[.1em] text-green/60">
                        {WEEKDAYS_SHORT[parseDate(s.date).getDay()]} · <span className="text-coral">{s.time}</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <a href={'#/concert/' + s.concert.id} className="font-display text-lg uppercase leading-tight no-underline hover:text-coral sm:text-xl">
                        {s.concert.title}
                      </a>
                      <div className="text-sm">{s.venue}</div>
                    </div>
                    <Btn href={ticketHref(s.ticketUrl)} size="sm" className="col-start-2 justify-self-start sm:col-start-3 sm:justify-self-end">
                      Билеты
                    </Btn>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

const social = (label) => ((SITE.contacts || {}).socials || []).find((s) => s.label === label && s.url);

function ConcertGrid({ concerts }) {
  if (!concerts.length) {
    const tg = social('Telegram');
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="font-display text-2xl uppercase">Новые даты скоро</p>
        <p className="mt-3">Свежее расписание первым появляется в нашем Telegram и на taplink.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {tg && (
            <Btn href={tg.url} variant="green">
              Telegram
            </Btn>
          )}
          {SITE.defaultTicketUrl && (
            <Btn href={SITE.defaultTicketUrl} variant="paper">
              Вся афиша на taplink
            </Btn>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
      {concerts.map((c, i) => (
        <ConcertCard key={c.id} concert={c} index={i} />
      ))}
    </div>
  );
}

/* ================= постоянные программы ================= */

/* Большой блок «хита» на главной: программа с featured: true */
function FeaturedProgram({ program }) {
  const dates = program.upcoming.slice(0, 6);
  return (
    <div className="reveal card relative overflow-hidden bg-mustard p-6 sm:p-10">
      <Star className="absolute -right-6 -top-6 w-28 sm:w-36" fill="#ff5757" />
      <span className="sticker">Хит сезона</span>
      <h3 className="h-display relative mt-5 max-w-3xl text-[clamp(30px,5.4vw,60px)]">{program.title}</h3>
      <p className="mt-4 text-lg font-semibold">
        {program.venue}
        {program.address ? ', ' + program.address : ''}
      </p>
      {program.description && <p className="mt-3 max-w-2xl text-base leading-relaxed sm:text-lg">{program.description}</p>}
      <ul className="mt-6 flex flex-wrap gap-3" aria-label="Ближайшие даты">
        {dates.map((s) => {
          const d = fmtDate(s.date);
          return (
            <li key={s.date + s.time} className="chip bg-paper">
              {d.full} · {s.time}
            </li>
          );
        })}
        {program.upcoming.length > dates.length && <li className="chip bg-green text-paper">ещё {program.upcoming.length - dates.length}</li>}
      </ul>
      <div className="mt-8 flex flex-wrap gap-4">
        <Btn href={ticketHref(program.ticketUrl)} variant="green" size="lg">
          Выбрать дату и купить билет
        </Btn>
        <Btn href={'#/concert/' + program.id} variant="paper" size="lg">
          О программе
        </Btn>
      </div>
    </div>
  );
}

/* ================= главная ================= */

function Hero() {
  const next = upcomingConcerts()[0];
  return (
    <section className="relative overflow-hidden border-b-4 border-green">
      <div className="squiggle -right-40 -top-24 hidden h-[560px] w-[660px] opacity-90 lg:block" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.08fr_.92fr] lg:gap-10 lg:pb-24 lg:pt-16">
        <div className="relative z-10">
          <span className="sticker">Санкт-Петербург · сезон 2026/27</span>
          <h1 className="h-display mt-6 text-[clamp(34px,10vw,68px)] lg:text-[clamp(52px,5.4vw,86px)]">
            <span className="block -rotate-1">Самый</span>
            <span className="t-stroke block py-1 pl-[.25em]">дружелюбный</span>
            <span className="mt-2 block pl-[.1em]">
              <span className="t-box">оркестр</span>
            </span>
          </h1>
          <p className="mt-8 max-w-[30ch] text-lg font-semibold leading-snug sm:text-xl">Микс классической виртуозности, юмора и бескомпромиссной подачи</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Btn href="#/afisha" size="lg">
              Афиша и билеты
            </Btn>
            <Btn href="#/about" variant="paper" size="lg">
              Об оркестре
            </Btn>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[620px] lg:mr-0">
          <Star className="absolute -left-6 -top-8 z-10 w-20 sm:-left-10 sm:w-28" />
          <div className="frame aspect-[4/3] rotate-[1.5deg] shadow-[10px_10px_0_#143127] sm:aspect-[16/10]">
            <video className="h-full w-full object-cover" src="assets/media/hero.mp4" poster="assets/media/hero-poster.jpg" autoPlay muted loop playsInline preload="metadata" aria-label="Фрагмент концерта Оркестра 1703" />
          </div>
          {next && (
            <a href={'#/concert/' + next.id} className="card card-hover absolute -bottom-12 left-2 z-10 flex max-w-[92%] -rotate-2 items-center gap-4 bg-mustard py-3 pl-3 pr-5 no-underline sm:-left-8 sm:max-w-[88%]">
              <DateBadge iso={next.next.date} className="shrink-0" />
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-[.14em]">Ближайший концерт</span>
                <span className="mt-1 block font-display text-lg uppercase leading-[1.05] sm:text-xl">{next.title}</span>
                <span className="mt-1 block truncate text-sm">
                  {next.next.time} · {next.next.venue}
                </span>
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const words = ['Самый дружелюбный оркестр', ...upcomingConcerts().map((c) => c.title), 'Санкт-Петербург'];
  const row = (k) => (
    <div className="flex shrink-0 items-center" aria-hidden={k ? 'true' : undefined} key={k}>
      {words.map((w, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 font-display text-[22px] uppercase sm:text-[28px]">{w}</span>
          <Star className="w-8 shrink-0" fill={i % 2 ? '#ff5757' : '#ffba55'} />
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee border-b-4 border-green bg-green py-4 text-paper">
      <div className="marquee-track">
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
}

function HomePage() {
  const upcoming = upcomingConcerts();
  const featured = upcoming.find((c) => c.featured);
  const concerts = upcoming.filter((c) => c !== featured).slice(0, 3);
  const news = SITE.news;
  const press = SITE.press || [];
  const video = SITE.video;
  const c = SITE.contacts || {};
  const [slide, setSlide] = useState(null);
  const closeSlide = useCallback(() => setSlide(null), []);
  const slides = news ? (news.slides || []) : [];

  return (
    <>
      <Hero />
      <Marquee />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHead eyebrow="Афиша" title="Ближайшие концерты" />
        {featured && (
          <div className="mb-16">
            <FeaturedProgram program={featured} />
          </div>
        )}
        <ConcertGrid concerts={concerts} />
        {upcoming.length > 0 && (
          <div className="mt-14 text-center">
            <Btn href="#/afisha" variant="green" size="lg">
              Вся афиша и календарь →
            </Btn>
          </div>
        )}
      </section>

      <div className="border-y-4 border-green bg-paper">
        <img src="images/banner.jpg" alt="Оркестр 1703: гравюра с дирижёром и музыкантами" loading="lazy" className="block h-[200px] w-full object-cover object-center sm:h-auto" width="2600" height="654" />
      </div>

      {news && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionHead eyebrow="Новости" title={news.title}>
            {news.text}
          </SectionHead>
          <div className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-6 pt-2 md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0">
            {slides.map((s, i) => (
              <button
                key={s.image}
                type="button"
                onClick={() => setSlide(i)}
                className={'reveal card card-hover group w-[78%] shrink-0 snap-center overflow-hidden p-0 sm:w-[46%] md:w-auto ' + (i % 2 ? 'tilt-r' : 'tilt-l')}
                aria-label={'Открыть: ' + s.alt}
              >
                <img src={s.image} alt={s.alt} loading="lazy" className="block aspect-[4/5] w-full object-cover" />
              </button>
            ))}
          </div>
          <Lightbox items={slides} index={slide} onClose={closeSlide} onIndex={setSlide} />
        </section>
      )}

      {video && video.src && (
        <section className="border-y-4 border-green bg-green py-16 text-paper sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="reveal mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="sticker sticker-mustard">Видео</span>
                <h2 className="h-display mt-5 text-[clamp(30px,6vw,64px)]">{video.title}</h2>
              </div>
            </div>
            <div className="reveal frame -rotate-1 border-paper shadow-[10px_10px_0_#ff5757]">
              <video className="block aspect-video w-full bg-green" src={video.src} poster={video.poster} controls preload="none" playsInline />
            </div>
            {social('YouTube') && (
              <div className="mt-12 text-center">
                <Btn href={social('YouTube').url} variant="mustard" size="lg">
                  Больше видео на YouTube →
                </Btn>
              </div>
            )}
          </div>
        </section>
      )}

      {press.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionHead eyebrow="Пресса" title="О нас пишут" />
          <ul className="grid gap-6">
            {press.map((p, i) => (
              <li key={p.url} className="reveal">
                <a {...linkProps(p.url)} className={'card card-hover group flex items-center gap-5 p-5 no-underline sm:p-7 ' + (i % 2 ? 'tilt-r' : 'tilt-l')}>
                  <span className="min-w-0 flex-1">
                    <span className={'chip mb-3 ' + (i % 2 ? 'bg-mustard' : 'bg-coral text-paper')}>{p.outlet}</span>
                    <span className="block font-semibold leading-snug sm:text-lg">{p.title}</span>
                  </span>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-green bg-paper text-xl transition-transform group-hover:translate-x-1" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="reveal card relative mx-auto max-w-5xl overflow-hidden bg-coral px-6 py-10 text-paper sm:px-12 sm:py-14">
          <div className="squiggle -bottom-24 -right-20 h-[300px] w-[360px] opacity-60 brightness-0 invert" />
          <h2 className="h-display relative text-[clamp(28px,5vw,52px)]">Есть вопрос или идея?</h2>
          <p className="relative mt-4 max-w-xl text-lg">Пишите — мы отвечаем на всё: от билетов до совместных проектов.</p>
          <div className="relative mt-8 flex flex-wrap gap-4">
            <Btn href="#/contacts" variant="paper" size="lg">
              Написать нам
            </Btn>
            {c.email && (
              <a href={'mailto:' + c.email} className="self-center font-semibold text-paper underline decoration-2 underline-offset-4">
                {c.email}
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

/* ================= афиша ================= */

function AfishaPage() {
  const all = upcomingConcerts();
  const venues = Array.from(new Set(all.flatMap((c) => c.upcoming.map((s) => s.venue)).filter(Boolean)));
  const [filter, setFilter] = useState('Все');
  const list = filter === 'Все' ? all : all.filter((c) => c.upcoming.some((s) => s.venue === filter));
  const tags = venues;
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="reveal mb-10">
        <span className="sticker">Сезон 2026/27</span>
        <h1 className="h-display mt-5 text-[clamp(44px,11vw,120px)]">
          <span className="t-stroke">Афиша</span>
        </h1>
      </div>
      {tags.length > 1 && (
        <div className="mb-12 flex flex-wrap gap-3" role="group" aria-label="Площадка">
          {['Все', ...tags].map((t) => (
            <button key={t} type="button" onClick={() => setFilter(t)} aria-pressed={filter === t} className={'chip transition-colors ' + (filter === t ? 'bg-green text-paper' : 'bg-paper hover:bg-mustard')}>
              {t}
            </button>
          ))}
        </div>
      )}
      <ConcertGrid concerts={list} />
      <Calendar />
    </div>
  );
}

/* ================= страница концерта ================= */

function ConcertPage({ id }) {
  const concert = (SITE.concerts || []).find((c) => c.id === id);
  const index = Math.max(0, (SITE.concerts || []).indexOf(concert));
  useEffect(() => {
    if (concert) document.title = concert.title + ' — Оркестр 1703';
  }, [concert]);
  if (!concert) return <NotFound />;

  const upcoming = upcomingSessions(concert);
  const all = sessionsOf(concert);
  const main = upcoming[0] || all[all.length - 1] || {};
  const d = fmtDate(main.date);
  const past = !upcoming.length;
  const others = upcoming.slice(1);
  const people = concert.participants || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
      <a href="#/afisha" className="mb-10 inline-block font-semibold uppercase tracking-[.1em] text-sm no-underline hover:text-coral">
        ← Вся афиша
      </a>

      <div className="grid items-stretch gap-10 lg:grid-cols-12">
        <div className="card flex flex-col p-6 sm:p-9 lg:col-span-5">
          {concert.tag && <span className="chip self-start bg-coral text-paper">{concert.tag}</span>}
          <h1 className="h-display mt-5 text-[clamp(26px,7.4vw,58px)] lg:text-[clamp(34px,3.6vw,58px)]">{concert.title}</h1>
          {concert.subtitle && <p className="mt-3 text-sm font-semibold uppercase tracking-[.1em] text-green/70">{concert.subtitle}</p>}
          <div className="mt-8 border-t-4 border-dashed border-green pt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-green/60">{others.length ? 'Ближайшая дата' : 'Дата и время'}</p>
            <p className="mt-2 font-display text-[clamp(32px,4vw,46px)] uppercase leading-none">{d.full}</p>
            <p className="mt-2 text-lg font-semibold">
              {d.weekday}, <span className="text-coral">{main.time}</span>
            </p>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[.14em] text-green/60">Площадка</p>
            <p className="mt-1 text-lg font-semibold">
              {main.venue}
              {concert.address && main.venue === concert.venue ? ', ' + concert.address : ''}
            </p>
            {concert.details && <p className="mt-4 text-sm font-semibold uppercase tracking-[.08em] text-green/70">{concert.details}</p>}
          </div>
          <div className="mt-auto pt-8">
            {past ? (
              <p className="sticker sticker-mustard">Концерт уже прошёл</p>
            ) : (
              <Btn href={ticketHref(main.ticketUrl)} size="lg" block>
                Купить билеты
              </Btn>
            )}
          </div>
        </div>
        <div className="relative lg:col-span-7">
          <Star className="absolute -left-5 -top-6 z-10 w-20 sm:w-24" fill={concert.image ? '#ff5757' : '#ffba55'} />
          <div className="frame h-full min-h-[320px] rotate-1 shadow-[10px_10px_0_#ffba55] group">
            <Poster concert={concert} index={index} large />
          </div>
        </div>
      </div>

      {concert.description && (
        <section className="reveal card mt-16 p-6 pt-10 sm:p-12 sm:pt-14">
          <span className="sticker sticker-mustard absolute -top-5 left-6 sm:left-10">О концерте</span>
          <p className="max-w-3xl text-lg leading-relaxed sm:text-xl">{concert.description}</p>
        </section>
      )}

      {people.length > 0 && (
        <section className="mt-20">
          <SectionHead title="Участники" />
          <div className="grid gap-8 md:grid-cols-2">
            {people.map((p, i) => (
              <div key={p.name} className={'reveal card flex items-center gap-5 p-5 sm:gap-7 sm:p-6 ' + (i % 2 ? 'tilt-r' : 'tilt-l')}>
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-green sm:h-32 sm:w-32">
                  {p.photo ? <img src={p.photo} alt="" loading="lazy" className="duotone h-full w-full object-cover object-top" /> : <Initials name={p.name} className="h-full w-full text-[14px] sm:text-[18px]" />}
                </div>
                <div>
                  <h3 className="font-display text-xl uppercase leading-none sm:text-2xl">{p.name}</h3>
                  <span className="chip mt-3 bg-mustard">{p.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="mt-20">
          <SectionHead title="Другие даты" />
          <div className="grid gap-8 md:grid-cols-2">
            {others.map((o) => {
              const od = fmtDate(o.date);
              return (
                <div key={o.date + o.time} className="reveal ticket card flex flex-wrap items-center justify-between gap-4 px-8 py-6 sm:px-10">
                  <div>
                    <p className="font-display text-2xl uppercase leading-none">{od.full}</p>
                    <p className="mt-2 text-sm font-semibold uppercase tracking-[.08em] text-green/70">
                      {od.weekday} · <span className="text-coral">{o.time}</span> · {o.venue}
                    </p>
                  </div>
                  <Btn href={ticketHref(o.ticketUrl)} size="sm">
                    Билеты
                  </Btn>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/* ================= об оркестре ================= */

function AboutPage() {
  const about = SITE.about || {};
  const dir = SITE.director;
  const musicians = SITE.musicians || [];
  const interview = (SITE.press || []).find((p) => p.interview) || (SITE.press || [])[0];
  const gallery = (SITE.gallery || []).slice(0, 3);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="reveal grid items-end gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <span className="sticker">Об оркестре</span>
          <h1 className="h-display mt-5 text-[clamp(40px,9vw,104px)]">
            Оркестр <span className="t-stroke">1703</span>
          </h1>
          {about.lead && <p className="mt-8 max-w-2xl text-lg leading-relaxed sm:text-xl">{about.lead}</p>}
        </div>
        {(about.facts || []).length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            {about.facts.map((f, i) => (
              <div key={f.label} className={'card p-3 sm:p-5 ' + ['tilt-l bg-coral text-paper', 'tilt-r bg-mustard', 'tilt-l bg-green text-paper'][i % 3]}>
                <div className="font-display text-[clamp(26px,3.6vw,48px)] leading-none">{f.value}</div>
                <div className="mt-3 text-[12px] font-semibold leading-snug sm:text-sm">{f.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {dir && (
        <section className="reveal card mt-20 grid gap-8 p-5 sm:p-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 md:p-10">
          <div className="frame group aspect-[4/5] -rotate-1 shadow-[8px_8px_0_#ffba55]">
            {dir.photo ? <img src={dir.photo} alt={dir.name} loading="lazy" className="duotone h-full w-full object-cover object-top" /> : <Initials name={dir.name} className="h-full w-full text-3xl" />}
          </div>
          <div className="flex flex-col justify-center">
            <span className="chip self-start bg-mustard">{dir.role}</span>
            <h2 className="h-display mt-5 text-[clamp(32px,5vw,60px)]">{dir.name}</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed">{dir.text}</p>
            {interview && (
              <Btn href={interview.url} variant="green" className="mt-8 self-start">
                Читать интервью в «{interview.outlet}е» →
              </Btn>
            )}
          </div>
        </section>
      )}

      {musicians.length > 0 && (
        <section className="mt-20">
          <SectionHead title="Оркестранты" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {musicians.map((m, i) => (
              <div key={m.name} className={'reveal card group p-4 ' + (i % 2 ? 'tilt-r' : 'tilt-l')}>
                <div className="frame aspect-square">{m.photo ? <img src={m.photo} alt="" loading="lazy" className="duotone h-full w-full object-cover" /> : <Initials name={m.name} className="h-full w-full text-2xl" />}</div>
                <h3 className="mt-4 font-display text-xl uppercase leading-none">{m.name}</h3>
                <span className="chip mt-3 bg-mustard">{m.role}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="mt-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {gallery.map((g, i) => (
              <a key={g.image} href="#/gallery" className={'reveal frame group block aspect-[4/3] shadow-[6px_6px_0_#143127] ' + (i % 2 ? 'rotate-1' : '-rotate-1')} aria-label={'Галерея: ' + g.caption}>
                <img src={g.image} alt="" loading="lazy" className="duotone h-full w-full object-cover" />
              </a>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Btn href="#/gallery" variant="paper">
              Вся галерея →
            </Btn>
          </div>
        </section>
      )}
    </div>
  );
}

/* ================= галерея ================= */

function GalleryPage() {
  const items = SITE.gallery || [];
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="reveal mb-14">
        <span className="sticker">Сцена и закулисье</span>
        <h1 className="h-display mt-5 text-[clamp(44px,11vw,120px)]">
          <span className="t-stroke">Галерея</span>
        </h1>
      </div>
      <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
        {items.map((g, i) => (
          <figure key={g.image} className="reveal mb-10 break-inside-avoid">
            <button type="button" onClick={() => setOpen(i)} className={'card card-hover group block w-full overflow-hidden p-0 ' + (i % 2 ? 'tilt-r' : 'tilt-l')} aria-label={'Открыть фото: ' + (g.caption || i + 1)}>
              <img src={g.image} alt={g.caption || ''} loading="lazy" className="duotone block w-full" />
            </button>
            {g.caption && <figcaption className="chip mt-4 bg-paper">{g.caption}</figcaption>}
          </figure>
        ))}
      </div>
      <Lightbox items={items} index={open} onClose={close} onIndex={setOpen} />
    </div>
  );
}

/* ================= контакты ================= */

function ContactsPage() {
  const c = SITE.contacts || {};
  const socials = (c.socials || []).filter((s) => s.url);
  const [form, setForm] = useState({ name: '', subject: '', message: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const onSubmit = (e) => {
    e.preventDefault();
    const subject = form.subject || 'Сообщение с сайта';
    const body = form.message + (form.name ? '\n\n— ' + form.name : '');
    window.location.href = 'mailto:' + c.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  };
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="reveal mb-14">
        <span className="sticker">Контакты</span>
        <h1 className="h-display mt-5 text-[clamp(38px,9vw,104px)]">
          Давайте <span className="t-stroke">дружить</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg">Предложить сотрудничество, спросить о концерте или просто поздороваться — пишите.</p>
      </div>

      <div className="grid items-start gap-10 md:grid-cols-12">
        <div className="card tilt-l space-y-8 bg-mustard p-6 sm:p-9 md:col-span-5">
          {c.email && (
            <div>
              <p className="label">Почта</p>
              <a href={'mailto:' + c.email} className="break-all font-display text-[clamp(20px,2.6vw,28px)] no-underline hover:text-coral">
                {c.email}
              </a>
            </div>
          )}
          {c.phone && (
            <div>
              <p className="label">Телефон</p>
              <a href={'tel:' + c.phone.replace(/[^\d+]/g, '')} className="font-display text-[clamp(20px,2.6vw,28px)] no-underline hover:text-coral">
                {c.phone}
              </a>
            </div>
          )}
          {socials.length > 0 && (
            <div>
              <p className="label">Соцсети</p>
              <div className="flex flex-wrap gap-4">
                {socials.map((s, i) => (
                  <Btn key={s.label} href={s.url} variant={i % 2 ? 'green' : 'paper'} size="sm">
                    {s.label}
                  </Btn>
                ))}
              </div>
            </div>
          )}
        </div>

        {c.email && (
          <form onSubmit={onSubmit} className="card tilt-r space-y-5 p-6 sm:p-9 md:col-span-7">
            <h2 className="font-display text-2xl uppercase">Написать нам</h2>
            <div>
              <label htmlFor="f-name" className="label">
                Как вас зовут
              </label>
              <input id="f-name" className="field" autoComplete="name" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label htmlFor="f-subject" className="label">
                Тема
              </label>
              <input id="f-subject" className="field" placeholder="Например, вопрос о концерте" value={form.subject} onChange={set('subject')} />
            </div>
            <div>
              <label htmlFor="f-msg" className="label">
                Сообщение
              </label>
              <textarea id="f-msg" required rows="5" className="field resize-y" value={form.message} onChange={set('message')} />
            </div>
            <button type="submit" className="btn btn-block">
              <span>Открыть почту и отправить</span>
            </button>
            <p className="text-sm text-green/70">Откроется ваша почтовая программа с готовым письмом. Мы не храним ваши данные на сайте.</p>
          </form>
        )}
      </div>
    </div>
  );
}

/* ================= 404 ================= */

function NotFound() {
  return (
    <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2">
      <div className="frame aspect-[4/3] -rotate-2 shadow-[10px_10px_0_#143127]">
        <img src="images/404.jpg" alt="" className="h-full w-full object-cover" />
      </div>
      <div>
        <span className="sticker">Ошибка 404</span>
        <h1 className="h-display mt-5 text-[clamp(36px,6vw,64px)]">
          Тут <span className="t-stroke">пауза</span>
        </h1>
        <p className="mt-5 text-lg">Такой страницы нет — возможно, концерт уже прошёл или ссылка устарела.</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Btn href="#/">На главную</Btn>
          <Btn href="#/afisha" variant="paper">
            Афиша
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ================= приложение ================= */

const TITLES = { home: 'Оркестр 1703 — самый дружелюбный оркестр', afisha: 'Афиша — Оркестр 1703', about: 'Об оркестре — Оркестр 1703', gallery: 'Галерея — Оркестр 1703', contacts: 'Контакты — Оркестр 1703' };

function App() {
  const { page, id } = useRoute();
  useReveal(page + (id || ''));
  useEffect(() => {
    if (TITLES[page]) document.title = TITLES[page];
  }, [page]);

  let content;
  if (page === 'home') content = <HomePage />;
  else if (page === 'afisha') content = <AfishaPage />;
  else if (page === 'concert') content = <ConcertPage id={id} />;
  else if (page === 'about') content = <AboutPage />;
  else if (page === 'gallery') content = <GalleryPage />;
  else if (page === 'contacts') content = <ContactsPage />;
  else content = <NotFound />;

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-xl focus:bg-paper focus:px-4 focus:py-2" onClick={(e) => { e.preventDefault(); document.getElementById('main').focus(); }}>
        К содержимому
      </a>
      <Header page={page} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none" key={page + (id || '')}>
        {content}
      </main>
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
