import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [serverText, setServerText] = useState("");

  useEffect(() => {
    fetch("/api")
      .then((res) => res.text())
      .then(setServerText);
  }, []);

  return (
    <>
      <h1>Vite + React</h1>
      api response 👉 {serverText}
    </>
  );
}

export default App;
