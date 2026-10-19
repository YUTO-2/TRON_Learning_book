import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Sokushu from './pages/sokushu/Sokushu'
import { ThemeRoot } from './pages/sokushu/ThemeMode'

// テーマ（ダーク／ホワイト）は ThemeMode.tsx で決める。
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeRoot>
      <Sokushu />
    </ThemeRoot>
  </StrictMode>,
)
