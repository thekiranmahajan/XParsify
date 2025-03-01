import { useState } from "react";
import { TbDragDrop } from "react-icons/tb";
import { RiDeleteBin2Line } from "react-icons/ri";

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
    updateFileList(droppedFiles);
  };

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    updateFileList(selectedFiles);
  };

  const updateFileList = (newFiles) => {
    const validFiles = newFiles.filter((file) =>
      [".xlf", ".docx"].some((ext) => file.name.endsWith(ext))
    );
    setFiles(validFiles);
    onFilesSelected(validFiles);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div
      className={`p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none w-3xl h-60  ${
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
      {files.length > 0 && (
        <div className="mt-4 w-full">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-base-100 p-2 rounded-md shadow-sm mb-2"
            >
              <span className="text-sm">{file.name}</span>
              <button
                className="btn btn-xs btn-error"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <RiDeleteBin2Line className="size-4"/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
