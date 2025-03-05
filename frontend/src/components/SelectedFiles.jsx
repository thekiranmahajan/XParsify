import { useState, useEffect } from "react";
import {
  RiDeleteBin2Line,
  RiFileTransferLine,
  RiDownloadLine,
} from "react-icons/ri";
import { FORMATS } from "../utils/constants";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

const SelectedFiles = ({ files, onRemoveFile }) => {
  const [conversionFormats, setConversionFormats] = useState(
    files.map(() => "")
  );
  const [convertedFiles, setConvertedFiles] = useState({});
  const [isConverting, setIsConverting] = useState(false);
  const [isConvertingBatch, setIsConvertingBatch] = useState(false);
  const [batchDownloadUrl, setBatchDownloadUrl] = useState("");
  const [isDownloadDisabled, setIsDownloadDisabled] = useState(
    files.map(() => true)
  );

  useEffect(() => {
    setIsDownloadDisabled(files.map(() => true));
  }, [files]);

  const handleFormatChange = (index, format) => {
    const newFormats = [...conversionFormats];
    newFormats[index] = format;
    setConversionFormats(newFormats);

    const newDownloadDisabled = [...isDownloadDisabled];
    newDownloadDisabled[index] = true;
    setIsDownloadDisabled(newDownloadDisabled);
  };

  const handleConvert = async (index = null) => {
    setIsConverting(true);
    const formData = new FormData();

    if (index !== null) {
      formData.append("file", files[index]);
      formData.append("format", conversionFormats[index]);

      try {
        const response = await axiosInstance.post("/convert", formData);
        if (response.data.result?.downloadUrl) {
          setConvertedFiles((prev) => ({
            ...prev,
            [index]: response.data.result.downloadUrl,
          }));
          const newDownloadDisabled = [...isDownloadDisabled];
          newDownloadDisabled[index] = false;
          setIsDownloadDisabled(newDownloadDisabled);
        }
        toast.success("File converted successfully!");
      } catch (error) {
        toast.error(error?.response?.data?.message || "Error converting file");
      }
    } else {
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("formats", conversionFormats.join(","));

      try {
        const response = await axiosInstance.post("/convert-batch", formData);
        if (response.data.downloadUrl) {
          setBatchDownloadUrl(response.data.downloadUrl);
        }
        toast.success("Files converted successfully!");
      } catch (error) {
        toast.error(error?.response?.data?.message || "Error converting files");
      }
    }
    setIsConverting(false);
  };

  const handleBatchConvert = async () => {
    setIsConvertingBatch(true);
    await handleConvert();
    if (batchDownloadUrl) {
      window.location.href = batchDownloadUrl;
    }
    setIsConvertingBatch(false);
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
              {FORMATS.map((format, idx) => (
                <option key={idx} value={format}>
                  {format}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary btn-xs"
              onClick={() => handleConvert(index)}
              disabled={!conversionFormats[index] || isConverting}
            >
              <RiFileTransferLine />
            </button>
            <button
              className="btn btn-error btn-xs"
              onClick={() => onRemoveFile(index)}
            >
              <RiDeleteBin2Line className="size-4" />
            </button>
            <a
              href={convertedFiles[index]}
              download
              rel="noopener noreferrer"
              className="btn btn-success btn-xs"
              disabled={isDownloadDisabled[index]}
            >
              <RiDownloadLine />
            </a>
          </div>
        </div>
      ))}
      {files.length > 1 && (
        <button
          className="btn btn-primary mt-4 w-56"
          onClick={handleBatchConvert}
          disabled={
            conversionFormats.some((format) => !format) || isConvertingBatch
          }
        >
          {isConvertingBatch && !batchDownloadUrl ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Convert All and Download"
          )}
        </button>
      )}
    </div>
  );
};

export default SelectedFiles;
