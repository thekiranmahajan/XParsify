import React from "react";
import { FileUpload, Footer, Header } from "./components";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center w-full h-full">
        <FileUpload />
      </main>
      <Footer />
    </div>
  );
};

export default App;
