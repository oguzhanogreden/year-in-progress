import React, { useEffect, useState } from 'react';
import { BrowserRouter, Link, Route,} from 'react-router-dom';
import {filter, map, mergeAll, scan, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { storeApiKey } from './local-storage';

function Settings({onBeeminderApiKeyChanged}: {onBeeminderApiKeyChanged: (beeminderApiKey: string) => void}) {
    const [apiKey, setApiKey] = useState(localStorage.getItem('key') ?? '');

    const handleChange = (value: string) => {
        setApiKey(value); 
        onBeeminderApiKeyChanged(value);
    }
    
    useEffect(() => {
        storeApiKey(apiKey);
    })

    return (
        <div className="Settings">
            <p>{apiKey}</p>
            <input onChange={event => {handleChange(event.target.value)}} type="text" value={apiKey}></input>
            <Link to="/">Back</Link>
        </div>
    );
}

export default Settings;