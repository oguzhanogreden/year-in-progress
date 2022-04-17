import { useState } from "react";
import { Link } from "react-router-dom";

function Settings({
  onBeeminderApiKeyChanged,
}: {
  onBeeminderApiKeyChanged: (beeminderApiKey: string) => void;
}) {
  const [apiKey, setApiKey] = useState(localStorage.getItem("key") ?? "");

  const handleChange = (value: string) => {
    setApiKey(value);
    onBeeminderApiKeyChanged(value);
  };

  return (
    <div className="Settings">
      <p>{apiKey}</p>
      <input
        onChange={event => {
          handleChange(event.target.value);
        }}
        type="text"
        value={apiKey}
      ></input>
      <Link to="/">Back</Link>
    </div>
  );
}

export default Settings;
