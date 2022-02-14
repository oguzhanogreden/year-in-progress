import React from 'react';
import logo from './logo.svg';
import './App.css';
import './Canvas.css';
import './Goal.css';
import './Header.css';
import { DateTime } from 'luxon';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'

import {IClient, Client, Callback, GoalResponse } from './beeminder/client-wrapper'
import { filter, map, mergeAll, scan, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

const beeminderFetchClient: (t: string) => IClient = (token: string) => ({
  getGoal: (goalName, cb) => {
    const url = `https://www.beeminder.com/api/v1/users/oguzhanogreden/goals/${goalName}.json?auth_token=${token}&datapoints=true`
    const goal = fetch(url).then(response => {
      if (response.ok) {
        
        return response.json() 
      }
    }).then((goal: GoalResponse) => cb(null, goal))
    .catch(err => console.log(err));
  },
  getUser: (cb) => { throw "not yet implemented"}
})
const client = new Client('', beeminderFetchClient);


type Target = {
  name: string,
  target: number
}
const targets: Target[] = [
  {
    name: 'running',
    target: 31.05
  }
]

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
      progress: progress()
    }
  }
  
  render() {
    const {year, progress} = this.state ;
    
    const divStyle = {
      marginLeft: '100%',
      position: 'relative',
      left: `${-(progress)}%`,
      width: '100%',
    } as React.CSSProperties
    
    const endArrowStyle: React.CSSProperties = {
      left: `${(progress - 100)}%`
    }
    const startArrowStyle: React.CSSProperties = {
      left: `${(progress)}%`
    }
    
    return  <div className={this.props.className} style={divStyle}>
      <div className="canvas__indicator canvas__indicator--start" style={endArrowStyle}>
        <span className='text'>This side is</span>
        <span>2021</span>
        <FiArrowLeft></FiArrowLeft>
      </div>

      <div className="Header">
        <p>This here is now.</p>
        <p>Progress: {progress}%</p>
      </div>

      <div className="canvas__goal-container">
        <Goal className="Goal" name='Running (Duration)'></Goal>
      </div>

      <div className="canvas__indicator canvas__indicator--end" style={startArrowStyle}>
        <span className="text">This side is</span>
        <span>2023</span>
        <FiArrowRight className="arrow"></FiArrowRight>
      </div>
    </div>
  }
}

type GoalProps = React.HTMLAttributes<HTMLDivElement> & {
  name: string,
}
type GoalState = {
  relativeProgress: number,
}

class Goal extends React.Component<GoalProps, GoalState> {
  constructor(props: any) {
    super(props);
    this.state = { 'relativeProgress': 0 }
  }

  loadTarget = () => {
    const slug = "running-duration"
    client.getGoalData(slug)
    
    const relativeProgress = client.goalDataStream$.pipe(
      filter(goal => goal.slug === slug), 
      switchMap(goal => of(goal.dataPoints)),
      mergeAll(),
      filter(dataPoint => DateTime.fromSeconds(dataPoint.timestamp) > DateTime.fromObject({year: 2022})), // TODO: Install luxon
      map(dataPoint => dataPoint.value),
      scan((total, value) => total + value, 0),
      map(total => {
        const target = targets[0].target;
        const percentProgress = total / target * 100;
        return percentProgress - progress()
      })
    )
    
    relativeProgress.subscribe({
      next: relativeProgress => this.setState({relativeProgress})
    });
  }
  
  componentDidMount() {
    this.loadTarget()
  }

  render() {
    const {name} = this.props;
    const { relativeProgress } = this.state;
    

    const style: React.CSSProperties = {
      left: `${-(relativeProgress)}%`,
    }
    return <div className={this.props.className} style={style}>
      {/* CONV */}
      <p className="goal--title">{name}</p>
      <p> Delta: {relativeProgress.toFixed(1)}% </p>
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

