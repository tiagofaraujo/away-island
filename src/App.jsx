import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Story from './components/Story.jsx';
import Radar from './components/Radar.jsx';
import MemeShortlist from './components/MemeShortlist.jsx';
import RadarLab from './components/RadarLab.jsx';
import ExitPlan from './components/ExitPlan.jsx';
import Community from './components/Community.jsx';
import Safety from './components/Safety.jsx';
import Footer from './components/Footer.jsx';

function App() {
  return (
    <main className="site-shell">
      <div className="grain" aria-hidden="true" />
      <Navbar />
      <Hero />
      <Story />
      <Radar />
      <MemeShortlist />
      <RadarLab />
      <ExitPlan />
      <Community />
      <Safety />
      <Footer />
    </main>
  );
}

export default App;
