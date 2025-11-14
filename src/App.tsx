import { useEffect } from "react";
import VoidxProvider from "./components/VoidxProvider";

interface AppProps {
  apiKey?: string;
}


export default function App({ apiKey }: AppProps) {
  useEffect(() => {
    console.log(apiKey);
  }, [apiKey]);

  return <VoidxProvider />;
}