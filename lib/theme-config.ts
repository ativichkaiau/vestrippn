import { THEME_CONFIG } from './liveries';
import { createThemeEngine } from './theme-engine';

export const themeEngine = createThemeEngine(THEME_CONFIG);

// Serialize only a self-contained factory and static palette data. No user input.
export const THEME_BOOT_SCRIPT = `(()=>{const engine=(${createThemeEngine.toString()})(${JSON.stringify(THEME_CONFIG)});let lv='system',md='night',th='vestrippn',low=false,wm=true;try{lv=engine.livery(localStorage.getItem('vest_livery'))||'system';md=engine.mode(localStorage.getItem('vest_mode'));th=engine.colorTheme(localStorage.getItem('vest_theme'));low=localStorage.getItem('vest_lowpower')==='1';wm=localStorage.getItem('vest_watermark')!=='0';localStorage.setItem('vest_livery',lv);}catch{}engine.apply(document.documentElement,lv,md,undefined,th);document.documentElement.classList.toggle('low-power',low);document.documentElement.classList.toggle('no-watermark',!wm);})();`;
