"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface TicketScannerProps {
  eventId?: string;
}

export default function TicketScanner({ eventId }: TicketScannerProps) {
  const [scannedTicketId, setScannedTicketId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const html5QrcodeScannerRef = useRef<Html5Qrcode | null>(null);

  const requestCameraPermission = async () => {
    setIsRequestingPermission(true);
    setErrorMessage(null);
    
    try {
      // Check if camera is available
      const devices = await Html5Qrcode.getCameras();
      if (devices.length === 0) {
        setErrorMessage("No camera found on this device.");
        setIsRequestingPermission(false);
        return;
      }

      setPermissionGranted(true);
      setScanning(true);
    } catch (err) {
      console.error("Camera permission error:", err);
      setPermissionGranted(false);
      setErrorMessage("Camera access denied. Please allow camera access to scan QR codes.");
    }
    setIsRequestingPermission(false);
  };

  useEffect(() => {
    if (!scanning || !permissionGranted) {
      html5QrcodeScannerRef.current?.stop().catch(() => {});
      return;
    }

    const config = { fps: 10, qrbox: 250 };
    const verbose = false;
    const html5QrcodeScanner = new Html5Qrcode("qr-reader", verbose);
    html5QrcodeScannerRef.current = html5QrcodeScanner;

    html5QrcodeScanner
      .start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          setScanning(false);
          setErrorMessage(null);
          setScannedTicketId(decodedText);
        },
        (error) => {
          // ignore scan errors during scanning
        }
      )
      .catch((err) => {
        console.error("Scanner start error:", err);
        setPermissionGranted(false);
        setErrorMessage("Unable to start camera. Please check camera permissions and try again.");
      });

    return () => {
      html5QrcodeScanner.stop().catch(() => {});
    };
  }, [scanning, permissionGranted]);

  const handleValidate = async () => {
    if (!scannedTicketId) return;
    
    setIsValidating(true);
    try {
      const response = await fetch("/api/validate-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketId: scannedTicketId, eventId }),
      });

      const result = await response.json();
      setValidationResult(result);

      if (!result.success) {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage("Failed to validate ticket. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleReset = () => {
    setScannedTicketId(null);
    setErrorMessage(null);
    setValidationResult(null);
    setScanning(true);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Ticket QR Code Scanner</h2>
      
      {/* Camera Permission Request */}
      {permissionGranted === null && (
        <div className="text-center">
          <p className="mb-4 text-gray-600">
            To scan QR codes, we need access to your camera. Click the button below to grant permission.
          </p>
          <button
            onClick={requestCameraPermission}
            disabled={isRequestingPermission}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRequestingPermission ? "Requesting Access..." : "Enable Camera"}
          </button>
        </div>
      )}

      {/* Camera Permission Denied */}
      {permissionGranted === false && (
        <div className="text-center">
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded">
            <p className="font-medium">Camera Access Required</p>
            <p className="text-sm mt-1">
              Please allow camera access in your browser settings to scan QR codes.
            </p>
          </div>
          <button
            onClick={requestCameraPermission}
            disabled={isRequestingPermission}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRequestingPermission ? "Requesting Access..." : "Try Again"}
          </button>
        </div>
      )}

      {/* Scanner */}
      {scanning && permissionGranted && <div id="qr-reader" style={{ width: "100%" }} />}
      
      {/* Scanned Ticket - Awaiting Validation */}
      {scannedTicketId && !validationResult && (
        <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-500 rounded">
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xl font-bold text-yellow-800">Ticket Scanned</p>
          </div>
          <p className="mb-4 text-yellow-800">Please verify the ticket details below before validating.</p>
          
          <div className="flex space-x-4">
            <button
              onClick={handleValidate}
              disabled={isValidating}
              className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                isValidating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isValidating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validating...
                </span>
              ) : (
                'Validate Ticket'
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Scan Different Ticket
            </button>
          </div>
        </div>
      )}
      
      {/* Validation Results */}
      {validationResult && (
        <div className={`mt-4 p-4 rounded ${
          validationResult.success ? 'bg-green-100 text-green-800 border-2 border-green-500' : 'bg-red-100 text-red-800 border-2 border-red-500'
        }`}>
          <div className="flex items-center mb-4">
            {validationResult.success ? (
              <div className="flex items-center">
                <svg className="w-8 h-8 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xl font-bold">Valid Ticket</p>
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-8 h-8 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-xl font-bold">Invalid Ticket</p>
              </div>
            )}
          </div>

          <p className="font-bold mb-4">{validationResult.success ? validationResult.message : errorMessage}</p>

          {validationResult?.ticket && (
            <div className="mt-2 text-sm space-y-2 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-600">Event</p>
                  <p>{validationResult.ticket.event}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Ticket Type</p>
                  <p>{validationResult.ticket.type}</p>
                </div>
                {validationResult.ticket.buyerName && (
                  <div>
                    <p className="font-semibold text-gray-600">Attendee</p>
                    <p>{validationResult.ticket.buyerName}</p>
                  </div>
                )}
                {validationResult.ticket.buyerEmail && (
                  <div>
                    <p className="font-semibold text-gray-600">Email</p>
                    <p>{validationResult.ticket.buyerEmail}</p>
                  </div>
                )}
                {validationResult.ticket.purchasedAt && (
                  <div>
                    <p className="font-semibold text-gray-600">Purchased</p>
                    <p>{new Date(validationResult.ticket.purchasedAt).toLocaleDateString()}</p>
                  </div>
                )}
                {validationResult.ticket.status && !validationResult.success && (
                  <div>
                    <p className="font-semibold text-gray-600">Status</p>
                    <p className="uppercase font-medium">{validationResult.ticket.status}</p>
                  </div>
                )}
                {validationResult.ticket.usedAt && (
                  <div>
                    <p className="font-semibold text-gray-600">Used At</p>
                    <p>{new Date(validationResult.ticket.usedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Reset Button */}
      {!scanning && permissionGranted && (
        <button
          onClick={handleReset}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Scan Another Ticket
        </button>
      )}
    </div>
  );
}
