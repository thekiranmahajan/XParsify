import { useState } from "react";
import { TbDragDrop } from "react-icons/tb";
import SelectedFiles from "./SelectedFiles";

const FileUpload = ({ onFilesSelected }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length + files.length <= 5) {
      updateFileList(droppedFiles);
    } else {
      alert("You can only upload up to 5 files at a time.");
    }
  };

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length + files.length <= 5) {
      updateFileList(selectedFiles);
    } else {
      alert("You can only upload up to 5 files at a time.");
    }
  };

  const updateFileList = (newFiles) => {
    setFiles((prevFiles) => {
      const validFiles = newFiles.filter((file) =>
        [".xlf", ".docx"].some((ext) => file.name.endsWith(ext))
      );
      const updatedFiles = [...prevFiles, ...validFiles];
      onFilesSelected(updatedFiles);
      return updatedFiles;
    });
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  if (files.length > 0) {
    return <SelectedFiles files={files} onRemoveFile={removeFile} />;
  }

  return (
    <div
      className={`p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none w-3xl h-60 ${
        isDragging
          ? "border-primary bg-primary/10"
          : "border-gray-300 bg-base-200 hover:bg-base-300"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById("fileInput").click()}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        multiple
        accept=".xlf,.docx"
        onChange={handleFileSelect}
      />
      <div className="flex flex-col items-center">
        <TbDragDrop className="size-10 mb-2" />
        <span className="text-lg font-semibold">Drag & Drop files here</span>
        <span className="text-sm text-gray-500 mt-1">or click to upload</span>
      </div>
    </div>
  );
};

export default FileUpload;
