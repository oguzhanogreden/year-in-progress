import React, { useEffect, useState } from 'react';
import './App.css';
import './Indicator.css';
import './Canvas.css'
import './Goal.css';
import './Header.css';
import { DateTime } from 'luxon';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { BrowserRouter, Link, Route, Routes,} from 'react-router-dom';
import {filter, map, mergeAll, scan, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { GoalResponse } from 'reactive-beeminder-client/dist/api';
import { Client, IClient } from 'reactive-beeminder-client/dist/client';
import Settings from './Settings';
import { getApiKey } from './local-storage';


const beeminderFetchClient: (t: string) => IClient = (token: string) => ({
  getGoal: (goalName, cb) => {
    const url = `https://www.beeminder.com/api/v1/users/oguzhanogreden/goals/${goalName}.json?auth_token=${token}&datapoints=true`
    fetch(url).then(response => {
      if (response.ok) {
        return response.json() 
      }
    }).then((goal: GoalResponse) => cb(null, goal))
    .catch(err => console.log(err));
  },
  getUser: (cb) => { throw "not yet implemented"}
})
let client = new Client({token: getApiKey(), client: beeminderFetchClient});

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
    
    return  <div className={this.props.className}>

      <div className="Header">
        <div className="Indicator">
            
        </div>
        <div>
            <p>This here is now.</p>
            <p>Progress: {progress}%</p>
        </div>
      </div>

      <div className="canvas__goal-container">
        <Goal className="Goal" name='Running (Duration)'></Goal>
      </div>

      <div className="canvas__indicator canvas__indicator--end" >
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
      left: `${(relativeProgress)}%`,
    }
    return <div className={this.props.className} style={style}>
      {/* CONV */}
      <p className="goal--title">{name}</p>
      <p> Delta: {relativeProgress.toFixed(1)}% </p>
    </div>
  }
}

function App() {
    const [key, setKey] = useState(getApiKey())
    
    const handleBeeminderKeyChanged = (key: string) => {
        client = new Client({
            'client': beeminderFetchClient,
            'token': key
        })
        setKey(key) 
    }
    
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={
                        (<div>
                            <Canvas className="Canvas"></Canvas>
                            <Link to="/settings">Settings</Link>
                        </div>) 
                    } />
                    <Route path="/settings" element={<Settings onBeeminderApiKeyChanged={handleBeeminderKeyChanged} />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
