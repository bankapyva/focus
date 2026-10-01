import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import { AppProvider } from './contexts/AppContext.tsx';

import TimerPage from './pages/TimerPage';
import StatisticsPage from './pages/StatisticsPage';
import SettingsPage from './pages/SettingsPage';
import './animations.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<TimerPage />} />
            <Route
              path="/statistics"
              element={<StatisticsPage />}
            />
            <Route
              path="/settings"
              element={<SettingsPage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;