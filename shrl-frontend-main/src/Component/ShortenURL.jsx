import React, { useState } from "react";
import axios from "axios";
import QRCode from "qrcode.react";

const ShortenURL = () => {
  const [toggle, setToggle] = useState("link");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  const [qrCodeValue, setQRCodeValue] = useState("");
  const API_URL = process.env.REACT_APP_API_URL;

  const handleLabelClick = (value) => {
    setToggle(value);
    setFile(null);
    setLink("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
    setToggle("file");
  };

  const handleShorten = async () => {
    setIsLoading(true);

    let formData = new FormData();
    formData.append("file", file);

    let url = "";
    if (toggle === "link") {
      url = API_URL + "newShort";
      try {
        const response = await axios.post(
          url,
          { bodyURL: file },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.REACT_APP_API_KEY,
            },
          }
        );
        console.log(response);
        setLink(response.data.message);
        setQRCodeValue(response.data.message);
      } catch (error) {
        console.error("Error shortening URL:", error);
      }
    } else if (toggle === "file") {
      url = API_URL + "valid_key";
      try {
        const res = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.REACT_APP_API_KEY,
          },
        });
        const validity = res.data;
        if (validity.valid) {
          url = API_URL + "ups3";
          const response = await axios.post(
            url,
            { s3url: file },
            {
              headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.REACT_APP_API_KEY,
              },
            }
          );
          setLink(response.data.message);
          setQRCodeValue(response.data.message);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    setIsLoading(false);
  };

  return (
    <div
      className="flex justify-center items-center h-screen bg-gray-100"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150">
            <path
              fill="none"
              stroke="#17ADFF"
              strokeWidth="15"
              strokeLinecap="round"
              strokeDasharray="300 385"
              strokeDashoffset="0"
              d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"
            >
              <animate
                attributeName="stroke-dashoffset"
                calcMode="spline"
                dur="2"
                values="685;-685"
                keySplines="0 0 1 1"
                repeatCount="indefinite"
              ></animate>
            </path>
          </svg>
        </div>
      )}
      <div className="w-[400px] p-24 bg-white rounded-lg shadow-lg">
        <img src="/img.png" alt="Logo" className="w-24 h-auto mb-8 mx-auto" />
        <div className="mt-5 flex justify-center items-center">
          <div className="flex justify-between w-20 mx-4">
            <label
              htmlFor="link"
              className={`pr-0 text-xl cursor-pointer ${toggle === "link" ? "text-blue-500 font-bold text-2xl" : ""
                }`}
              onClick={() => handleLabelClick("link")}
            >
              Link
            </label>
            <label
              htmlFor="file"
              className={`pl-10 text-xl cursor-pointer ${toggle === "file" ? "text-blue-500 font-bold text-2xl" : ""
                }`}
              onClick={() => handleLabelClick("file")}
            >
              File
            </label>
          </div>
        </div>
        {toggle === "link" && (
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">
              Enter URL to shorten:
            </label>
            <textarea
              className="w-full px-4 py-2 border rounded-md bg-gray-200 focus:outline-none focus:border-blue-500"
              rows="4"
              placeholder="Enter URL here..."
              value={file}
              onChange={(e) => {
                setFile(e.target.value);
                setLink("");
                setQRCodeValue("");
              }}
            ></textarea>
          </div>
        )}

        {toggle === "file" && (
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">
              Upload file:
            </label>
            <input
              type="file"
              className="w-full px-4 py-2 border rounded-md bg-gray-200 focus:outline-none focus:border-blue-500"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setLink("");
                setQRCodeValue(""); // Reset link when a file is uploaded
              }}
            />
            {file && <p>{file.name}</p>}
          </div>
        )}

        <button
          className={`w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md focus:outline-none focus:bg-blue-600 ${isLoading && "cursor-not-allowed"
            }`}
          disabled={isLoading}
          onClick={handleShorten}
        >
          {isLoading ? "Shortening..." : "Shorten"}
        </button>

        {link && (
          <div className="mt-4">
            <label className="block mb-2 font-semibold text-gray-700">
              Shortened Link:
            </label>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline break-all"
            >
              {link}
              <div className="mt-2 bg-blue-300 p-4 rounded-md border border-blue-500 border-4 text-center">
                <QRCode value={qrCodeValue} size={128} />
              </div>
            </a>
          </div>
        )}

        <p>Beta V.1</p>
      </div>
    </div>
  );
};

export default ShortenURL;
