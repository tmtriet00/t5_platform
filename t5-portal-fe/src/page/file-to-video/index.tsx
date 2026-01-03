import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Upload, Alert, Spin, message } from 'antd';
import { UploadOutlined, VideoCameraOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

// Define the Emscripten Module interface
interface CimbarModule {
    onRuntimeInitialized: () => void;
    locateFile: (path: string) => string;
    canvas: HTMLCanvasElement | null;
    _cimbare_init_encode: (namePtr: number, nameLen: number, ecc: number) => number;
    _cimbare_encode: (dataPtr: number, dataLen: number) => number;
    _cimbare_encode_bufsize: () => number;
    _cimbare_render: () => void;
    _cimbare_next_frame: () => number; // Returns frame count
    _cimbare_configure: (mode: number, ecc: number) => void;
    _cimbare_get_aspect_ratio: () => number;
    _cimbare_rotate_window: (rotate: boolean) => void;
    _malloc: (size: number) => number;
    _free: (ptr: number) => void;
    HEAPU8: Uint8Array;
}

declare global {
    interface Window {
        Module: CimbarModule;
    }
}

const FileToVideoPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [converting, setConverting] = useState(false);
    const [cimbarLoaded, setCimbarLoaded] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        // 1. Setup global Module object for Emscripten
        window.Module = {
            onRuntimeInitialized: () => {
                console.log("Cimbar WASM Runtime Initialized");
                setCimbarLoaded(true);
                // Initialize config as per Main.init -> setMode('B')
                if (window.Module._cimbare_configure) {
                    // Mode 'B' -> 68. ECC -> -1 (default)
                    window.Module._cimbare_configure(68, -1);
                    console.log("Cimbar configured to Mode B");

                    // Initial resize/setup
                    if (window.Module.canvas) {
                        const ratio = window.Module._cimbare_get_aspect_ratio();
                        // A simple resize check to ensure internal state is consistent
                        window.Module._cimbare_rotate_window(false);
                    }
                }
            },
            locateFile: (path) => {
                if (path.endsWith('.wasm')) {
                    return '/cimbar/cimbar_js.2025-10-13T0307.wasm';
                }
                return path;
            },
            canvas: null, // Will be set ref
            // Placeholder functions to satisfy TS if referenced before load (though logic prevents this)
            _cimbare_init_encode: () => 0,
            _cimbare_encode: () => 0,
            _cimbare_encode_bufsize: () => 0,
            _cimbare_render: () => { },
            _cimbare_next_frame: () => 0,
            _cimbare_configure: () => { },
            _cimbare_get_aspect_ratio: () => 1,
            _cimbare_rotate_window: () => { },
            _malloc: () => 0,
            _free: () => { },
            HEAPU8: new Uint8Array(0),
        };

        // 2. Load the JS glue code
        const script = document.createElement('script');
        script.src = '/cimbar/cimbar_js.2025-10-13T0307.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Cleanup
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            // We don't remove the script because Module is global and might be used again or cause errors if reloading
            // But for clean unmounting we can try. Emscripten usually doesn't like being reloaded.
        };
    }, []);

    // Update Module.canvas when ref is available
    useEffect(() => {
        if (canvasRef.current && window.Module) {
            window.Module.canvas = canvasRef.current;
            canvasRef.current.style.backgroundColor = 'black';
        }
    }, [cimbarLoaded]);


    const copyToWasmHeap = (str: string) => {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(str);
        const ptr = window.Module._malloc(encoded.length + 1); // +1 for null terminator if needed, but safe to have
        const heapBytes = new Uint8Array(window.Module.HEAPU8.buffer, ptr, encoded.length + 1);
        heapBytes.set(encoded);
        heapBytes[encoded.length] = 0; // null terminate
        return { ptr, len: encoded.length };
    };

    const startConversion = async () => {
        if (!file || !cimbarLoaded || !canvasRef.current) return;
        setConverting(true);

        try {
            // 1. Configure and Init
            window.Module.canvas = canvasRef.current;

            window.Module._cimbare_configure(68, -1);
            const ratio = window.Module._cimbare_get_aspect_ratio();
            console.log("Aspect Ratio:", ratio);

            const width = canvasRef.current.clientWidth || 800;
            const height = canvasRef.current.clientHeight || 600;
            const needRotate = ratio > 1 && height > width;
            window.Module._cimbare_rotate_window(needRotate);

            // 2. Initialize Encoder
            console.log("Initializing encoder for:", file.name);
            const wasmFn = copyToWasmHeap(file.name);
            // Init encode takes (ptr, len, ecc). Main passes -1 for ecc.
            const initRes = window.Module._cimbare_init_encode(wasmFn.ptr, wasmFn.len, -1);
            window.Module._free(wasmFn.ptr);
            console.log("Init Code returned:", initRes);

            // 3. Prepare Buffer
            const chunkSize = window.Module._cimbare_encode_bufsize();
            const compressBuffPtr = window.Module._malloc(chunkSize);

            // 4. Read File and Encode in Chunks
            const reader = new FileReader();
            let offset = 0;

            const readNextChunk = () => {
                if (offset >= file.size) {
                    // Done reading, flush with 0 length
                    console.log("Finished reading. Flushing...");
                    window.Module._cimbare_encode(compressBuffPtr, 0);
                    window.Module._free(compressBuffPtr);

                    // Start the visual loop
                    startRenderLoop();
                    return;
                }

                const slice = file.slice(offset, offset + chunkSize);
                reader.readAsArrayBuffer(slice);
            };

            reader.onload = (e) => {
                const res = e.target?.result as ArrayBuffer;
                if (res && res.byteLength > 0) {
                    const uint8View = new Uint8Array(res);

                    // Re-acquire HEAPU8 view as buffer might have detached/grown
                    const heapView = new Uint8Array(window.Module.HEAPU8.buffer, compressBuffPtr, chunkSize);
                    heapView.set(uint8View);

                    const frameRes = window.Module._cimbare_encode(compressBuffPtr, res.byteLength);

                    offset += chunkSize;
                    readNextChunk();
                }
            };

            // Start reading
            readNextChunk();

        } catch (e) {
            console.error("Conversion failed:", e);
            setConverting(false);
            message.error("Conversion failed");
        }
    };

    const startRenderLoop = () => {
        // Clear any existing loop
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        console.log("Starting Render Loop");

        // Main.js uses 66ms (approx 15 FPS)
        const interval = 66;

        const tick = () => {
            if (!canvasRef.current) return;

            window.Module._cimbare_render();
            const frames = window.Module._cimbare_next_frame();

            timeoutRef.current = setTimeout(() => {
                requestRef.current = requestAnimationFrame(tick);
            }, interval);
        };

        tick();
    };

    const stopConversion = () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setConverting(false);
    };

    const handleFileChange = (info: any) => {
        if (info.file.status === 'done' || info.file.status === 'error' || info.file) {
            if (info.file instanceof File) {
                setFile(info.file);
            } else if (info.file.originFileObj) {
                setFile(info.file.originFileObj);
            }
        }
    };

    const dummyRequest = ({ file, onSuccess }: any) => {
        setTimeout(() => {
            onSuccess("ok");
        }, 0);
    };

    return (
        <div className="p-6">
            <Card title="Cimbar File to Video" className="max-w-3xl mx-auto">
                {!cimbarLoaded && <Alert message="Loading Cimbar Core..." type="info" showIcon className="mb-4" />}

                <div className="mb-6">
                    <Upload
                        customRequest={dummyRequest}
                        onChange={handleFileChange}
                        maxCount={1}
                        showUploadList={true}
                    >
                        <Button icon={<UploadOutlined />}>Select File</Button>
                    </Upload>
                </div>

                <div className="mb-4 flex gap-4">
                    <Button
                        type="primary"
                        icon={<VideoCameraOutlined />}
                        onClick={startConversion}
                        disabled={!file || !cimbarLoaded || converting}
                        loading={converting && !cimbarLoaded}
                    >
                        Convert to Video
                    </Button>

                    {converting && (
                        <Button onClick={stopConversion} danger>
                            Stop
                        </Button>
                    )}
                </div>

                <div className="border border-gray-300 rounded bg-black flex justify-center items-center overflow-hidden" style={{ minHeight: '400px' }}>
                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={600}
                        className="max-w-full h-auto"
                        style={{ imageRendering: 'pixelated' }}
                    />
                </div>

                <Alert
                    message="Experimental Feature"
                    description="This uses WebAssembly to encode files into a Cimbar video stream locally."
                    type="warning"
                    showIcon
                    className="mt-4"
                />
            </Card>
        </div>
    );
};

export default FileToVideoPage;
