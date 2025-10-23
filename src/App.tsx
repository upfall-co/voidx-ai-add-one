import { useEffect } from "react";
import "./assets/css/App.module.css";
import VoidxProvider from "./components/VoidxProvider";

interface AppProps {
  apiKey?: string;
}

export default function App({ apiKey }: AppProps) {
  useEffect(() => {
    console.log(apiKey);
  }, [apiKey]);

  return (
    <div>
      <VoidxProvider />
      <h1>안녕하세요! 님의 SDK입니다.</h1>
      <p>전달받은 API Key: {apiKey || "없음"}</p>
      <button onClick={() => alert("SDK 버튼 클릭!")}>테스트 버튼</button>
    </div>
  );
}
