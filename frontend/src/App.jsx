import { useState } from 'react';
import Find from './pages/Find.jsx';
import Track from './pages/Track.jsx';
import History from './pages/History.jsx';

const TABS = [['find', 'Find a technician'], ['track', 'Track repair'], ['history', 'My history']];

export default function App() {
  const [tab, setTab] = useState('find');
  const [repairId, setRepairId] = useState('');

  const openRepair = (id) => { setRepairId(String(id)); setTab('track'); };

  return (
    <div className="app">
      <header>
        <h1>Fix<span>Chennai</span></h1>
        <p>Find a trusted technician. Know the price. Track every step.</p>
        <nav>
          {TABS.map(([key, label]) => (
            <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>
          ))}
        </nav>
      </header>
      <main>
        {tab === 'find' && <Find onBooked={openRepair} />}
        {tab === 'track' && <Track initialId={repairId} />}
        {tab === 'history' && <History onOpen={openRepair} />}
      </main>
    </div>
  );
}
