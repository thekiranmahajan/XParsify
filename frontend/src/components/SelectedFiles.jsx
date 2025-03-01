import { useState } from "react";
import {
  RiDeleteBin2Line,
  RiFileTransferLine,
  RiDownloadLine,
} from "react-icons/ri";
import { XLF_CONVERSIONS, WORD_CONVERSIONS } from "../utils/constants";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

const SelectedFiles = ({ files, onRemoveFile }) => {
  const [conversionFormats, setConversionFormats] = useState(
    files.map(() => "")
  );
  const [convertedFiles, setConvertedFiles] = useState([]);

  const handleFormatChange = (index, format) => {
    const newFormats = [...conversionFormats];
    newFormats[index] = format;
    setConversionFormats(newFormats);
  };

  const handleConvert = async (index = null) => {
    const formData = new FormData();
    const targetFiles = index !== null ? [files[index]] : files;
    targetFiles.forEach((file, idx) => {
      formData.append("files", file);
      formData.append(
        "format",
        conversionFormats[index !== null ? index : idx]
      );
    });

    try {
      console.log(`Converting ${index !== null ? "file" : "all files"}`);
      const response = await axiosInstance.post(
        `/${files[0].name.endsWith(".xlf") ? "xlf" : "word"}`,
        formData
      );
      console.log("Conversion response:", response.data);
      setConvertedFiles((prev) => [...prev, ...response.data.results]);
      toast.success("Files converted successfully!");
    } catch (error) {
      console.error("Error converting files:", error);
      console.error("Error response:", error.response);
      toast.error("Error converting files.");
    }
  };

  const truncateFileName = (name) => {
    const ext = name.split(".").pop();
    const baseName = name.slice(0, name.length - ext.length - 1);
    return baseName.length > 20 ? `${baseName.slice(0, 20)}...${ext}` : name;
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex justify-between items-center bg-base-100 p-2 rounded-md shadow-sm mb-2 w-11/12"
        >
          <span className="text-sm">{truncateFileName(file.name)}</span>
          <div className="flex items-center space-x-2">
            <select
              className="select select-bordered w-32"
              value={conversionFormats[index]}
              onChange={(e) => handleFormatChange(index, e.target.value)}
            >
              <option value="" disabled>
                Select format
              </option>
              {(file.name.endsWith(".xlf")
                ? XLF_CONVERSIONS
                : WORD_CONVERSIONS
              ).map((format, idx) => (
                <option key={idx} value={format}>
                  {format}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary btn-xs"
              onClick={() => handleConvert(index)}
              disabled={!conversionFormats[index]}
            >
              <RiFileTransferLine />
            </button>
            <button
              className="btn btn-error btn-xs"
              onClick={() => onRemoveFile(index)}
            >
              <RiDeleteBin2Line className="size-4" />
            </button>
          </div>
          {convertedFiles.find((f) => f.file === file.name) && (
            <a
              href={convertedFiles.find((f) => f.file === file.name).filePath}
              download
              className="ml-2"
            >
              <RiDownloadLine />
            </a>
          )}
        </div>
      ))}
      <button
        className="btn btn-primary mt-4 w-56"
        onClick={() => handleConvert()}
        disabled={conversionFormats.some((format) => !format)}
      >
        Convert All and Download
      </button>
    </div>
  );
};

export default SelectedFiles;
