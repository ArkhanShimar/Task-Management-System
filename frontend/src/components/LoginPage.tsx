import { useState,type FormEvent } from 'react'; import { ArrowRight,CheckCircle2,Eye,EyeOff } from 'lucide-react'; import { useAuth } from '../context/AuthContext';
export function LoginPage(){
 const {login}=useAuth(); const[email,setEmail]=useState('admin@test.com'),[password,setPassword]=useState('123456'),[show,setShow]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const submit=async(e:FormEvent)=>{e.preventDefault();setError('');setBusy(true);try{await login(email,password)}catch(err){setError(err instanceof Error?err.message:'Could not sign in.')}finally{setBusy(false)}};
 return <main className="login-page">
  <section className="login-story"><div className="brand"><span className="brand-mark">D</span> daymark</div><div className="story-copy"><p className="eyebrow">MAKE SPACE FOR GOOD WORK</p><h1>Your day,<br/><em>clearly marked.</em></h1><p>One thoughtful place for the work that matters today, and everything waiting for tomorrow.</p><div className="story-note"><CheckCircle2/><span><b>A calmer way to stay on track</b><small>Plan, prioritize, and finish without the clutter.</small></span></div></div><p className="quote">“Small steps still move the work forward.”</p></section>
  <section className="login-panel"><form className="login-card" onSubmit={submit}><div className="mobile-brand"><span className="brand-mark">D</span> daymark</div><p className="eyebrow">WELCOME BACK</p><h2>Pick up where you left off.</h2><p className="muted">Sign in to see what needs your attention today.</p>
   <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/></label>
   <label>Password<div className="password-field"><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/><button type="button" onClick={()=>setShow(!show)} aria-label="Show password">{show?<EyeOff/>:<Eye/>}</button></div></label>
   {error&&<p className="form-error">{error}</p>}<button className="primary wide" disabled={busy}>{busy?'Opening your workspace…':<>Sign in <ArrowRight/></>}</button>
   <p className="demo-note">Assessment login is filled in for you.</p>
  </form></section>
 </main>;
}
