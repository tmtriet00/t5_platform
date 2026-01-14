import React, { useState, useEffect, useRef } from 'react';
import {
    ConfigProvider,
    theme,
    Layout,
    Card,
    Input,
    Button,
    Slider,
    Typography,
    Progress,
    Space,
    Alert,
    Spin,
    Row,
    Col,
    Tag
} from 'antd';
import {
    PlayCircleOutlined,
    StopOutlined,
    CameraOutlined,
    ScanOutlined,
    QrcodeOutlined,
    ThunderboltOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

// --- TYPES ---
interface Droplet {
    indices: number[];
    data: Uint8Array;
}

interface DecoderState {
    k: number;
    solved: (Uint8Array | null)[];
    droplets: Droplet[];
    chunkSize: number;
}

// --- EXTERNAL LIBRARY TYPES ---
type QRCodeInstance = {
    makeCode: (text: string) => void;
};

type Html5QrcodeInstance = {
    start: (
        cameraId: string | { facingMode: string },
        config: unknown,
        onSuccess: (decodedText: string) => void
    ) => Promise<void>;
    stop: () => Promise<void>;
    clear: () => void;
    isScanning: boolean;
};

declare global {
    interface Window {
        QRCode: {
            new(element: HTMLElement | null, options: unknown): QRCodeInstance;
            CorrectLevel: { L: number; M: number; Q: number; H: number };
        };
        Html5Qrcode: {
            new(elementId: string): Html5QrcodeInstance;
        };
    }
}

// --- UTILITIES ---
const mulberry32 = (a: number) => {
    return function () {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
};

const xorArrays = (a: Uint8Array, b: Uint8Array) => {
    const len = Math.min(a.length, b.length);
    const res = new Uint8Array(len);
    for (let i = 0; i < len; i++) res[i] = a[i] ^ b[i];
    return res;
};

// --- SCRIPT LOADER ---
const useScript = (src: string) => {
    const [status, setStatus] = useState(src ? "loading" : "idle");
    useEffect(() => {
        if (!src) { setStatus("idle"); return; }
        let script = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
        if (!script) {
            script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.setAttribute("data-status", "loading");
            document.body.appendChild(script);
            const setAttributeFromEvent = (event: Event) => {
                script?.setAttribute("data-status", event.type === "load" ? "ready" : "error");
                setStatus(event.type === "load" ? "ready" : "error");
            };
            script.addEventListener("load", setAttributeFromEvent);
            script.addEventListener("error", setAttributeFromEvent);
        } else {
            setStatus(script.getAttribute("data-status") || "idle");
        }
    }, [src]);
    return status;
};

export default function App() {
    // Load Libraries
    const qrLibStatus = useScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js");
    const scannerLibStatus = useScript("https://unpkg.com/html5-qrcode");
    const librariesReady = qrLibStatus === "ready" && scannerLibStatus === "ready";

    // --- TRANSMITTER STATE ---
    const [txText, setTxText] = useState("This is a Fountain Code (LT Code) test. It splits data into chunks, XORs them, and sprays them as droplets.");
    const [isTransmitting, setIsTransmitting] = useState(false);
    const [txFps, setTxFps] = useState(10);
    const [txStats, setTxStats] = useState("Idle");
    const qrRef = useRef<HTMLDivElement>(null);
    const txIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [qrCodeInstance, setQrCodeInstance] = useState<QRCodeInstance | null>(null);

    // --- RECEIVER STATE ---
    const [isScanning, setIsScanning] = useState(false);
    const [rxProgress, setRxProgress] = useState(0);
    const [rxSolvedCount, setRxSolvedCount] = useState(0);
    const [rxTotal, setRxTotal] = useState(0);
    const [rxOutput, setRxOutput] = useState("");
    const [rxStatus, setRxStatus] = useState("Waiting for signal...");
    const [cameraError, setCameraError] = useState("");

    // --- DECODER LOGIC ---
    const decoder = useRef<DecoderState>({
        k: 0,
        solved: [],
        droplets: [],
        chunkSize: 48
    });
    const scannerRef = useRef<Html5QrcodeInstance | null>(null);

    // --- TRANSMITTER FUNCTIONS ---
    const startTransmitter = () => {
        if (!txText.trim()) return;
        setIsTransmitting(true);

        // Prepare Data
        const encoder = new TextEncoder();
        const bytes = encoder.encode(txText);
        const CHUNK_SIZE = 48;
        const totalLen = Math.ceil(bytes.length / CHUNK_SIZE) * CHUNK_SIZE;
        const paddedBytes = new Uint8Array(totalLen);
        paddedBytes.set(bytes);

        const sourceBlocks: Uint8Array[] = [];
        for (let i = 0; i < totalLen; i += CHUNK_SIZE) {
            sourceBlocks.push(paddedBytes.slice(i, i + CHUNK_SIZE));
        }
        const K = sourceBlocks.length;

        // Initialize QR Lib if not already done
        let qr = qrCodeInstance;
        if (!qr && window.QRCode && qrRef.current) {
            // Clear previous content just in case
            qrRef.current.innerHTML = "";
            qr = new window.QRCode(qrRef.current, {
                text: "INIT",
                width: 220,
                height: 220,
                correctLevel: window.QRCode.CorrectLevel.L
            });
            setQrCodeInstance(qr);
        }

        let seq = 0;

        txIntervalRef.current = setInterval(() => {
            seq++;

            // 1. Header & RNG
            const seed = Math.floor(Math.random() * 999999);
            const rng = mulberry32(seed);

            // 2. Degree
            let degree = 1;
            const r = rng();
            if (r > 0.5 && K > 1) {
                degree = 2 + Math.floor(rng() * (K - 1));
            }

            // 3. Select Blocks
            const indices = [];
            const pool = Array.from({ length: K }, (_, i) => i);
            for (let i = 0; i < degree; i++) {
                const pick = Math.floor(rng() * pool.length);
                indices.push(pool[pick]);
                pool.splice(pick, 1);
            }

            // 4. XOR
            let mixed = new Uint8Array(CHUNK_SIZE);
            for (const idx of indices) {
                mixed = xorArrays(mixed, sourceBlocks[idx]);
            }

            // 5. Pack
            const b64 = btoa(String.fromCharCode(...mixed));
            const packet = `${K},${seed},${b64}`;

            if (qr) {
                qr.makeCode(packet);
            }

            setTxStats(`Seq: ${seq} | K: ${K} | Mixing: ${degree} blocks`);

        }, 1000 / txFps);
    };

    const stopTransmitter = () => {
        setIsTransmitting(false);
        if (txIntervalRef.current) clearInterval(txIntervalRef.current);
        setTxStats("Stopped");
    };

    // --- RECEIVER FUNCTIONS ---
    const initDecoder = (k: number) => {
        decoder.current = {
            k: k,
            solved: new Array(k).fill(null),
            droplets: [],
            chunkSize: 48
        };
        setRxTotal(k);
        setRxSolvedCount(0);
        setRxProgress(0);
        setRxOutput("");
    };

    const processQrPacket = (text: string) => {
        try {
            const parts = text.split(',');
            if (parts.length !== 3) return;

            const k = parseInt(parts[0]);
            const seed = parseInt(parts[1]);
            const binStr = atob(parts[2]);
            const data = new Uint8Array(binStr.length);
            for (let i = 0; i < binStr.length; i++) data[i] = binStr.charCodeAt(i);

            if (decoder.current.k === 0 || decoder.current.k !== k) {
                initDecoder(k);
            }

            const rng = mulberry32(seed);
            let degree = 1;
            const r = rng();
            if (r > 0.5 && k > 1) {
                degree = 2 + Math.floor(rng() * (k - 1));
            }
            const indices = [];
            const pool = Array.from({ length: k }, (_, i) => i);
            for (let i = 0; i < degree; i++) {
                const pick = Math.floor(rng() * pool.length);
                indices.push(pool[pick]);
                pool.splice(pick, 1);
            }

            solveDroplet(indices, data);
        } catch {
            // bad packet
        }
    };

    const solveDroplet = (indices: number[], data: Uint8Array) => {
        const dState = decoder.current;
        const unknownIndices = [];
        let cleanData = data;

        for (const idx of indices) {
            if (dState.solved[idx] !== null) {
                cleanData = xorArrays(cleanData, dState.solved[idx]);
            } else {
                unknownIndices.push(idx);
            }
        }

        if (unknownIndices.length === 0) return;

        dState.droplets.push({ indices: unknownIndices, data: cleanData });
        rippleSolve();
    };

    const rippleSolve = () => {
        const dState = decoder.current;
        let progress = true;

        while (progress) {
            progress = false;
            for (let i = 0; i < dState.droplets.length; i++) {
                const d = dState.droplets[i];
                if (d.indices.length === 1) {
                    const idx = d.indices[0];
                    if (dState.solved[idx] === null) {
                        dState.solved[idx] = d.data;
                        progress = true;
                        for (const other of dState.droplets) {
                            const pos = other.indices.indexOf(idx);
                            if (pos !== -1) {
                                other.data = xorArrays(other.data, d.data);
                                other.indices.splice(pos, 1);
                            }
                        }
                    }
                }
            }
            dState.droplets = dState.droplets.filter(d => d.indices.length > 0);
        }

        const solvedCount = dState.solved.filter(x => x !== null).length;
        setRxSolvedCount(solvedCount);
        if (dState.k > 0) setRxProgress(Math.floor((solvedCount / dState.k) * 100));

        if (solvedCount === dState.k && dState.k > 0) {
            reconstruct();
        }
    };

    const reconstruct = () => {
        const dState = decoder.current;
        const fullBytes = new Uint8Array(dState.k * dState.chunkSize);
        for (let i = 0; i < dState.k; i++) {
            const block = dState.solved[i];
            if (block) {
                fullBytes.set(block, i * dState.chunkSize);
            }
        }
        const decoderText = new TextDecoder().decode(fullBytes);
        setRxOutput(decoderText.replace(/\0/g, ''));
        setRxStatus("Decoding Complete!");
    };

    // --- CAMERA HANDLING ---
    const startCamera = () => {
        setCameraError("");
        const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
        if (!isSecure) {
            setCameraError("HTTPS Required for Camera access on mobile.");
            return;
        }

        if (!window.Html5Qrcode) return;

        // Ant Design Modal or pure div element check
        // We need to make sure the element exists before initializing
        if (!document.getElementById("reader")) return;

        const html5QrCode = new window.Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const config = { fps: 30, qrbox: { width: 250, height: 250 } };

        html5QrCode.start({ facingMode: "environment" }, config, (decodedText: string) => {
            processQrPacket(decodedText);
            setRxStatus("Receiving droplets...");
        }).then(() => {
            setIsScanning(true);
        }).catch((err: unknown) => {
            let msg = "Camera Error";
            if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === "NotAllowedError") {
                msg = "Permission Denied. Reset browser permissions.";
            }
            setCameraError(msg);
        });
    };

    const stopCamera = () => {
        const scanner = scannerRef.current;
        if (scanner) {
            scanner.stop().then(() => {
                scanner.clear();
                setIsScanning(false);
                setRxStatus("Scanner paused.");
            }).catch(console.error);
        }
    };

    useEffect(() => {
        return () => {
            if (txIntervalRef.current) clearInterval(txIntervalRef.current);
            const scanner = scannerRef.current;
            if (scanner && scanner.isScanning) {
                scanner.stop();
            }
        };
    }, []);


    // --- RENDER ---
    if (!librariesReady) {
        return (
            <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
                <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Space direction="vertical" align="center">
                        <Spin size="large" />
                        <Text>Loading Quantum Matrices...</Text>
                    </Space>
                </Layout>
            </ConfigProvider>
        );
    }

    return (
        <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: '#00b96b' } }}>
            <Layout style={{ minHeight: '100vh', padding: '20px' }}>
                <Header style={{ background: 'transparent', textAlign: 'center', height: 'auto', padding: '20px 0' }}>
                    <Space direction="vertical">
                        <Title level={2} style={{ margin: 0, color: '#00b96b' }}>
                            <ThunderboltOutlined /> Infinity Fountain
                        </Title>
                        <Text type="secondary">Unidirectional, loss-tolerant data streaming via QR</Text>
                    </Space>
                </Header>

                <Content style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                    <Row gutter={[24, 24]}>

                        {/* TRANSMITTER CARD */}
                        <Col xs={24} lg={12}>
                            <Card
                                title={<Space><QrcodeOutlined /> Transmitter</Space>}
                                bordered={false}
                                extra={isTransmitting ? <Tag color="green">LIVE</Tag> : <Tag>IDLE</Tag>}
                            >
                                <Space direction="vertical" style={{ width: '100%' }} size="middle">

                                    <div>
                                        <Text type="secondary">Payload Data</Text>
                                        <TextArea
                                            value={txText}
                                            onChange={(e) => setTxText(e.target.value)}
                                            disabled={isTransmitting}
                                            autoSize={{ minRows: 3, maxRows: 5 }}
                                            placeholder="Enter text to transmit..."
                                        />
                                    </div>

                                    <div>
                                        <Row justify="space-between" align="middle">
                                            <Text type="secondary">Transmission Speed</Text>
                                            <Text strong style={{ color: '#00b96b' }}>{txFps} FPS</Text>
                                        </Row>
                                        <Slider
                                            min={2}
                                            max={30}
                                            value={txFps}
                                            onChange={setTxFps}
                                            disabled={isTransmitting}
                                        />
                                    </div>

                                    {/* QR DISPLAY AREA */}
                                    <div
                                        style={{
                                            background: 'white',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            minHeight: '240px'
                                        }}
                                    >
                                        <div ref={qrRef}></div>
                                        {!isTransmitting && !qrRef.current?.innerHTML && (
                                            <Text style={{ color: '#ccc' }}>QR will appear here</Text>
                                        )}
                                    </div>

                                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', textAlign: 'center' }}>
                                        {txStats}
                                    </Text>

                                    {isTransmitting ? (
                                        <Button
                                            danger
                                            block
                                            size="large"
                                            icon={<StopOutlined />}
                                            onClick={stopTransmitter}
                                        >
                                            Stop Stream
                                        </Button>
                                    ) : (
                                        <Button
                                            type="primary"
                                            block
                                            size="large"
                                            icon={<PlayCircleOutlined />}
                                            onClick={startTransmitter}
                                        >
                                            Start Stream
                                        </Button>
                                    )}
                                </Space>
                            </Card>
                        </Col>

                        {/* RECEIVER CARD */}
                        <Col xs={24} lg={12}>
                            <Card
                                title={<Space><ScanOutlined /> Receiver</Space>}
                                bordered={false}
                            >
                                <Space direction="vertical" style={{ width: '100%' }} size="middle">

                                    {/* CAMERA VIEWPORT */}
                                    <div
                                        id="reader"
                                        style={{
                                            width: '100%',
                                            minHeight: '250px',
                                            background: '#000',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            position: 'relative'
                                        }}
                                    >
                                        {!isScanning && (
                                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#555' }}>
                                                <CameraOutlined style={{ fontSize: '48px' }} />
                                            </div>
                                        )}
                                    </div>

                                    {cameraError && (
                                        <Alert message={cameraError} type="error" showIcon />
                                    )}

                                    {!isScanning ? (
                                        <Button block onClick={startCamera} icon={<CameraOutlined />}>
                                            Activate Camera
                                        </Button>
                                    ) : (
                                        <Button block danger onClick={stopCamera} icon={<StopOutlined />}>
                                            Stop Camera
                                        </Button>
                                    )}

                                    {/* STATUS & PROGRESS */}
                                    <Card size="small" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Row justify="space-between">
                                                <Text type="secondary">Signal Status</Text>
                                                <Text>{rxStatus}</Text>
                                            </Row>

                                            <Progress
                                                percent={rxProgress}
                                                status={rxProgress === 100 ? 'success' : 'active'}
                                                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                                            />

                                            <Row justify="space-between" style={{ fontSize: '12px' }}>
                                                <Text type="secondary">Blocks Solved</Text>
                                                <Text>{rxSolvedCount} / {rxTotal || '?'}</Text>
                                            </Row>
                                        </Space>
                                    </Card>

                                    <div>
                                        <Text type="secondary">Reconstructed Output</Text>
                                        <TextArea
                                            readOnly
                                            value={rxOutput}
                                            placeholder="Waiting for complete transmission..."
                                            autoSize={{ minRows: 4, maxRows: 6 }}
                                            style={{ marginTop: '8px', fontFamily: 'monospace' }}
                                        />
                                    </div>

                                    {rxProgress === 100 && (
                                        <Alert
                                            message="Data Integrity Verified"
                                            type="success"
                                            showIcon
                                            icon={<SafetyCertificateOutlined />}
                                        />
                                    )}

                                </Space>
                            </Card>
                        </Col>

                    </Row>
                </Content>
            </Layout>
        </ConfigProvider>
    );
}