import React from 'react';
import './App.css';
import { Simulator, Stat, Parameter, defaultParameter } from './model'

class SimPlot extends React.Component<{ param: Parameter }, Stat> {
  private sim: Simulator;
  private canvas: React.RefObject<HTMLCanvasElement> = React.createRef();
  constructor(props: { param: Parameter }) {
    super(props);
    this.sim = new Simulator(props.param);
  }
  componentDidMount() {
    this.setState(this.sim.stat());
    const id = setInterval(() => {
      this.sim.step();
      const stat = this.sim.stat();
      if (this.canvas.current != null) {
        const con = this.canvas.current.getContext("2d");
        if (con != null) {
          const dx = 5;
          con.strokeStyle = "Blue";
          con.beginPath();
          con.moveTo(dx * this.sim.time, (1.0 - this.state.susceptiblePercent / 100) * 300);
          con.lineTo(dx * (this.sim.time + 1), (1.0 - stat.susceptiblePercent / 100) * 300);
          con.stroke();
          con.strokeStyle = "Red";
          con.beginPath();
          con.moveTo(dx * this.sim.time, (1.0 - this.state.infectedPercent / 100) * 300);
          con.lineTo(dx * (this.sim.time + 1), (1.0 - stat.infectedPercent / 100) * 300);
          con.stroke();
          con.strokeStyle = "Green";
          con.beginPath();
          con.moveTo(dx * this.sim.time, (1.0 - this.state.recoveredPercent / 100) * 300);
          con.lineTo(dx * (this.sim.time + 1), (1.0 - stat.recoveredPercent / 100) * 300);
          con.stroke();
        }
      }
      this.setState(stat);
      if (stat.day >= 30) clearInterval(id);
    }, 200);
  }
  render() {
    return (
      <div className="SimPlot">
        <p>{this.state?.day} 日目</p>
        <p>{this.state?.infectedPercent} %</p>
        <div className="canvas"><canvas ref={this.canvas} width="1200" height="300"></canvas></div>
      </div>
    );
  }
}

class App extends React.Component<{}, Stat> {
  private param1 = defaultParameter();
  private param2 = defaultParameter();
  constructor({ }) {
    super({});
    this.param2.schoolsClosed = true;
  }
  render() {
    return (
      <div className="App">
        <SimPlot param={this.param1} />
        <SimPlot param={this.param2} />
      </div>
    );
  }
}

/*
function App() {
  let txtDay: React.RefObject<HTMLParagraphElement> = React.createRef();
  let txtInfectionRate: React.RefObject<HTMLParagraphElement> = React.createRef();
  let canvas: React.RefObject<HTMLCanvasElement> = React.createRef();
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
    if (canvas.current != null) {
      const con = canvas.current.getContext("2d");
      if (con !== null) {
        con.strokeStyle = "white";
        con.lineWidth = 2;
        con.beginPath();
        con.moveTo(10, 10);
        con.lineTo(500, 500);
        con.stroke();
        //con.fillStyle = "white";
        //con.fillRect(20, 20, 500, 500);
        //console.log("stroke");
      }
    }
  }, 1000);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p ref={txtDay}></p>
        <p ref={txtInfectionRate}></p>
        <p>{infectionRate}</p>
        <p><canvas ref={canvas} width="600" height="600"></canvas></p>
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
*/

export default App;
