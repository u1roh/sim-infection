import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Simulator } from './model'

interface A {
  data: number;
}

function App() {
  let txtDay: React.RefObject<HTMLParagraphElement> = React.createRef();
  let txtInfectionRate: React.RefObject<HTMLParagraphElement> = React.createRef();
  const sim = new Simulator(100000, 10);
  let infectionRate = 0.0;
  setInterval(() => {
    sim.step();
    if (txtDay.current != null) {
      txtDay.current.textContent = "days: " + sim.getDay().toString();
    }
    if (txtInfectionRate.current != null) {
      txtInfectionRate.current.textContent = sim.getInfectionRate().toString();
    }
  }, 1000);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p ref={txtDay}></p>
        <p ref={txtInfectionRate}></p>
        <p>{infectionRate}</p>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
