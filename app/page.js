"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Html5Qrcode } from "html5-qrcode";

export default function QRApp() {
  const [tab, setTab] = useState("text");
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [scanned, setScanned] = useState("");
  const qrImgRef = useRef(null);

  const tabs = ["text", "url", "sms", "email", "phone"];

  const formatValue = () => {
    switch (tab) {
      case "url":
        return input1.startsWith("http") ? input1 : `https://${input1}`;
      case "sms":
        return `sms:${input1}?body=${encodeURIComponent(input2)}`;
      case "email":
        return `mailto:${input1}?subject=${encodeURIComponent(input2)}`;
      case "phone":
        return `tel:${input1}`;
      default:
        return input1;
    }
  };

  useEffect(() => {
    const generate = async () => {
      const formatted = formatValue();
      if (!formatted) return;
      try {
        const url = await QRCode.toDataURL(formatted);
        setQrUrl(url);
      } catch (err) {
        console.error("QR Generation failed", err);
      }
    };
    generate();
  }, [input1, input2, tab]);
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("scanner");

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length) {
          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
              setScanned(decodedText);
              html5QrCode.stop().then(() => html5QrCode.clear());
            },
            (errorMessage) => {
              console.warn("QR Code scan error:", errorMessage);
            }
          );
        } else {
          alert("No camera found.");
        }
      } catch (err) {
        console.error("Camera access error", err);
        alert("Failed to access camera: " + err.message);
      }
    };

    startScanner();

    return () => {
      html5QrCode
        .stop()
        .then(() => html5QrCode.clear())
        .catch((err) => console.error("Failed to stop scanner", err));
    };
  }, []);

  const downloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = "qrcode.png";
    link.click();
  };
  const reset = () => {
    setScanned("")
    startScanner();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-gray-800 rounded-xl shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-teal-400">
          QR Code Generator & Scanner
        </h1>

        {/* Tabs */}
        <div className="flex justify-between bg-gray-700 rounded-md overflow-hidden">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setInput1("");
                setInput2("");
                setQrUrl("");
              }}
              className={`flex-1 py-2 capitalize ${
                tab === t ? "bg-teal-500 text-white" : "text-gray-300"
              } hover:bg-teal-600 transition`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            type={tab === "email" ? "email" : tab === "phone" ? "tel" : "text"}
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
            placeholder={`Enter ${tab}`}
            className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {(tab === "sms" || tab === "email") && (
            <input
              type="text"
              value={input2}
              onChange={(e) => setInput2(e.target.value)}
              placeholder={tab === "sms" ? "Enter message" : "Enter subject"}
              className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          )}
        </div>

        {/* QR Output */}
        {qrUrl && (
          <div className="flex flex-col items-center space-y-2">
            <img
              ref={qrImgRef}
              src={qrUrl}
              alt="Generated QR"
              className="w-48 h-48"
            />
            <button
              onClick={downloadQR}
              className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition"
            >
              Download QR Code
            </button>
          </div>
        )}

        <hr className="border-gray-600" />

        {/* Scanner */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center text-teal-300">
            Scan QR Code
          </h2>
          <div id="scanner" className="mx-auto w-full max-w-xs" />
          {scanned && (
            <>
              <div className="text-green-300 bg-green-900 p-2 rounded text-center">
                ✅ Scanned: {scanned}
              </div>
              <div>
                <button
                  onClick={() => { reset(); }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition"
                >
                  Reset Cam
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
