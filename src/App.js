import Router from "./router";
import useSessionValidator from "./hooks/useSessionValidator";

function App() {
  // Validate session every 5 minutes
  useSessionValidator(300000);

  return (
    <>
      <Router />
    </>
  );
}

export default App;
