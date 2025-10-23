import ReactDOM from 'react-dom/client'
import App from './App'

const defaultTargetId = 'voidx-ai-addon-root'

export const init = ({ apiKey } : { apiKey: string }) => {

  const targetElement = document.getElementById(defaultTargetId)

  if (!targetElement) {
    console.error(`[voidx-ai-addon] Target element #${defaultTargetId} not found.`)
    return
  }

  const shadowRoot = targetElement.attachShadow({ mode: 'open' })
  const appContainer = document.createElement('div')
  shadowRoot.appendChild(appContainer)

  const root = ReactDOM.createRoot(appContainer)
  root.render(<App apiKey={apiKey}/>)
}