import { Navbar } from './components/Navbar';
import { ChatInterface } from './components/ChatInterface';
import { Footer } from './components/Footer';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <ChatInterface />
      <Footer />
    </div>
  );
}
