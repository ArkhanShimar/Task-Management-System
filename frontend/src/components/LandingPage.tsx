import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, CalendarDays, Check, CheckCircle2, Layers3, Search, ShieldCheck, SlidersHorizontal, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

export function LandingPage() {
  const { token } = useAuth();
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.reveal');
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
    }), { threshold: .14 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const appLink = token ? '/dashboard' : '/login';
  const appLabel = token ? 'Open dashboard' : 'Get started';
  const displayDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return <main className="landing">
    <header className="landing-nav">
      <Link to="/" className="brand"><span className="brand-mark">D</span><span>daymark</span></Link>
      <nav aria-label="Main navigation"><a href="#features">Features</a><a href="#workflow">How it works</a></nav>
      <div className="landing-nav-actions"><ThemeToggle />{!token && <Link className="landing-login" to="/login">Sign in</Link>}<Link className="primary" to={appLink}>{appLabel}<ArrowRight /></Link></div>
    </header>

    <section className="landing-hero">
      <div className="hero-glow hero-glow-one" /><div className="hero-glow hero-glow-two" />
      <div className="hero-copy">
        <span className="hero-badge"><Sparkles />Thoughtful planning, minus the noise</span>
        <h1>Make room for<br /><em>what matters.</em></h1>
        <p>Daymark turns a crowded list into a calm, focused day. Capture your work, see what needs attention, and keep moving without the clutter.</p>
        <div className="hero-actions"><Link className="primary hero-primary" to={appLink}>{appLabel}<ArrowRight /></Link><a className="secondary hero-secondary" href="#features">See how it works<ArrowDown /></a></div>
        <div className="hero-proof"><span><Check />No complicated setup</span><span><Check />Built for every screen</span></div>
      </div>

      <div className="hero-visual" aria-label="A three-dimensional preview of the Daymark task workspace">
        <div className="scene-shadow" />
        <div className="scene-orbit orbit-one" /><div className="scene-orbit orbit-two" />
        <div className="visual-chip chip-focus"><Zap /><span><b>Focus mode</b>One step at a time</span></div>
        <div className="visual-chip chip-done"><CheckCircle2 /><span><b>3 completed</b>Nice work today</span></div>
        <div className="task-board">
          <div className="board-head"><span className="board-logo">D</span><div><b>Today</b><small>{displayDate}</small></div><span className="board-avatar">A</span></div>
          <div className="board-progress"><div><span>Daily progress</span><b>68%</b></div><i><span /></i></div>
          <div className="board-label"><span>UP NEXT</span><small>3 tasks</small></div>
          <div className="board-task board-task-main"><span className="board-check" /><div><b>Prepare product notes</b><small>Today · High priority</small></div><em>IN PROGRESS</em></div>
          <div className="board-task"><span className="board-check" /><div><b>Review weekly priorities</b><small>Tomorrow · Medium</small></div></div>
          <div className="board-task board-task-done"><span className="board-check"><Check /></span><div><b>Tidy project workspace</b><small>Completed at 10:30</small></div></div>
        </div>
        <div className="floating-date"><CalendarDays /><span><small>DUE THIS WEEK</small><b>4 tasks</b></span></div>
      </div>
      <a className="scroll-cue" href="#features"><span>Scroll to explore</span><ArrowDown /></a>
    </section>

    <section className="landing-strip reveal">
      <p>A quieter home for busy days</p>
      <div><span><b>01</b>Plan clearly</span><span><b>02</b>Work intentionally</span><span><b>03</b>Finish confidently</span></div>
    </section>

    <section className="landing-section features-section" id="features">
      <div className="section-intro reveal"><p className="eyebrow">BUILT AROUND YOUR DAY</p><h2>Everything you need.<br /><em>Nothing you don’t.</em></h2><p>A focused set of tools that keeps everyday work clear without turning task management into another task.</p></div>
      <div className="feature-grid">
        <article className="feature-card feature-large reveal"><div className="feature-icon"><Layers3 /></div><span className="feature-number">01</span><h3>See the whole day at a glance.</h3><p>Live status counts show what is waiting, moving, finished, or overdue before you even reach the list.</p><div className="mini-stats"><span><i className="dot indigo" />All tasks<b>12</b></span><span><i className="dot amber" />In progress<b>3</b></span><span><i className="dot mint" />Completed<b>7</b></span></div></article>
        <article className="feature-card reveal"><div className="feature-icon coral"><Search /></div><span className="feature-number">02</span><h3>Find it in a few keystrokes.</h3><p>Search instantly and combine status, priority, and date filters without losing your place.</p><div className="feature-search"><Search /><span>Prepare presentation…</span><kbd>⌘ K</kbd></div></article>
        <article className="feature-card reveal"><div className="feature-icon mint"><ShieldCheck /></div><span className="feature-number">03</span><h3>Delete without the regret.</h3><p>A five-day recycle bin gives accidental deletions a safe way back.</p><div className="restore-pill"><CheckCircle2 />Restored successfully</div></article>
      </div>
    </section>

    <section className="landing-section workflow-section" id="workflow">
      <div className="workflow-panel reveal">
        <div className="workflow-copy"><p className="eyebrow">A SIMPLE RHYTHM</p><h2>From thought to done,<br />without the detour.</h2><p>Daymark keeps the workflow deliberately short. Add context, choose what matters, and let the dashboard hold the rest.</p><Link className="text-link" to={appLink}>{appLabel}<ArrowRight /></Link></div>
        <div className="workflow-steps">
          <article><span>1</span><div><b>Capture it</b><p>Add a title, a useful note, and the date it matters.</p></div><Sparkles /></article>
          <article><span>2</span><div><b>Give it direction</b><p>Set priority and status so the right work rises naturally.</p></div><SlidersHorizontal /></article>
          <article><span>3</span><div><b>Move it forward</b><p>Search, filter, update, and finish—with everything in view.</p></div><CheckCircle2 /></article>
        </div>
      </div>
    </section>

    <section className="landing-cta reveal"><div className="cta-mark">D</div><p className="eyebrow">YOUR NEXT CLEAR DAY STARTS HERE</p><h2>Less juggling.<br /><em>More finishing.</em></h2><p>Open your workspace and make the next step obvious.</p><Link className="primary" to={appLink}>{appLabel}<ArrowRight /></Link></section>

    <footer className="landing-footer"><Link to="/" className="brand"><span className="brand-mark">D</span><span>daymark</span></Link><p>A calm place for work in motion.</p><span>© {new Date().getFullYear()} Daymark</span></footer>
  </main>;
}
