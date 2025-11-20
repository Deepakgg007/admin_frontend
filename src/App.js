import Router from "./router";
import useSessionValidator from "./hooks/useSessionValidator";

function App() {
  // Validate session every 30 seconds
  useSessionValidator(30000);

  return (
    <>
      <Router />
    </>
  );
}

export default App;
