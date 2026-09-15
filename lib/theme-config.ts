import { THEME_CONFIG } from './liveries';
import { createThemeEngine } from './theme-engine';

export const themeEngine = createThemeEngine(THEME_CONFIG);

// Serialize only a self-contained factory and static palette data. No user input.
export const THEME_BOOT_SCRIPT = `(()=>{const engine=(${createThemeEngine.toString()})(${JSON.stringify(THEME_CONFIG)});let lv='normal',md='auto',low=false;try{lv=engine.livery(localStorage.getItem('vest_livery'))||'normal';md=engine.mode(localStorage.getItem('vest_mode'));low=localStorage.getItem('vest_lowpower')==='1';localStorage.setItem('vest_livery',lv);}catch{}engine.apply(document.documentElement,lv,md);document.documentElement.classList.toggle('low-power',low);})();`;
