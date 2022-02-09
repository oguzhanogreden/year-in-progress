import React from 'react';
import logo from './logo.svg';
import './App.css';
import './Canvas.css';
import './Goal.css';
import './Header.css';
import { DateTime } from 'luxon';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'

const progress = () => {
  const now = DateTime.now()
  const startOfYear = DateTime.fromObject({
    'year': now.year,
    'day': 1,
    'month': 1
  })
  const endOfYear = startOfYear.plus({'year': 1}).minus({'second': 1});
  
  const yearDuration = endOfYear.minus(startOfYear.toMillis()).toMillis()

  const progress = now.minus(startOfYear.toMillis()).toMillis() / yearDuration;
  
  console.log(endOfYear.toLocaleString());
  
  return +((progress * 100).toFixed(2) );
}

type CanvasState = {
  progress: number;
  year: number,
};

class Canvas extends React.Component<any, CanvasState> {
  constructor(props: any) {
    super(props)
    this.state = {
      year: 2022,
      progress: 50// progress()
    }
  }
  
  render() {
    const {year, progress} = this.state ;
    
    const style = {
      marginLeft: '100%',
      position: 'relative',
      left: `${-(progress)}%`,
      width:  `${(progress)}%`,
    } as React.CSSProperties
    
    return  <div className={this.props.className} style={style}>

      <div className="canvas__indicator canvas__indicator--end">
        <span className='text'>This side is</span>
        <span>2023</span>
        <FiArrowLeft></FiArrowLeft>
      </div>

      <header className="Header"> {year} </header>

      <p> {progress}% </p>

      <Goal className="Goal" name='Running (Duration)'></Goal>

      <div className="canvas__indicator canvas__indicator--start">
        <span className="text">This side is</span>
        <span>2021</span>
        <FiArrowRight className="arrow"></FiArrowRight>
      </div>
    </div>
  }
}

type GoalProps = React.HTMLAttributes<HTMLDivElement> & {
  name: string,
}
type GoalState = {
  relativeProgress: number
}
class Goal extends React.Component<GoalProps, GoalState> {
  constructor(props: any) {
    super(props);
    this.state = { 'relativeProgress': -0 }
  }

  render() {
    const {name} = this.props;
    const {relativeProgress} = this.state;
    
    const style: React.CSSProperties = {
      left: `${-(relativeProgress)}%`,
    }
    return <div className={this.props.className} style={style}>
      {/* CONV */}
      <p className="goal--title">{name}</p>
      <p> {relativeProgress}% </p>
      
    </div>
  }
}

function App() {
  return (
    <div className="App">
        

        <Canvas className="Canvas"></Canvas>
    </div>
  );
}

export default App;
