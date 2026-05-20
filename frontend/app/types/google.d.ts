interface GoogleCredentialResponse {
  credential: string
  select_by: string
}

interface GoogleGsiButtonConfig {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  width?: number
}

interface Google {
  accounts: {
    id: {
      initialize(config: {
        client_id: string
        callback: (response: GoogleCredentialResponse) => void
        auto_select?: boolean
      }): void
      prompt(): void
      renderButton(element: HTMLElement, config: GoogleGsiButtonConfig): void
    }
  }
}

interface Window {
  google?: Google
}
