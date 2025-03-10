import React from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  padding: 20px;
  margin: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TestComponent = () => {
  return (
    <Container>
      <h1>Test Component</h1>
      <p>If you can see this, the theme and component rendering are working!</p>
    </Container>
  );
};

export default TestComponent; 