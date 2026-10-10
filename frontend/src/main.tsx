import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { createAppRouter } from './router'
import './index.css'

const root = document.getElementById('root')
if (root === null) throw new Error('Élément #root introuvable')

const router = createAppRouter()

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
