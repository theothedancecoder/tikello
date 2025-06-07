import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode, QrcodeErrorCallback } from "html5-qrcode";

interface TicketScannerProps {
  eventId: string;
}

type QRScannerConfig = {
  fps: number;
  qrbox: { width: number; height: number };
  aspectRatio: number;
};

interface ValidationResult {
  success: boolean;
  message: string;
  ticket?: {
    event?: string;
    type?: string;
    status?: string;
    purchasedAt?: string;
    usedAt?: string;
    amount?: number;
  };
}

export default function TicketScanner({ eventId }: TicketScannerProps): React.ReactElement {
  const [scanning, setScanning] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [scannedTicketId, setScannedTicketId] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const html5QrcodeScannerRef = useRef<Html5Qrcode | null>(null);

  const requestCameraPermission = async () => {
    setIsRequestingPermission(true);
    try {
      console.log("Requesting camera permission...");
      
      // First check if permissions API is available
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        console.log("Permission status:", result.state);
        
        if (result.state === 'denied') {
          throw new Error('Camera permission has been denied. Please enable it in your browser settings.');
        }
      }

      // Try to get camera access
      console.log("Attempting to access camera...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: 'environment' // Prefer back camera
        } 
      });
      
      console.log("Camera access granted, checking devices...");
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log("Available video devices:", videoDevices);

      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      
      console.log("Camera permission granted successfully");
      setPermissionGranted(true);
      setScanning(true);
    } catch (error) {
      console.error("Camera permission error:", error);
      let errorMessage = "Failed to access camera. ";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage += "Camera access was denied. Please allow camera access in your browser settings.";
        } else if (error.name === 'NotFoundError') {
          errorMessage += "No camera was found on your device.";
        } else if (error.name === 'NotReadableError') {
          errorMessage += "Camera is already in use by another application.";
        } else {
          errorMessage += error.message;
        }
      }
      
      setErrorMessage(errorMessage);
      setPermissionGranted(false);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeScanner = async () => {
      try {
        // Clean up any existing scanner
        if (html5QrcodeScannerRef.current) {
          await html5QrcodeScannerRef.current.stop();
          html5QrcodeScannerRef.current = null;
        }

        // Get available cameras
        const devices = await Html5Qrcode.getCameras();
        
        if (!devices || devices.length === 0) {
          throw new Error("No camera found on this device");
        }

        // Configure scanner
        const minDimension = Math.min(window.innerWidth, window.innerHeight);
        const qrboxSize = Math.min(250, minDimension * 0.7);
        
        const config = {
          fps: 10,
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0
        };

        // Create scanner with verbose logging for debugging
        const html5QrcodeScanner = new Html5Qrcode("qr-reader", { verbose: true });
        html5QrcodeScannerRef.current = html5QrcodeScanner;
        console.log("Scanner created successfully");

        const onScanSuccess = (decodedText: string) => {
          if (!mounted) return;
          setScanning(false);
          setErrorMessage(null);
          setScannedTicketId(decodedText);
        };

        const onScanError = (errorMessage: string) => {
          if (!mounted) return;
          // Only handle critical errors
          if (errorMessage.includes('NotFound') || errorMessage.includes('NotAllowed')) {
            setErrorMessage("Camera access was lost. Please try again.");
            setScanning(false);
          }
        };

        // Try to start with back camera first
        try {
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear')
          );
          
          console.log("Available cameras:", devices.map(d => ({ id: d.id, label: d.label })));
          console.log("Back camera found:", backCamera);
          
          if (backCamera) {
            console.log("Starting scanner with back camera:", backCamera.id);
            await html5QrcodeScanner.start(
              { deviceId: backCamera.id },
              config,
              onScanSuccess,
              onScanError
            );
            
            console.log("Back camera started successfully");
            // Set camera ready after a short delay to ensure video is loaded
            setTimeout(() => {
              if (mounted) {
                console.log("Setting camera ready to true");
                setIsCameraReady(true);
              }
            }, 1000);
            return;
          }
        } catch (error) {
          console.error("Failed to start with back camera:", error);
          console.log("Trying default camera");
        }

        // If back camera fails or isn't found, try the first available camera
        console.log("Starting scanner with first available camera:", devices[0].id);
        await html5QrcodeScanner.start(
          { deviceId: devices[0].id },
          config,
          onScanSuccess,
          onScanError
        );

        console.log("Default camera started successfully");
        // Set camera ready after a short delay to ensure video is loaded
        setTimeout(() => {
          if (mounted) {
            console.log("Setting camera ready to true (default camera)");
            setIsCameraReady(true);
          }
        }, 1000);

      } catch (err) {
        console.error("Scanner initialization error:", err);
        if (mounted) {
          setPermissionGranted(false);
          setErrorMessage(err instanceof Error ? err.message : "Failed to initialize camera");
          setScanning(false);
        }
      }
    };

    if (scanning && permissionGranted) {
      initializeScanner();
    }

    return () => {
      mounted = false;
      setIsCameraReady(false);
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.stop().catch(() => {});
        html5QrcodeScannerRef.current = null;
      }
    };
  }, [scanning, permissionGranted]);

  const handleValidate = async () => {
    if (!scannedTicketId) return;
    
    setIsValidating(true);
    setErrorMessage(null);
    setValidationResult(null);
    
    try {
      if (!eventId) {
        throw new Error("Event ID is missing. Please refresh the page and try again.");
      }

      const response = await fetch("/api/validate-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          ticketId: scannedTicketId,
          eventId: eventId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Server error (${response.status}). Please try again.`
        );
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }

      setValidationResult(result);
      setScannedTicketId(null);
      
    } catch (error) {
      console.error("Validation error:", error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleReset = () => {
    setScannedTicketId(null);
    setErrorMessage(null);
    setValidationResult(null);
    setIsCameraReady(false);
    setScanning(true);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Ticket QR Code Scanner</h2>
      
      {/* Camera Permission States */}
      {permissionGranted === null && (
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border-2 border-blue-100">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Camera Access Required</h3>
            <p className="text-gray-600 mb-4">
              To scan QR codes, we need permission to use your camera. Your camera will only be used while scanning tickets.
            </p>
          </div>
          <button
            onClick={requestCameraPermission}
            disabled={isRequestingPermission}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRequestingPermission ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Requesting Access...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Enable Camera</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Camera Permission Denied */}
      {permissionGranted === false && (
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border-2 border-yellow-200">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Camera Access Denied</h3>
            <p className="text-gray-600 mb-4">
              Please allow camera access in your browser settings to scan QR codes. You may need to click the camera icon in your browser's address bar.
            </p>
          </div>
          <button
            onClick={requestCameraPermission}
            disabled={isRequestingPermission}
            className="w-full sm:w-auto px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRequestingPermission ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Requesting Access...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Try Again</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Scanner */}
      {scanning && permissionGranted && (
        <div className="relative">
          <div id="qr-reader" className="w-full rounded-lg overflow-hidden border-2 border-blue-200">
            <style jsx>{`
              #qr-reader video {
                width: 100% !important;
                height: auto !important;
                min-height: 300px;
                object-fit: cover;
              }
              #qr-reader__scan_region {
                background: transparent !important;
              }
              #qr-reader__scan_region > img {
                display: none !important;
              }
              #qr-reader__dashboard {
                padding: 0 !important;
              }
            `}</style>
          </div>
          {!isCameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
              <div className="text-center p-4 bg-black bg-opacity-75 rounded-lg">
                <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Initializing camera...</p>
              </div>
            </div>
          )}
          {isCameraReady && (
            <div className="absolute top-2 left-2 right-2 text-center">
              <div className="inline-block bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                Position QR code within frame
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Scanned Ticket - Awaiting Validation */}
      {scannedTicketId && !validationResult && (
        <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-500 rounded">
          <p className="font-medium mb-2">QR Code Scanned</p>
          <p className="text-sm text-gray-600 mb-4">Validating ticket...</p>
          <button
            onClick={handleValidate}
            disabled={isValidating}
            className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            {isValidating ? "Validating..." : "Validate Ticket"}
          </button>
        </div>
      )}

      {/* Error Display */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg border-2 border-red-400 shadow-sm">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold text-red-700">Error</p>
          </div>
          <p className="ml-7">{errorMessage}</p>
          <button
            onClick={() => {
              setErrorMessage(null);
              setScanning(true);
            }}
            className="ml-7 mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
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

          <p className="font-bold mb-4">{validationResult.message}</p>

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
                {validationResult.ticket.status && (
                  <div>
                    <p className="font-semibold text-gray-600">Status</p>
                    <p className={`uppercase font-medium ${
                      validationResult.ticket.status === 'used' ? 'text-red-600' : 
                      validationResult.ticket.status === 'valid' ? 'text-green-600' : 
                      'text-gray-600'
                    }`}>
                      {validationResult.ticket.status}
                    </p>
                  </div>
                )}
                {validationResult.ticket.usedAt && (
                  <div>
                    <p className="font-semibold text-gray-600">Used At</p>
                    <p className="text-red-600">{new Date(validationResult.ticket.usedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleReset}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Scan Another Ticket
          </button>
        </div>
      )}
    </div>
  );
}
