import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return <button className="theme-toggle icon-button" onClick={toggle} aria-label={'Switch to ' + (theme === 'light' ? 'dark' : 'light') + ' theme'} title="Change theme">{theme === 'light' ? <Moon /> : <Sun />}</button>;
}
