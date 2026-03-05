import { createRoot } from 'react-dom/client'
import { initLocale } from './data/i18n'
import { App } from './App'

initLocale()
createRoot(document.getElementById('root')!).render(<App />)
