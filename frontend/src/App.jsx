import React, { useState } from "react";
import { FileUpload, Footer, Header } from "./components";
import SelectedFiles from "./components/SelectedFiles";

const App = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const handleConvertAll = (formats) => {
    // Logic to handle batch conversion and download
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center w-full h-full">
        {selectedFiles.length === 0 ? (
          <FileUpload onFilesSelected={handleFilesSelected} />
        ) : (
          <SelectedFiles
            files={selectedFiles}
            onRemoveFile={handleRemoveFile}
            onConvertAll={handleConvertAll}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
