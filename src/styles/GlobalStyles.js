import { css, Global } from '@emotion/react';

export const GlobalStyles = () => (
  <Global
    styles={css`
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
          Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        background: ${props => props.theme.background};
        color: ${props => props.theme.text.primary};
        transition: all 0.2s ease;
      }

      .app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .main-content {
        flex: 1;
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
      }

      h1, h2, h3, h4, h5, h6 {
        color: ${props => props.theme.text.primary};
        margin-bottom: 1rem;
      }
    `}
  />
); 