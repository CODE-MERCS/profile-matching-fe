import React from 'react';
import AppRoutes from './routes';
import DevHelper from './components/atoms/DevHelper/DevHelper';

const App: React.FC = () => {
  return (
    <>
      <AppRoutes />
      <DevHelper />
    </>
  );
};

export default App;