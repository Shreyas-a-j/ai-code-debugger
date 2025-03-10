import React from 'react';
import styled from '@emotion/styled';

const ErrorContainer = styled.div`
  padding: 2rem;
  margin: 2rem;
  border: 1px solid ${props => props.theme.error};
  border-radius: 8px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text.primary};
`;

const ErrorHeading = styled.h2`
  color: ${props => props.theme.error};
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.pre`
  background: ${props => props.theme.background};
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorHeading>Something went wrong</ErrorHeading>
          <ErrorMessage>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </ErrorMessage>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 