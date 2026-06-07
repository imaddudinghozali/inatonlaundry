import { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  ClipboardList,
  Clock3,
  CreditCard,
  FileClock,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu as MenuIcon,
  PackageCheck,
  Plus,
  RefreshCw,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Settings,
  Timer,
  Truck,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react';
import { api, apiForm, rupiah, setCsrfToken } from './services/api.js';

const logoSrc = '/brand/logo-inaton.png';
const qrisSrc = '/payments/qris-inaton.png';
const whatsappLink = 'https://wa.me/message/TK5LFABTXCBJE1';
const mapsLink = 'https://www.google.com/maps/place/INATON+LAUNDRY+EXPRESS+JATINANGOR+3+Jam+Beres/@-6.9342517,107.7673749,17z/data=!3m1!4b1!4m6!3m5!1s0x2e68c5001b36f0d9:0xb80c333e92ca3411!8m2!3d-6.934257!4d107.7699498!16s%2Fg%2F11n9vj24m6?entry=ttu&g_ep=EgoyMDI2MDYwMS4wIKXMDSoASAFQAw%3D%3D';

const homeImages = {
  hero: '/home/hero.jpg',
  washer: '/home/washer.jpg',
  iron: '/home/iron.jpg',
};

const homeReasons = [
  { icon: Truck, title: 'Antar Jemput Gratis', text: 'Lebih praktis untuk area sekitar Jatinangor.' },
  { icon: Zap, title: 'Pengerjaan Mulai 1-2 Jam', text: 'Ada pilihan cepat saat cucian dibutuhkan hari ini.' },
  { icon: CreditCard, title: 'Membership Saldo Anti Hangus', text: 'Top up sekali, pakai untuk banyak transaksi laundry.' },
  { icon: MapPin, title: 'Dekat Kampus', text: 'Dekat Unpad, IPDN, Ikopin, dan ITB Jatinangor.' },
];

const homeServices = [
  { title: 'Cuci Komplit', text: 'Cuci + Kering + Lipat', image: homeImages.hero },
  { title: 'Cuci Lipat', text: 'Cuci + Lipat', image: homeImages.washer },
  { title: 'Setrika Saja', text: 'Rapi dan Siap Pakai', image: homeImages.iron },
];

const speedOptions = [
  ['Super Prioritas', '1-2 Jam'],
  ['Prioritas', '3 Jam'],
  ['Same Day', '6 Jam'],
  ['Express', '24 Jam'],
  ['Reguler Cepat', '2 Hari'],
  ['Reguler', '3 Hari'],
];

const membershipPlans = [
  ['Rp 100.000', 'Rp 10.000', 'Rp110.000'],
  ['Rp180.000', 'Rp20.000', 'Rp200.000'],
  ['Rp350.000', 'Rp50.000', 'Rp400.000'],
  ['Rp600.000', 'Rp75.000', 'Rp675.000'],
  ['Rp1.000.000', 'Rp100.000', 'Rp1.100.000'],
];

const membershipSteps = [
  'Daftar Member',
  'Top Up Saldo',
  'Gunakan untuk Laundry',
  'Pantau Saldo & Transaksi Online',
];

const testimonials = [
  {
    name: 'chan',
    meta: '1 ulasan',
    text: 'Laundry nya cepet, parfumnya wangi, padahal cuma mau nyoba laundry di tempat baru tapi ternyata bagus.',
  },
  {
    name: 'NZ_RR',
    meta: '2 ulasan',
    text: 'Laundry annya bersih, murah meriah, penjaganya juga ramah.',
  },
  {
    name: 'Yanti Rahayu',
    meta: '4 ulasan',
    text: 'Baju cucian bersih dan wangi, pengerjaan cepat. Respon admin cepat terimakasih.',
  },
];

const faqs = [
  ['Saldo bisa hangus?', 'Tidak. Saldo member Inaton Laundry anti hangus dan bisa dipakai untuk transaksi berikutnya.'],
  ['Bisa dipakai buat layanan apa aja?', 'Bisa dipakai untuk seluruh layanan laundry Inaton, termasuk reguler sampai super prioritas.'],
  ['Ada minimal top up?', 'Paket membership dimulai dari Rp100.000 dengan benefit tambahan Rp10.000.'],
  ['Bisa transfer?', 'Bisa. Hubungi admin WhatsApp untuk instruksi dan konfirmasi pembayaran.'],
  ['Bisa COD?', 'Bisa ditanyakan langsung ke admin, terutama untuk layanan antar jemput atau kebutuhan khusus.'],
];

const homeNavItems = [
  { href: '#layanan', label: 'Layanan', icon: Shirt },
  { href: '#membership', label: 'Membership', icon: WalletCards },
  { href: '#kecepatan', label: 'Kecepatan', icon: Clock3 },
  { href: '#faq', label: 'FAQ', icon: FileText },
  { href: mapsLink, label: 'Lokasi', icon: MapPin, external: true },
];

const transactionPaymentMethods = [
  ['cash', 'Cash'],
  ['transfer', 'Transfer'],
  ['qris_manual', 'QRIS Manual'],
  ['saldo', 'Saldo Member'],
];

const topupPaymentMethods = [
  ['qris_statis', 'QRIS Statis'],
  ['transfer', 'Transfer'],
  ['cash', 'Cash'],
];

const reportPaymentMethods = [
  ...topupPaymentMethods,
  ['qris_manual', 'QRIS Manual'],
  ['saldo', 'Saldo Member'],
];

const menu = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'admin', 'customer'] },
  { id: 'members', label: 'Member', icon: Users, roles: ['owner', 'admin'] },
  { id: 'services', label: 'Layanan', icon: Shirt, roles: ['owner', 'admin'] },
  { id: 'topups', label: 'Top Up', icon: WalletCards, roles: ['owner', 'admin'] },
  { id: 'transactions', label: 'Transaksi', icon: ClipboardList, roles: ['owner', 'admin'] },
  { id: 'status-laundry', label: 'Status Laundry', icon: PackageCheck, roles: ['owner', 'admin'] },
  { id: 'mutations', label: 'Mutasi', icon: History, roles: ['owner'] },
  { id: 'balance', label: 'Koreksi', icon: Banknote, roles: ['owner'] },
  { id: 'reports', label: 'Laporan', icon: FileText, roles: ['owner', 'admin'] },
  { id: 'audit', label: 'Audit', icon: ShieldCheck, roles: ['owner'] },
  { id: 'settings', label: 'Pengaturan', icon: Settings, roles: ['owner'] },
  { id: 'balance-self', label: 'Saldo Saya', icon: WalletCards, roles: ['customer'] },
  { id: 'topup-history', label: 'Riwayat Top Up', icon: WalletCards, roles: ['customer'] },
  { id: 'orders', label: 'Pesanan Laundry', icon: PackageCheck, roles: ['customer'] },
  { id: 'transaction-history', label: 'Riwayat Transaksi', icon: ClipboardList, roles: ['customer'] },
  { id: 'profile', label: 'Profil Saya', icon: Users, roles: ['customer'] },
];

const laundryStatuses = ['diterima', 'dicuci', 'dikeringkan', 'disetrika', 'selesai', 'diambil'];

function paymentMethodLabel(value) {
  return [...reportPaymentMethods, ...transactionPaymentMethods].find(([method]) => method === value)?.[1] || value || '-';
}

function canRefundTransaction(item) {
  return (
    item.status_pembayaran === 'lunas'
    && Number(item.is_refunded || 0) === 0
    && ['diterima', 'dicuci'].includes(item.status_laundry)
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [path, setPath] = useState(() => window.location.pathname);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    api('/auth/me')
      .then((data) => {
        setUser(data.user);
        setCsrfToken(data.csrf_token);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('app-sidebar-open', sidebarOpen);
    return () => document.body.classList.remove('app-sidebar-open');
  }, [sidebarOpen]);

  function navigate(pathname) {
    window.history.pushState({}, '', pathname);
    setPath(pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showNotice(type, message) {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 4200);
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    setUser(null);
    setView('dashboard');
    setSidebarOpen(false);
  }

  function toggleSidebar() {
    if (window.matchMedia('(max-width: 760px)').matches) {
      setSidebarOpen(true);
      return;
    }

    setSidebarCollapsed((value) => !value);
  }

  function selectView(nextView) {
    setView(nextView);
    setSidebarOpen(false);
  }

  if (path === '/') {
    return <HomePage onLoginClick={() => navigate('/login')} />;
  }

  if (loading) {
    return <div className="boot-screen">Memuat Inaton Laundry...</div>;
  }

  if (!user) {
    return <Login onLogin={setUser} showNotice={showNotice} notice={notice} onHomeClick={() => navigate('/')} />;
  }

  if (user.force_password_change) {
    return <ChangePassword onDone={setUser} user={user} showNotice={showNotice} notice={notice} />;
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <button
        type="button"
        className={`app-sidebar-backdrop ${sidebarOpen ? 'open' : ''}`}
        aria-label="Tutup menu dashboard"
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Navigasi dashboard">
        <div className="sidebar-head">
          <div className="brand">
            <div className="brand-mark">
              <img src={logoSrc} alt="Inaton Laundry" />
            </div>
            <div>
              <strong>Inaton</strong>
              <span>Laundry System</span>
            </div>
          </div>
          <button type="button" className="sidebar-close" aria-label="Tutup menu dashboard" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <nav>
          {menu
            .filter((item) => item.roles.includes(user.role))
            .map((item) => (
              <button
                key={item.id}
                className={`nav-item ${view === item.id ? 'active' : ''}`}
                onClick={() => selectView(item.id)}
                title={item.label}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
        </nav>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-heading">
            <button
              className="dashboard-menu-button icon-button"
              type="button"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? 'Perluas menu dashboard' : 'Buka menu dashboard'}
              aria-expanded={sidebarOpen || !sidebarCollapsed}
              title={sidebarCollapsed ? 'Perluas menu' : 'Menu'}
            >
              <MenuIcon size={20} />
            </button>
            <div>
              <p className="eyebrow">Role {user.role}</p>
              <h1>{menu.find((item) => item.id === view)?.label || 'Dashboard'}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="user-chip">{user.nama}</div>
            <button className="icon-button" onClick={logout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        {notice && <div className={`notice ${notice.type}`}>{notice.message}</div>}
        <ViewRouter view={view} user={user} showNotice={showNotice} />
      </main>
    </div>
  );
}

function Login({ onLogin, showNotice, notice, onHomeClick }) {
  const [form, setForm] = useState({ username: 'owner', password: 'owner123' });
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const data = await api('/auth/login', { method: 'POST', body: form });
      onLogin(data.user);
    } catch (error) {
      showNotice('danger', error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-panel" onSubmit={submit}>
        <div className="brand login-brand">
          <div className="brand-mark">
            <img src={logoSrc} alt="Inaton Laundry" />
          </div>
          <div>
            <strong>Inaton Laundry</strong>
            <span>Operasional MVP</span>
          </div>
        </div>
        {notice && <div className={`notice ${notice.type}`}>{notice.message}</div>}
        <label>
          Username
          <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </label>
        <button className="primary-button" disabled={busy}>
          {busy ? 'Memproses...' : 'Login'}
        </button>
        <button type="button" className="secondary-button" onClick={onHomeClick}>
          Kembali ke Homepage
        </button>
        <div className="login-hints">
          <span>owner / owner123</span>
          <span>admin / admin123</span>
          <span>customer / Admin123@</span>
        </div>
      </form>
    </div>
  );
}

function ChangePassword({ onDone, user, showNotice, notice }) {
  const [form, setForm] = useState({ current_password: '', new_password: '' });

  async function submit(event) {
    event.preventDefault();
    try {
      await api('/auth/change-password', { method: 'POST', body: form });
      onDone({ ...user, force_password_change: false });
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-panel" onSubmit={submit}>
        <h1>Ganti Password</h1>
        {notice && <div className={`notice ${notice.type}`}>{notice.message}</div>}
        <label>
          Password saat ini
          <input
            type="password"
            value={form.current_password}
            onChange={(event) => setForm({ ...form, current_password: event.target.value })}
          />
        </label>
        <label>
          Password baru
          <input
            type="password"
            value={form.new_password}
            onChange={(event) => setForm({ ...form, new_password: event.target.value })}
          />
        </label>
        <button className="primary-button">Simpan Password</button>
      </form>
    </div>
  );
}

function HomePage({ onLoginClick }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('home-drawer-open', drawerOpen);
    return () => document.body.classList.remove('home-drawer-open');
  }, [drawerOpen]);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function handleLoginClick() {
    closeDrawer();
    onLoginClick();
  }

  return (
    <div className="home-page">
      <header className="home-nav">
        <a className="home-brand" href="/">
          <span className="home-brand-mark">
            <img src={logoSrc} alt="Inaton Laundry" />
          </span>
          <span>
            <strong>Inaton Laundry</strong>
            <small>Express Jatinangor</small>
          </span>
        </a>
        <button
          type="button"
          className="home-menu-toggle"
          aria-controls="home-drawer"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon size={20} />
          Menu
        </button>
      </header>
      <button
        type="button"
        className={`home-drawer-backdrop ${drawerOpen ? 'open' : ''}`}
        aria-label="Tutup menu"
        onClick={closeDrawer}
      />
      <aside id="home-drawer" className={`home-drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
        <div className="home-drawer-head">
          <div className="home-brand">
            <span className="home-brand-mark">
              <img src={logoSrc} alt="Inaton Laundry" />
            </span>
            <span>
              <strong>Inaton Laundry</strong>
              <small>Express Jatinangor</small>
            </span>
          </div>
          <button type="button" className="home-drawer-close" aria-label="Tutup menu" onClick={closeDrawer}>
            <X size={20} />
          </button>
        </div>
        <nav aria-label="Navigasi homepage">
          {homeNavItems.map(({ href, label, icon: Icon, external }) => (
            <a
              key={label}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noreferrer' : undefined}
              onClick={closeDrawer}
            >
              <Icon size={18} />
              <span>{label}</span>
            </a>
          ))}
          <button type="button" onClick={handleLoginClick}>
            <Users size={18} />
            <span>Login Member</span>
          </button>
        </nav>
        <div className="home-drawer-cta">
          <p>Siap daftar member dan cek benefit saldo anti hangus?</p>
          <a href={whatsappLink} target="_blank" rel="noreferrer" onClick={closeDrawer}>
            Daftar via WhatsApp
          </a>
        </div>
      </aside>

      <main>
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="home-kicker">Inaton Laundry Jatinangor</p>
            <h1>Laundry Cepat, Praktis, dan Lebih Hemat dengan Membership Inaton Laundry</h1>
            <p>
              Saldo Anti Hangus, Benefit Member hingga Rp100.000, dan akses ke seluruh layanan laundry mulai dari
              Super Prioritas 1-2 Jam hingga Reguler 3 Hari.
            </p>
            <div className="home-actions">
              <a className="home-button primary" href={whatsappLink} target="_blank" rel="noreferrer">
                Daftar Member
              </a>
              <a className="home-button secondary" href="#membership">
                Cek Benefit
              </a>
            </div>
            <div className="home-proof-row">
              <span><CheckCircle2 size={16} /> Saldo anti hangus</span>
              <span><Timer size={16} /> Estimasi mulai 1-2 jam</span>
              <span><MapPin size={16} /> Area kampus Jatinangor</span>
            </div>
          </div>
          <div className="home-hero-media" aria-label="Foto laundry bersih dan profesional">
            <img src={homeImages.hero} alt="Laundry bersih dengan pakaian terlipat" />
            <div className="home-floating-card">
              <strong>3 Jam Beres</strong>
              <span>Opsi prioritas untuk kebutuhan mendadak.</span>
            </div>
          </div>
        </section>

        <section className="home-section" aria-labelledby="why-title">
          <div className="home-section-heading">
            <p className="home-kicker">Kenapa Inaton Laundry?</p>
            <h2 id="why-title">Praktis untuk anak kos, mahasiswa, dan warga Jatinangor.</h2>
          </div>
          <div className="home-reason-grid">
            {homeReasons.map(({ icon: Icon, title, text }) => (
              <article className="home-reason" key={title}>
                <div className="home-icon">
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section" id="layanan" aria-labelledby="services-title">
          <div className="home-section-heading split">
            <div>
              <p className="home-kicker">Pilihan Layanan</p>
              <h2 id="services-title">Pilih layanan sesuai kebutuhan cucianmu.</h2>
            </div>
            <a className="home-text-link" href="#kecepatan">Lihat Detail</a>
          </div>
          <div className="home-service-grid">
            {homeServices.map((service) => (
              <article className="home-service-card" key={service.title}>
                <img src={service.image} alt={service.title} />
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <a href="#kecepatan">Lihat Detail</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section home-speed-section" id="kecepatan" aria-labelledby="speed-title">
          <div className="home-speed-copy">
            <p className="home-kicker">Pilihan Kecepatan Pengerjaan</p>
            <h2 id="speed-title">Butuh Cepat? Kami Punya Solusinya.</h2>
            <p>
              Dari kebutuhan super cepat sampai cucian reguler, estimasi dibuat jelas supaya kamu bisa pilih yang paling
              pas.
            </p>
          </div>
          <div className="home-speed-table" role="table" aria-label="Estimasi pengerjaan laundry">
            <div className="home-speed-row header" role="row">
              <span role="columnheader">Layanan</span>
              <span role="columnheader">Estimasi</span>
            </div>
            {speedOptions.map(([name, estimate]) => (
              <div className="home-speed-row" role="row" key={name}>
                <span role="cell">{name}</span>
                <strong role="cell">{estimate}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="home-membership" id="membership" aria-labelledby="membership-title">
          <div className="home-membership-copy">
            <p className="home-kicker light">Membership Inaton Laundry</p>
            <h2 id="membership-title">Semakin Besar Top Up, Semakin Besar Benefit yang Didapat.</h2>
            <p>
              Saldo member anti hangus dan bisa dipakai untuk layanan reguler, express, same day, sampai prioritas.
            </p>
            <a className="home-button light" href={whatsappLink} target="_blank" rel="noreferrer">
              Daftar Member
            </a>
          </div>
          <div className="home-plan-table" role="table" aria-label="Paket benefit membership">
            <div className="home-plan-row header" role="row">
              <span role="columnheader">Top Up Saldo</span>
              <span role="columnheader">Benefit Member</span>
              <span role="columnheader">Total Saldo</span>
            </div>
            {membershipPlans.map(([topup, benefit, total]) => (
              <div className="home-plan-row" role="row" key={topup}>
                <span role="cell">{topup}</span>
                <strong role="cell">{benefit}</strong>
                <strong role="cell">{total}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="home-section" aria-labelledby="steps-title">
          <div className="home-section-heading">
            <p className="home-kicker">Cara Kerja Membership</p>
            <h2 id="steps-title">Empat langkah simpel untuk mulai hemat.</h2>
          </div>
          <div className="home-step-grid">
            {membershipSteps.map((step, index) => (
              <article className="home-step" key={step}>
                <span>{index + 1}</span>
                <h3>{step}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section home-testimonials" aria-labelledby="testimonials-title">
          <div className="home-section-heading split">
            <div>
              <p className="home-kicker">Testimoni</p>
              <h2 id="testimonials-title">Customer bilang cepat, bersih, dan wangi.</h2>
            </div>
            <a className="home-text-link" href={mapsLink} target="_blank" rel="noreferrer">Lihat Google Maps</a>
          </div>
          <div className="home-review-grid">
            {testimonials.map((item) => (
              <article className="home-review" key={item.name}>
                <div className="home-review-head">
                  <div className="home-avatar">{item.name.charAt(0)}</div>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.meta}</p>
                  </div>
                </div>
                <div className="home-stars" aria-label="5 bintang">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={18} fill="currentColor" />
                  ))}
                </div>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section" id="faq" aria-labelledby="faq-title">
          <div className="home-section-heading">
            <p className="home-kicker">FAQ</p>
            <h2 id="faq-title">Pertanyaan yang sering ditanyakan.</h2>
          </div>
          <div className="home-faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="home-final-cta" aria-labelledby="final-cta-title">
          <p className="home-kicker light">Membership Inaton Laundry</p>
          <h2 id="final-cta-title">Siap Merasakan Laundry yang Lebih Praktis?</h2>
          <p>Bergabung menjadi member Inaton Laundry dan nikmati berbagai keuntungan eksklusif.</p>
          <div className="home-actions center">
            <a className="home-button light" href={whatsappLink} target="_blank" rel="noreferrer">
              Daftar Member Sekarang
            </a>
            <a className="home-button outline-light" href={mapsLink} target="_blank" rel="noreferrer">
              Lihat Lokasi
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

function ViewRouter({ view, user, showNotice }) {
  if (view === 'members') return <MembersPage showNotice={showNotice} />;
  if (view === 'services') return <ServicesPage showNotice={showNotice} />;
  if (view === 'topups' || view === 'topup-history') return <TopupsPage user={user} showNotice={showNotice} />;
  if (view === 'transactions' || view === 'transaction-history') return <TransactionsPage user={user} showNotice={showNotice} />;
  if (view === 'status-laundry' || view === 'orders') return <StatusLaundryPage user={user} showNotice={showNotice} />;
  if (view === 'mutations') return <MutationsPage showNotice={showNotice} />;
  if (view === 'balance') return <BalancePage showNotice={showNotice} />;
  if (view === 'reports') return <ReportsPage user={user} showNotice={showNotice} />;
  if (view === 'audit') return <AuditPage showNotice={showNotice} />;
  if (view === 'settings') return <SettingsPage showNotice={showNotice} />;
  if (view === 'balance-self') return <MyBalancePage showNotice={showNotice} />;
  if (view === 'profile') return <ProfilePage showNotice={showNotice} />;
  return <Dashboard user={user} showNotice={showNotice} />;
}

function Dashboard({ user, showNotice }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/dashboard').then(setData).catch((error) => showNotice('danger', error.message));
  }, [showNotice]);

  if (!data) return <EmptyState label="Memuat dashboard..." />;

  if (user.role === 'customer') {
    return (
      <section className="content-stack">
        <div className="stats-grid">
          <StatCard icon={WalletCards} label="Saldo Saya" value={rupiah(data.saldo)} />
          <StatCard icon={PackageCheck} label="Pesanan Terakhir" value={data.recent_transactions?.length || 0} />
        </div>
        <DataPanel title="Riwayat terbaru">
          <SimpleTable
            columns={['Kode', 'Total', 'Bayar', 'Laundry', 'Tanggal']}
            rows={(data.recent_transactions || []).map((item) => [
              item.kode_transaksi,
              rupiah(item.total_harga),
              <Badge key="pay" label={item.status_pembayaran} />,
              <Badge key="laundry" label={item.status_laundry} />,
              item.tanggal_masuk,
            ])}
          />
        </DataPanel>
      </section>
    );
  }

  return (
    <section className="stats-grid">
      <StatCard icon={Users} label="Total Member" value={data.members} />
      <StatCard icon={PackageCheck} label="Order Aktif" value={data.active_orders} />
      <StatCard icon={FileClock} label="Transaksi Hari Ini" value={data.today_transactions} />
      <StatCard icon={Banknote} label="Omzet Hari Ini" value={rupiah(data.today_revenue)} />
    </section>
  );
}

function MembersPage({ showNotice }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ nama: '', no_hp: '', alamat: '', username: '', password: 'member123' });
  const [temporary, setTemporary] = useState(null);

  async function load() {
    const data = await api('/members');
    setItems(data.items || []);
  }

  useEffect(() => {
    load().catch((error) => showNotice('danger', error.message));
  }, [showNotice]);

  async function create(event) {
    event.preventDefault();
    try {
      await api('/members', { method: 'POST', body: form });
      setForm({ nama: '', no_hp: '', alamat: '', username: '', password: 'member123' });
      showNotice('success', 'Member berhasil dibuat.');
      await load();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  async function resetPassword(id) {
    try {
      const data = await api(`/members/${id}/reset-password`, { method: 'POST' });
      setTemporary(data.temporary_password);
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  async function editMember(member) {
    const nama = window.prompt('Nama member', member.nama);
    if (nama === null) return;
    const no_hp = window.prompt('Nomor HP', member.no_hp);
    if (no_hp === null) return;
    const alamat = window.prompt('Alamat', member.alamat || '');
    if (alamat === null) return;
    try {
      await api(`/members/${member.id_member}`, { method: 'PUT', body: { nama, no_hp, alamat } });
      showNotice('success', 'Member berhasil diperbarui.');
      await load();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  async function toggleMember(member) {
    const status = member.status === 'aktif' ? 'nonaktif' : 'aktif';
    try {
      await api(`/members/${member.id_member}/status`, { method: 'PATCH', body: { status } });
      showNotice('success', 'Status member diperbarui.');
      await load();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  async function editService(service) {
    const nama_layanan = window.prompt('Nama layanan', service.nama_layanan);
    if (nama_layanan === null) return;
    const harga = window.prompt('Harga', service.harga);
    if (harga === null) return;
    const estimasi_hari = window.prompt('Estimasi hari', service.estimasi_hari);
    if (estimasi_hari === null) return;
    try {
      await api(`/services/${service.id_layanan}`, {
        method: 'PUT',
        body: {
          nama_layanan,
          satuan: service.satuan,
          harga: Number(harga),
          estimasi_hari: Number(estimasi_hari),
          status: service.status,
        },
      });
      showNotice('success', 'Layanan berhasil diperbarui.');
      await load();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  async function toggleService(service) {
    try {
      await api(`/services/${service.id_layanan}`, {
        method: 'PUT',
        body: {
          ...service,
          status: service.status === 'aktif' ? 'nonaktif' : 'aktif',
        },
      });
      showNotice('success', 'Status layanan diperbarui.');
      await load();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  return (
    <section className="split-layout">
      <DataPanel title="Tambah Member">
        <form className="form-grid" onSubmit={create}>
          <input placeholder="Nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          <input placeholder="Nomor HP" value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} />
          <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input placeholder="Password awal" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <textarea placeholder="Alamat" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
          <button className="primary-button">
            <Plus size={16} /> Tambah
          </button>
        </form>
        {temporary && <div className="notice warning">Password sementara: {temporary}</div>}
      </DataPanel>
      <DataPanel title="Data Member">
        <SimpleTable
          columns={['Kode', 'Nama', 'HP', 'Saldo', 'Status', 'Aksi']}
          rows={items.map((item) => [
            item.kode_member,
            item.nama,
            item.no_hp,
            rupiah(item.saldo),
            <Badge key="status" label={item.status} />,
            <div key="actions" className="table-actions">
              <button className="small-button" onClick={() => editMember(item)}>Edit</button>
              <button className="small-button" onClick={() => toggleMember(item)}>
                {item.status === 'aktif' ? 'Nonaktif' : 'Aktif'}
              </button>
              <button className="small-button" onClick={() => resetPassword(item.id_member)}>Reset</button>
            </div>,
          ])}
        />
      </DataPanel>
    </section>
  );
}

function ServicesPage({ showNotice }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ nama_layanan: '', satuan: 'kg', harga: '', estimasi_hari: 2, status: 'aktif' });

  async function load() {
    const data = await api('/services');
    setItems(data.items || []);
  }

  useEffect(() => {
    load().catch((error) => showNotice('danger', error.message));
  }, [showNotice]);

  async function create(event) {
    event.preventDefault();
    try {
      await api('/services', { method: 'POST', body: { ...form, harga: Number(form.harga) } });
      setForm({ nama_layanan: '', satuan: 'kg', harga: '', estimasi_hari: 2, status: 'aktif' });
      showNotice('success', 'Layanan berhasil dibuat.');
      await load();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  return (
    <section className="split-layout">
      <DataPanel title="Tambah Layanan">
        <form className="form-grid" onSubmit={create}>
          <input placeholder="Nama layanan" value={form.nama_layanan} onChange={(e) => setForm({ ...form, nama_layanan: e.target.value })} />
          <select value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })}>
            <option value="kg">Per kg</option>
            <option value="item">Per item</option>
            <option value="pasang">Per pasang</option>
          </select>
          <input placeholder="Harga" type="number" value={form.harga} onChange={(e) => setForm({ ...form, harga: e.target.value })} />
          <input type="number" value={form.estimasi_hari} onChange={(e) => setForm({ ...form, estimasi_hari: Number(e.target.value) })} />
          <button className="primary-button">
            <Plus size={16} /> Tambah
          </button>
        </form>
      </DataPanel>
      <DataPanel title="Data Layanan">
        <SimpleTable
          columns={['Layanan', 'Satuan', 'Harga', 'Estimasi', 'Status', 'Aksi']}
          rows={items.map((item) => [
            item.nama_layanan,
            item.satuan,
            rupiah(item.harga),
            `${item.estimasi_hari} hari`,
            <Badge key="status" label={item.status} />,
            <div key="actions" className="table-actions">
              <button className="small-button" onClick={() => editService(item)}>Edit</button>
              <button className="small-button" onClick={() => toggleService(item)}>
                {item.status === 'aktif' ? 'Nonaktif' : 'Aktif'}
              </button>
            </div>,
          ])}
        />
      </DataPanel>
    </section>
  );
}

function TopupsPage({ user, showNotice }) {
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ id_member: '', nominal: '', metode_pembayaran: 'qris_statis', nomor_referensi: '', catatan: '' });
  const [newProofFile, setNewProofFile] = useState(null);
  const [proofFiles, setProofFiles] = useState({});
  const [selectedTopup, setSelectedTopup] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  async function load() {
    const data = await api('/topups');
    setItems(data.items || []);
    const memberData = await api('/members');
    setMembers(memberData.items || []);
  }

  useEffect(() => {
    load().catch((error) => showNotice('danger', error.message));
  }, [showNotice, user.role]);

  function requestCreate(event) {
    event.preventDefault();
    const isCustomer = user.role === 'customer';
    const member = isCustomer
      ? (members[0] || { kode_member: 'Akun saya', nama: user.nama })
      : members.find((item) => String(item.id_member) === String(form.id_member));
    const nominal = Number(form.nominal);
    if (!member || (!isCustomer && !form.id_member) || nominal <= 0) {
      showNotice('danger', 'Pilih member dan isi nominal top up.');
      return;
    }
    if (isCustomer && !newProofFile) {
      showNotice('danger', 'Upload bukti pembayaran dulu.');
      return;
    }
    setConfirmation({
      action: 'create',
      payload: {
        ...form,
        id_member: isCustomer ? undefined : form.id_member,
        metode_pembayaran: isCustomer ? 'qris_statis' : form.metode_pembayaran,
        nominal,
      },
      proofFile: isCustomer ? newProofFile : null,
      title: 'Konfirmasi Top Up',
      message: isCustomer
        ? 'Top up akan masuk sebagai pending dan menunggu verifikasi admin.'
        : 'Pastikan data top up sudah sesuai sebelum disimpan sebagai pending.',
      confirmLabel: isCustomer ? 'Ajukan Top Up' : 'Catat Top Up',
      details: [
        ['Member', `${member.kode_member} - ${member.nama}`],
        ['Metode Pembayaran', paymentMethodLabel(isCustomer ? 'qris_statis' : form.metode_pembayaran)],
        ['Nominal', rupiah(nominal)],
        ['Referensi', form.nomor_referensi || '-'],
        ['Bukti Pembayaran', isCustomer ? newProofFile?.name : 'Upload setelah dicatat'],
        ['Status Awal', <Badge label="pending" />],
      ],
    });
  }

  async function createTopup(payload, proofFile = null) {
    try {
      const created = await api('/topups', { method: 'POST', body: payload });
      if (proofFile) {
        const proof = new FormData();
        proof.append('bukti', proofFile);
        await apiForm(`/topups/${created.id_topup}/proof`, proof);
      }
      setForm({ id_member: '', nominal: '', metode_pembayaran: 'qris_statis', nomor_referensi: '', catatan: '' });
      setNewProofFile(null);
      showNotice('success', proofFile ? 'Top up diajukan dan bukti berhasil diupload.' : 'Top up pending dibuat.');
      await load();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  function requestApprove(item) {
    if (!item.bukti_pembayaran) {
      showNotice('danger', 'Bukti pembayaran wajib diupload sebelum approve.');
      return;
    }
    const before = Number(item.saldo_member || 0);
    const after = before + Number(item.nominal || 0);
    setConfirmation({
      action: 'approve',
      item,
      title: 'Approve Top Up',
      message: 'Saldo member akan berubah setelah top up disetujui.',
      confirmLabel: 'Approve',
      details: [
        ['Kode', item.kode_topup],
        ['Member', item.nama_member || '-'],
        ['Nominal', rupiah(item.nominal)],
        ['Saldo Sebelum', rupiah(before)],
        ['Saldo Sesudah', rupiah(after)],
        ['Bukti', item.bukti_pembayaran || '-'],
      ],
    });
  }

  async function approve(id) {
    try {
      await api(`/topups/${id}/approve`, { method: 'PATCH', body: {} });
      showNotice('success', 'Top up disetujui.');
      await load();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  async function uploadProof(id) {
    const file = proofFiles[id];
    if (!file) {
      showNotice('danger', 'Pilih file bukti pembayaran dulu.');
      return;
    }
    const data = new FormData();
    data.append('bukti', file);
    try {
      await apiForm(`/topups/${id}/proof`, data);
      showNotice('success', 'Bukti pembayaran berhasil diupload.');
      setProofFiles({ ...proofFiles, [id]: null });
      await load();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  function requestReject(item) {
    setConfirmation({
      action: 'reject',
      item,
      reason: '',
      title: 'Reject Top Up',
      message: 'Top up akan ditolak dan saldo member tidak berubah.',
      confirmLabel: 'Reject',
      danger: true,
      reasonLabel: 'Alasan penolakan',
      details: [
        ['Kode', item.kode_topup],
        ['Member', item.nama_member || '-'],
        ['Nominal', rupiah(item.nominal)],
        ['Status', <Badge label={item.status} />],
      ],
    });
  }

  async function reject(id, reason) {
    try {
      await api(`/topups/${id}/reject`, { method: 'PATCH', body: { reason } });
      showNotice('success', 'Top up ditolak.');
      await load();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  async function confirmTopupAction() {
    if (!confirmation) return;
    const current = confirmation;
    if (current.action === 'reject' && String(current.reason || '').trim().length < 5) {
      showNotice('danger', 'Alasan penolakan minimal 5 karakter.');
      return;
    }
    setConfirmation(null);
    if (current.action === 'create') {
      await createTopup(current.payload, current.proofFile);
    }
    if (current.action === 'approve') {
      await approve(current.item.id_topup);
    }
    if (current.action === 'reject') {
      await reject(current.item.id_topup, current.reason);
    }
  }

  return (
    <section className="content-stack">
      <QrisPanel />
      <DataPanel title={user.role === 'customer' ? 'Ajukan Top Up' : 'Catat Top Up'}>
          <form className="form-grid wide" onSubmit={requestCreate}>
            {user.role !== 'customer' && (
              <select value={form.id_member} onChange={(e) => setForm({ ...form, id_member: e.target.value })}>
                <option value="">Pilih member</option>
                {members.map((member) => (
                  <option key={member.id_member} value={member.id_member}>
                    {member.kode_member} - {member.nama}
                  </option>
                ))}
              </select>
            )}
            <input placeholder="Nominal" type="number" value={form.nominal} onChange={(e) => setForm({ ...form, nominal: e.target.value })} />
            {user.role === 'customer' ? (
              <input value="QRIS Statis" disabled />
            ) : (
              <select value={form.metode_pembayaran} onChange={(e) => setForm({ ...form, metode_pembayaran: e.target.value })}>
                {topupPaymentMethods.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            )}
            <input placeholder="Referensi" value={form.nomor_referensi} onChange={(e) => setForm({ ...form, nomor_referensi: e.target.value })} />
            {user.role === 'customer' && (
              <input
                className="file-input wide"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(event) => setNewProofFile(event.target.files?.[0] || null)}
              />
            )}
            <textarea placeholder="Catatan" value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
            <button className="primary-button">
              <Plus size={16} /> {user.role === 'customer' ? 'Ajukan' : 'Simpan'}
            </button>
          </form>
      </DataPanel>
      <DataPanel title="Riwayat Top Up">
        <SimpleTable
          columns={['Kode', 'Member', 'Nominal', 'Bukti', 'Status', 'Tanggal', 'Aksi']}
          rows={items.map((item) => [
            item.kode_topup,
            item.nama_member || '-',
            rupiah(item.nominal),
            item.bukti_pembayaran ? 'Ada' : 'Belum',
            <Badge key="status" label={item.status} />,
            item.created_at,
            <div key="actions" className="table-actions">
              <button className="small-button" onClick={() => setSelectedTopup(item)}>Detail</button>
              {item.status === 'pending' && (
                <>
                  <input
                    className="file-input"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(event) => setProofFiles({ ...proofFiles, [item.id_topup]: event.target.files?.[0] || null })}
                  />
                  <button className="small-button" onClick={() => uploadProof(item.id_topup)}>
                    Upload
                  </button>
                  {user.role !== 'customer' && (
                    <>
                      <button className="small-button success" onClick={() => requestApprove(item)}>
                        Approve
                      </button>
                      <button className="small-button danger" onClick={() => requestReject(item)}>
                        Reject
                      </button>
                    </>
                  )}
                </>
              )}
            </div>,
          ])}
        />
      </DataPanel>
      {selectedTopup && (
        <DataPanel title="Detail Top Up">
          <dl className="detail-grid">
            <div>
              <dt>Kode</dt>
              <dd>{selectedTopup.kode_topup}</dd>
            </div>
            <div>
              <dt>Member</dt>
              <dd>{selectedTopup.nama_member || '-'}</dd>
            </div>
            <div>
              <dt>Nominal</dt>
              <dd>{rupiah(selectedTopup.nominal)}</dd>
            </div>
            <div>
              <dt>Metode</dt>
              <dd>{paymentMethodLabel(selectedTopup.metode_pembayaran)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd><Badge label={selectedTopup.status} /></dd>
            </div>
            <div>
              <dt>Referensi</dt>
              <dd>{selectedTopup.nomor_referensi || '-'}</dd>
            </div>
            <div>
              <dt>Bukti Pembayaran</dt>
              <dd>{selectedTopup.bukti_pembayaran || 'Belum ada bukti'}</dd>
            </div>
            <div>
              <dt>Alasan Reject</dt>
              <dd>{selectedTopup.rejected_reason || '-'}</dd>
            </div>
            <div>
              <dt>Dibuat</dt>
              <dd>{selectedTopup.created_at}</dd>
            </div>
          </dl>
        </DataPanel>
      )}
      {confirmation && (
        <ConfirmDialog
          title={confirmation.title}
          message={confirmation.message}
          details={confirmation.details}
          confirmLabel={confirmation.confirmLabel}
          danger={confirmation.danger}
          reasonLabel={confirmation.reasonLabel}
          reasonValue={confirmation.reason || ''}
          onReasonChange={(reason) => setConfirmation({ ...confirmation, reason })}
          onCancel={() => setConfirmation(null)}
          onConfirm={confirmTopupAction}
        />
      )}
    </section>
  );
}

function QrisPanel() {
  return (
    <DataPanel title="QRIS Statis Inaton">
      <div className="qris-panel">
        <div className="qris-copy">
          <span className="eyebrow">INATON LAUNDRY JATINANGOR</span>
          <h3>Scan QRIS untuk top up saldo member</h3>
          <p>NMID: ID1026487678579</p>
          <p>Satu QRIS untuk semua pembayaran manual. Setelah bayar, simpan bukti pembayaran untuk diverifikasi kasir.</p>
        </div>
        <a className="qris-frame" href={qrisSrc} target="_blank" rel="noreferrer" title="Buka QRIS Inaton Laundry">
          <img src={qrisSrc} alt="QRIS Inaton Laundry Jatinangor" />
        </a>
      </div>
    </DataPanel>
  );
}

function TransactionsPage({ user, showNotice }) {
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    id_member: '',
    metode_pembayaran: 'cash',
    status_pembayaran: 'lunas',
    catatan: '',
    items: [{ id_layanan: '', berat_jumlah: 1 }],
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [refundConfirmation, setRefundConfirmation] = useState(null);

  async function load() {
    const data = await api('/transactions');
    setItems(data.items || []);
    const serviceData = await api('/services');
    setServices(serviceData.items || []);
    if (user.role !== 'customer') {
      const memberData = await api('/members');
      setMembers(memberData.items || []);
    }
  }

  useEffect(() => {
    load().catch((error) => showNotice('danger', error.message));
  }, [showNotice, user.role]);

  const totalPreview = useMemo(() => {
    return form.items.reduce((sum, row) => {
      const service = services.find((item) => String(item.id_layanan) === String(row.id_layanan));
      return sum + Number(service?.harga || 0) * Number(row.berat_jumlah || 0);
    }, 0);
  }, [form.items, services]);

  function updateRow(index, patch) {
    setForm({
      ...form,
      items: form.items.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    });
  }

  async function create(event) {
    event.preventDefault();
    try {
      await api('/transactions', {
        method: 'POST',
        body: {
          ...form,
          items: form.items.map((row) => ({ ...row, berat_jumlah: Number(row.berat_jumlah) })),
        },
      });
      showNotice('success', 'Transaksi berhasil dibuat.');
      setForm({ id_member: '', metode_pembayaran: 'cash', status_pembayaran: 'lunas', catatan: '', items: [{ id_layanan: '', berat_jumlah: 1 }] });
      await load();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  async function updateStatus(item, status) {
    const currentIndex = laundryStatuses.indexOf(item.status_laundry);
    const nextIndex = laundryStatuses.indexOf(status);
    let catatan = '';
    if (user.role === 'owner' && nextIndex < currentIndex) {
      catatan = window.prompt('Alasan koreksi status minimal 10 karakter') || '';
    }
    try {
      await api(`/transactions/${item.id_transaksi}/status`, { method: 'PATCH', body: { status_laundry: status, catatan } });
      showNotice('success', 'Status laundry diperbarui.');
      await load();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  async function updatePayment(item, status) {
    try {
      await api(`/transactions/${item.id_transaksi}/payment`, { method: 'PATCH', body: { status_pembayaran: status } });
      showNotice('success', 'Status pembayaran diperbarui.');
      await load();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  async function loadTransactionDetail(id) {
    try {
      const data = await api(`/transactions/${id}`);
      setSelectedTransaction(data);
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  async function printReceipt(id) {
    try {
      const data = await api(`/transactions/${id}`);
      const { transaction, details, status_logs, laundry } = data;
      const rows = details
        .map(
          (detail) => `
            <tr>
              <td>${detail.nama_layanan}</td>
              <td>${detail.berat_jumlah} ${detail.satuan}</td>
              <td>${rupiah(detail.harga_satuan)}</td>
              <td>${rupiah(detail.subtotal)}</td>
            </tr>`,
        )
        .join('');
      const timeline = status_logs.map((log) => `<li>${log.status_sesudah} - ${log.created_at}</li>`).join('');
      const win = window.open('', '_blank', 'width=760,height=900');
      const printLogo = `${window.location.origin}${logoSrc}`;
      win.document.write(`
        <html>
          <head>
            <title>Nota ${transaction.kode_transaksi}</title>
            <style>
              body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
              h1, h2, p { margin: 0 0 8px; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; }
              th, td { border-bottom: 1px solid #d1d5db; padding: 8px; text-align: left; }
              .total { text-align: right; font-size: 20px; font-weight: 700; margin-top: 16px; }
              .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; margin-top: 18px; }
              .receipt-brand { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
              .receipt-brand img { width: 88px; height: auto; }
              @media print { button { display: none; } }
            </style>
          </head>
          <body>
            <div class="receipt-brand">
              <img src="${printLogo}" alt="Inaton Laundry" />
              <div>
                <h1>${laundry.nama_laundry || 'Inaton Laundry'}</h1>
                <p>${laundry.alamat_laundry || ''}</p>
                <p>${laundry.no_hp_laundry || ''}</p>
              </div>
            </div>
            <hr />
            <h2>Nota ${transaction.kode_transaksi}</h2>
            <div class="meta">
              <div>Member: ${transaction.nama_member}</div>
              <div>HP: ${transaction.no_hp}</div>
              <div>Tanggal masuk: ${transaction.tanggal_masuk}</div>
              <div>Estimasi: ${transaction.estimasi_selesai}</div>
              <div>Pembayaran: ${transaction.metode_pembayaran} / ${transaction.status_pembayaran}</div>
              <div>Status laundry: ${transaction.status_laundry}</div>
            </div>
            <table>
              <thead><tr><th>Layanan</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
            <div class="total">Total ${rupiah(transaction.total_harga)}</div>
            <h2>Timeline</h2>
            <ul>${timeline}</ul>
            <button onclick="window.print()">Print</button>
          </body>
        </html>`);
      win.document.close();
      win.focus();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  function requestRefund(item) {
    if (!canRefundTransaction(item)) {
      showNotice('danger', 'Refund hanya untuk transaksi lunas dengan status diterima atau dicuci dan belum pernah direfund.');
      return;
    }
    setRefundConfirmation({
      item,
      alasan: '',
      details: [
        ['Kode', item.kode_transaksi],
        ['Member', item.nama_member || '-'],
        ['Total Refund', rupiah(item.total_harga)],
        ['Metode Pembayaran', paymentMethodLabel(item.metode_pembayaran)],
        ['Status Laundry', <Badge label={item.status_laundry} />],
      ],
    });
  }

  async function refundConfirmed() {
    const current = refundConfirmation;
    if (!current) return;
    if (current.alasan.trim().length < 10) {
      showNotice('danger', 'Alasan refund minimal 10 karakter.');
      return;
    }
    setRefundConfirmation(null);
    try {
      await api(`/transactions/${current.item.id_transaksi}/refund`, { method: 'POST', body: { alasan: current.alasan } });
      showNotice('success', 'Refund dicatat.');
      await load();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  return (
    <section className="content-stack">
      {user.role !== 'customer' && (
        <DataPanel title="Transaksi Baru">
          <form className="form-grid wide" onSubmit={create}>
            <select value={form.id_member} onChange={(e) => setForm({ ...form, id_member: e.target.value })}>
              <option value="">Pilih member</option>
              {members.map((member) => (
                <option key={member.id_member} value={member.id_member}>
                  {member.kode_member} - {member.nama}
                </option>
              ))}
            </select>
            <select value={form.metode_pembayaran} onChange={(e) => setForm({ ...form, metode_pembayaran: e.target.value })}>
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
              <option value="qris_manual">QRIS Manual</option>
              <option value="saldo">Saldo Member</option>
            </select>
            {form.items.map((row, index) => (
              <div className="service-row" key={index}>
                <select value={row.id_layanan} onChange={(e) => updateRow(index, { id_layanan: e.target.value })}>
                  <option value="">Pilih layanan</option>
                  {services.map((service) => (
                    <option key={service.id_layanan} value={service.id_layanan}>
                      {service.nama_layanan} - {rupiah(service.harga)}
                    </option>
                  ))}
                </select>
                <input type="number" min="0.1" step="0.1" value={row.berat_jumlah} onChange={(e) => updateRow(index, { berat_jumlah: e.target.value })} />
              </div>
            ))}
            <button type="button" className="secondary-button" onClick={() => setForm({ ...form, items: [...form.items, { id_layanan: '', berat_jumlah: 1 }] })}>
              Tambah Layanan
            </button>
            <div className="total-preview">{rupiah(totalPreview)}</div>
            <button className="primary-button">
              <Plus size={16} /> Buat
            </button>
          </form>
        </DataPanel>
      )}
      <DataPanel title="Data Transaksi">
        <SimpleTable
          columns={['Kode', 'Member', 'Total', 'Metode', 'Bayar', 'Laundry', 'Tanggal', 'Aksi']}
          rows={items.map((item) => [
            item.kode_transaksi,
            item.nama_member || '-',
            rupiah(item.total_harga),
            paymentMethodLabel(item.metode_pembayaran),
            <Badge key="pay" label={item.status_pembayaran} />,
            <Badge key="status" label={item.status_laundry} />,
            item.tanggal_masuk,
            <div key="actions" className="table-actions">
              <button className="small-button" onClick={() => loadTransactionDetail(item.id_transaksi)}>Detail</button>
              {user.role !== 'customer' && (
                <>
                  <select value={item.status_laundry} onChange={(e) => updateStatus(item, e.target.value)}>
                    {laundryStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  {item.status_pembayaran === 'belum_bayar' && (
                    <>
                      <button className="small-button success" onClick={() => updatePayment(item, 'lunas')}>Lunas</button>
                      <button className="small-button danger" onClick={() => updatePayment(item, 'dibatalkan')}>Batal</button>
                    </>
                  )}
                  <button className="small-button" onClick={() => printReceipt(item.id_transaksi)}>
                    Nota
                  </button>
                  <button className="small-button danger" disabled={!canRefundTransaction(item)} onClick={() => requestRefund(item)}>
                    Refund
                  </button>
                </>
              )}
            </div>,
          ])}
        />
      </DataPanel>
      {selectedTransaction && (
        <TransactionDetailPanel data={selectedTransaction} />
      )}
      {refundConfirmation && (
        <ConfirmDialog
          title="Konfirmasi Refund"
          message="Refund hanya dicatat sekali. Untuk pembayaran cash, transfer, dan QRIS manual, pengembalian uang dilakukan offline."
          details={refundConfirmation.details}
          confirmLabel="Refund"
          danger
          reasonLabel="Alasan refund"
          reasonValue={refundConfirmation.alasan}
          onReasonChange={(alasan) => setRefundConfirmation({ ...refundConfirmation, alasan })}
          onCancel={() => setRefundConfirmation(null)}
          onConfirm={refundConfirmed}
        />
      )}
    </section>
  );
}

function TransactionDetailPanel({ data }) {
  const { transaction, details = [], status_logs = [] } = data;
  if (!transaction) return null;

  return (
    <DataPanel title="Detail Transaksi">
      <dl className="detail-grid">
        <div>
          <dt>Kode</dt>
          <dd>{transaction.kode_transaksi}</dd>
        </div>
        <div>
          <dt>Member</dt>
          <dd>{transaction.nama_member}</dd>
        </div>
        <div>
          <dt>No HP</dt>
          <dd>{transaction.no_hp || '-'}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{rupiah(transaction.total_harga)}</dd>
        </div>
        <div>
          <dt>Pembayaran</dt>
          <dd><Badge label={transaction.status_pembayaran} /></dd>
        </div>
        <div>
          <dt>Metode</dt>
          <dd>{paymentMethodLabel(transaction.metode_pembayaran)}</dd>
        </div>
        <div>
          <dt>Status Laundry</dt>
          <dd><Badge label={transaction.status_laundry} /></dd>
        </div>
        <div>
          <dt>Tanggal Masuk</dt>
          <dd>{transaction.tanggal_masuk}</dd>
        </div>
        <div>
          <dt>Estimasi</dt>
          <dd>{transaction.estimasi_selesai || '-'}</dd>
        </div>
      </dl>
      <h3 className="section-heading">Detail Layanan</h3>
      <SimpleTable
        columns={['Layanan', 'Qty', 'Harga', 'Subtotal']}
        rows={details.map((detail) => [
          detail.nama_layanan,
          `${detail.berat_jumlah} ${detail.satuan}`,
          rupiah(detail.harga_satuan),
          rupiah(detail.subtotal),
        ])}
      />
      <h3 className="section-heading">Timeline Status</h3>
      <SimpleTable
        columns={['Sebelum', 'Sesudah', 'Petugas', 'Catatan', 'Tanggal']}
        rows={status_logs.map((log) => [
          log.status_sebelum || '-',
          <Badge key="status" label={log.status_sesudah} />,
          log.changed_by_name || '-',
          log.catatan || '-',
          log.created_at,
        ])}
      />
    </DataPanel>
  );
}

function StatusLaundryPage({ user, showNotice }) {
  const [items, setItems] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  async function load() {
    const data = await api('/transactions');
    setItems(data.items || []);
  }

  useEffect(() => {
    load().catch((error) => showNotice('danger', error.message));
  }, [showNotice]);

  async function loadTransactionDetail(id) {
    try {
      const data = await api(`/transactions/${id}`);
      setSelectedTransaction(data);
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  async function updateStatus(item, status) {
    const currentIndex = laundryStatuses.indexOf(item.status_laundry);
    const nextIndex = laundryStatuses.indexOf(status);
    let catatan = '';
    if (user.role === 'owner' && nextIndex < currentIndex) {
      catatan = window.prompt('Alasan koreksi status minimal 10 karakter') || '';
    }
    try {
      await api(`/transactions/${item.id_transaksi}/status`, { method: 'PATCH', body: { status_laundry: status, catatan } });
      showNotice('success', 'Status laundry diperbarui.');
      await load();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  return (
    <section className="content-stack">
      <DataPanel title={user.role === 'customer' ? 'Status Laundry Customer' : 'Status Laundry'}>
        <SimpleTable
          columns={['Kode', 'Member', 'Bayar', 'Status Laundry', 'Estimasi', 'Tanggal', 'Aksi']}
          rows={items.map((item) => [
            item.kode_transaksi,
            item.nama_member || '-',
            <Badge key="pay" label={item.status_pembayaran} />,
            <Badge key="laundry" label={item.status_laundry} />,
            item.estimasi_selesai || '-',
            item.tanggal_masuk,
            <div key="actions" className="table-actions">
              <button className="small-button" onClick={() => loadTransactionDetail(item.id_transaksi)}>Detail</button>
              {user.role !== 'customer' && (
                <select value={item.status_laundry} onChange={(e) => updateStatus(item, e.target.value)}>
                  {laundryStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              )}
            </div>,
          ])}
        />
      </DataPanel>
      {selectedTransaction && <TransactionDetailPanel data={selectedTransaction} />}
    </section>
  );
}

function MutationsPage({ showNotice }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api('/mutations').then((data) => setItems(data.items || [])).catch((error) => showNotice('danger', error.message));
  }, [showNotice]);

  return (
    <DataPanel title="Mutasi Saldo">
      <SimpleTable
        columns={['Member', 'Tipe', 'Arah', 'Nominal', 'Sebelum', 'Sesudah', 'Tanggal']}
        rows={items.map((item) => [
          item.nama_member || item.id_member,
          item.tipe_mutasi,
          <Badge key="arah" label={item.arah} />,
          rupiah(item.nominal),
          rupiah(item.saldo_sebelum),
          rupiah(item.saldo_sesudah),
          item.created_at,
        ])}
      />
    </DataPanel>
  );
}

function MyBalancePage({ showNotice }) {
  const [dashboard, setDashboard] = useState(null);
  const [mutations, setMutations] = useState([]);

  useEffect(() => {
    Promise.all([api('/dashboard'), api('/mutations')])
      .then(([dashboardData, mutationData]) => {
        setDashboard(dashboardData);
        setMutations(mutationData.items || []);
      })
      .catch((error) => showNotice('danger', error.message));
  }, [showNotice]);

  if (!dashboard) return <EmptyState label="Memuat saldo..." />;

  return (
    <section className="content-stack">
      <section className="stats-grid compact">
        <StatCard icon={WalletCards} label="Saldo Saya" value={rupiah(dashboard.saldo)} />
        <StatCard icon={History} label="Mutasi Tercatat" value={mutations.length} />
      </section>
      <DataPanel title="Mutasi Saldo Saya">
        <SimpleTable
          columns={['Tipe', 'Arah', 'Nominal', 'Sebelum', 'Sesudah', 'Tanggal']}
          rows={mutations.slice(0, 10).map((item) => [
            item.tipe_mutasi,
            <Badge key="arah" label={item.arah} />,
            rupiah(item.nominal),
            rupiah(item.saldo_sebelum),
            rupiah(item.saldo_sesudah),
            item.created_at,
          ])}
        />
      </DataPanel>
    </section>
  );
}

function BalancePage({ showNotice }) {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ id_member: '', arah: 'credit', nominal: '', alasan: '' });
  const [confirmation, setConfirmation] = useState(null);

  async function loadMembers() {
    const data = await api('/members');
    setMembers(data.items || []);
  }

  useEffect(() => {
    loadMembers().catch((error) => showNotice('danger', error.message));
  }, [showNotice]);

  function requestCorrection(event) {
    event.preventDefault();
    const member = members.find((item) => String(item.id_member) === String(form.id_member));
    const nominal = Number(form.nominal);
    if (!member || nominal <= 0 || form.alasan.trim().length < 20) {
      showNotice('danger', 'Pilih member, nominal, dan alasan minimal 20 karakter.');
      return;
    }
    const before = Number(member.saldo || 0);
    if (form.arah === 'debit' && nominal > before) {
      showNotice('danger', 'Koreksi debit melebihi saldo member.');
      return;
    }
    const after = form.arah === 'credit' ? before + nominal : before - nominal;
    setConfirmation({
      member,
      payload: { ...form, nominal },
      details: [
        ['Member', `${member.kode_member} - ${member.nama}`],
        ['Arah', <Badge label={form.arah} />],
        ['Nominal', rupiah(nominal)],
        ['Saldo Sebelum', rupiah(before)],
        ['Saldo Sesudah', rupiah(after)],
        ['Alasan', form.alasan],
      ],
    });
  }

  async function submitCorrection() {
    const current = confirmation;
    if (!current) return;
    setConfirmation(null);
    try {
      await api('/balance/corrections', { method: 'POST', body: current.payload });
      setForm({ id_member: '', arah: 'credit', nominal: '', alasan: '' });
      showNotice('success', 'Koreksi saldo berhasil.');
      await loadMembers();
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  return (
    <DataPanel title="Koreksi Saldo Owner">
      <form className="form-grid" onSubmit={requestCorrection}>
        <select value={form.id_member} onChange={(e) => setForm({ ...form, id_member: e.target.value })}>
          <option value="">Pilih member</option>
          {members.map((member) => (
            <option key={member.id_member} value={member.id_member}>
              {member.nama} - {rupiah(member.saldo)}
            </option>
          ))}
        </select>
        <select value={form.arah} onChange={(e) => setForm({ ...form, arah: e.target.value })}>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
        <input type="number" placeholder="Nominal" value={form.nominal} onChange={(e) => setForm({ ...form, nominal: e.target.value })} />
        <textarea placeholder="Alasan minimal 20 karakter" value={form.alasan} onChange={(e) => setForm({ ...form, alasan: e.target.value })} />
        <button className="primary-button">Simpan Koreksi</button>
      </form>
      {confirmation && (
        <ConfirmDialog
          title="Konfirmasi Koreksi Saldo"
          message="Saldo member akan berubah setelah koreksi disimpan."
          details={confirmation.details}
          confirmLabel="Simpan Koreksi"
          danger={confirmation.payload.arah === 'debit'}
          onCancel={() => setConfirmation(null)}
          onConfirm={submitCorrection}
        />
      )}
    </DataPanel>
  );
}

function ProfilePage({ showNotice }) {
  const [member, setMember] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordBusy, setPasswordBusy] = useState(false);

  useEffect(() => {
    api('/members')
      .then((data) => setMember((data.items || [])[0] || null))
      .catch((error) => showNotice('danger', error.message));
  }, [showNotice]);

  async function submitPassword(event) {
    event.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showNotice('danger', 'Konfirmasi password baru belum sama.');
      return;
    }

    setPasswordBusy(true);
    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: {
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        },
      });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      showNotice('success', 'Password berhasil diganti.');
    } catch (error) {
      showNotice('danger', error.message);
    } finally {
      setPasswordBusy(false);
    }
  }

  if (!member) return <EmptyState label="Memuat profil..." />;

  return (
    <section className="content-stack">
      <DataPanel title="Profil Customer">
        <dl className="detail-grid">
          <div>
            <dt>Kode Member</dt>
            <dd>{member.kode_member}</dd>
          </div>
          <div>
            <dt>Nama</dt>
            <dd>{member.nama}</dd>
          </div>
          <div>
            <dt>Nomor HP</dt>
            <dd>{member.no_hp || '-'}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd><Badge label={member.status} /></dd>
          </div>
          <div>
            <dt>Saldo</dt>
            <dd>{rupiah(member.saldo)}</dd>
          </div>
          <div>
            <dt>Alamat</dt>
            <dd>{member.alamat || '-'}</dd>
          </div>
        </dl>
      </DataPanel>

      <DataPanel title="Ganti Password">
        <form className="form-grid wide" onSubmit={submitPassword}>
          <label>
            Password Saat Ini
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })}
              autoComplete="current-password"
              required
            />
          </label>
          <label>
            Password Baru
            <input
              type="password"
              value={passwordForm.new_password}
              onChange={(event) => setPasswordForm({ ...passwordForm, new_password: event.target.value })}
              minLength={8}
              autoComplete="new-password"
              required
            />
          </label>
          <label>
            Konfirmasi Password Baru
            <input
              type="password"
              value={passwordForm.confirm_password}
              onChange={(event) => setPasswordForm({ ...passwordForm, confirm_password: event.target.value })}
              minLength={8}
              autoComplete="new-password"
              required
            />
          </label>
          <button className="primary-button" disabled={passwordBusy}>
            {passwordBusy ? 'Menyimpan...' : 'Simpan Password'}
          </button>
        </form>
      </DataPanel>
    </section>
  );
}

function ReportsPage({ user, showNotice }) {
  const reportTypes = [
    ['transactions', 'Transaksi'],
    ['topups', 'Top Up'],
    ['balances', 'Saldo Member'],
    ['status', 'Status Laundry'],
    ...(user.role === 'owner'
      ? [
          ['mutations', 'Mutasi Saldo'],
          ['corrections', 'Koreksi Saldo'],
          ['audit', 'Audit Log'],
        ]
      : []),
  ];
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState({
    type: 'transactions',
    start_date: '',
    end_date: '',
    member_id: '',
    metode_pembayaran: '',
    status_pembayaran: '',
    status_laundry: '',
    status: '',
  });
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    api('/members').then((data) => setMembers(data.items || [])).catch((error) => showNotice('danger', error.message));
  }, [showNotice]);

  async function load(event) {
    event?.preventDefault();
    try {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '') query.set(key, value);
      });
      const data = await api(`/reports?${query.toString()}`);
      setRows(data.items || []);
      setSummary(data.summary || {});
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const columns = reportColumns(filters.type, rows);

  return (
    <section className="content-stack">
      <DataPanel title="Filter Laporan">
        <form className="report-filters" onSubmit={load}>
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            {reportTypes.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} />
          <input type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} />
          <select value={filters.member_id} onChange={(e) => setFilters({ ...filters, member_id: e.target.value })}>
            <option value="">Semua member</option>
            {members.map((member) => (
              <option key={member.id_member} value={member.id_member}>{member.nama}</option>
            ))}
          </select>
          <select value={filters.metode_pembayaran} onChange={(e) => setFilters({ ...filters, metode_pembayaran: e.target.value })}>
            <option value="">Metode pembayaran</option>
            {reportPaymentMethods.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select value={filters.status_pembayaran} onChange={(e) => setFilters({ ...filters, status_pembayaran: e.target.value })}>
            <option value="">Status bayar</option>
            <option value="belum_bayar">Belum bayar</option>
            <option value="lunas">Lunas</option>
            <option value="direfund">Direfund</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
          <select value={filters.status_laundry} onChange={(e) => setFilters({ ...filters, status_laundry: e.target.value })}>
            <option value="">Status laundry</option>
            {laundryStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">Status top up</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="primary-button">Tampilkan</button>
        </form>
      </DataPanel>
      <section className="stats-grid compact">
        {Object.entries(summary).map(([key, value]) => (
          <StatCard key={key} icon={FileText} label={key.replaceAll('_', ' ')} value={String(key).includes('total') ? rupiah(value) : value} />
        ))}
      </section>
      <DataPanel title="Hasil Laporan">
        <SimpleTable
          columns={columns.length ? columns : ['Data']}
          rows={rows.map((row) => columns.map((key) => formatReportValue(key, row[key])))}
        />
      </DataPanel>
    </section>
  );
}

function SettingsPage({ showNotice }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api('/settings').then((data) => setSettings(data.settings || {})).catch((error) => showNotice('danger', error.message));
  }, [showNotice]);

  async function submit(event) {
    event.preventDefault();
    try {
      const data = await api('/settings', { method: 'PUT', body: { settings } });
      setSettings(data.settings || settings);
      showNotice('success', 'Pengaturan berhasil disimpan.');
    } catch (error) {
      showNotice('danger', error.message);
    }
  }

  if (!settings) return <EmptyState label="Memuat pengaturan..." />;

  return (
    <DataPanel title="Pengaturan Sistem">
      <form className="form-grid wide" onSubmit={submit}>
        <label>
          Minimum Top Up
          <input type="number" value={settings.minimum_topup || ''} onChange={(e) => setSettings({ ...settings, minimum_topup: e.target.value })} />
        </label>
        <label>
          Maksimum Top Up
          <input type="number" value={settings.maximum_topup || ''} onChange={(e) => setSettings({ ...settings, maximum_topup: e.target.value })} />
        </label>
        <label>
          Session Timeout Menit
          <input type="number" value={settings.session_timeout_minutes || ''} onChange={(e) => setSettings({ ...settings, session_timeout_minutes: e.target.value })} />
        </label>
        <label>
          Nama Laundry
          <input value={settings.nama_laundry || ''} onChange={(e) => setSettings({ ...settings, nama_laundry: e.target.value })} />
        </label>
        <label>
          Alamat Laundry
          <textarea value={settings.alamat_laundry || ''} onChange={(e) => setSettings({ ...settings, alamat_laundry: e.target.value })} />
        </label>
        <label>
          Nomor HP Laundry
          <input value={settings.no_hp_laundry || ''} onChange={(e) => setSettings({ ...settings, no_hp_laundry: e.target.value })} />
        </label>
        <button className="primary-button">Simpan Pengaturan</button>
      </form>
    </DataPanel>
  );
}

function AuditPage({ showNotice }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api('/audit').then((data) => setItems(data.items || [])).catch((error) => showNotice('danger', error.message));
  }, [showNotice]);

  return (
    <DataPanel title="Audit Log">
      <SimpleTable
        columns={['Aksi', 'Target', 'Role', 'IP', 'Tanggal']}
        rows={items.map((item) => [item.action, `${item.target_type} #${item.target_id || '-'}`, item.role || '-', item.ip_address || '-', item.created_at])}
      />
    </DataPanel>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DataPanel({ title, children }) {
  return (
    <section className="data-panel">
      <div className="panel-title">
        <h2>{title}</h2>
        <RefreshCw size={16} />
      </div>
      {children}
    </section>
  );
}

function ConfirmDialog({
  title,
  message,
  details = [],
  confirmLabel = 'Konfirmasi',
  danger = false,
  reasonLabel,
  reasonValue = '',
  onReasonChange,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div>
          <p className="eyebrow">Konfirmasi</p>
          <h2 id="confirm-title">{title}</h2>
          {message && <p className="confirm-message">{message}</p>}
        </div>
        {details.length > 0 && (
          <dl className="confirm-details">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
        {reasonLabel && (
          <label>
            {reasonLabel}
            <textarea value={reasonValue} onChange={(event) => onReasonChange?.(event.target.value)} />
          </label>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Batal
          </button>
          <button type="button" className={`primary-button ${danger ? 'danger' : ''}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function SimpleTable({ columns, rows }) {
  if (!rows.length) return <EmptyState label="Belum ada data." />;

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} data-label={columns[cellIndex]}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ label }) {
  return <span className={`badge-soft ${String(label).replaceAll('_', '-')}`}>{label}</span>;
}

function formatReportValue(key, value) {
  if (value === null || value === undefined || value === '') return '-';
  if (['saldo', 'total_harga', 'nominal', 'harga', 'harga_satuan', 'subtotal', 'saldo_sebelum', 'saldo_sesudah', 'nominal_refund'].some((name) => key.includes(name))) {
    return rupiah(value);
  }
  if (key === 'metode_pembayaran') {
    return paymentMethodLabel(value);
  }
  if (String(key).includes('status') || key === 'arah') {
    return <Badge label={value} />;
  }
  return String(value);
}

function reportColumns(type, rows) {
  if (!rows[0]) return [];
  const preferred = {
    transactions: ['kode_transaksi', 'nama_member', 'total_harga', 'metode_pembayaran', 'status_pembayaran', 'status_laundry', 'tanggal_masuk'],
    topups: ['kode_topup', 'nama_member', 'nominal', 'metode_pembayaran', 'status', 'created_at'],
    balances: ['kode_member', 'nama', 'no_hp', 'saldo', 'status'],
    status: ['status_laundry', 'total'],
    mutations: ['kode_member', 'nama_member', 'tipe_mutasi', 'arah', 'nominal', 'saldo_sebelum', 'saldo_sesudah', 'created_at'],
    corrections: ['kode_member', 'nama_member', 'arah', 'nominal', 'saldo_sebelum', 'saldo_sesudah', 'keterangan', 'created_at'],
    audit: ['action', 'target_type', 'target_id', 'role', 'ip_address', 'created_at'],
  };
  const keys = preferred[type] || Object.keys(rows[0]).slice(0, 8);
  return keys.filter((key) => Object.prototype.hasOwnProperty.call(rows[0], key));
}

function EmptyState({ label }) {
  return <div className="empty-state">{label}</div>;
}

export default App;
