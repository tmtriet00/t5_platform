export async function onRequest(context) {
    const country = context.request.cf.country;
    const ipAddress = context.request.headers.get("CF-Connecting-IP");

    const isValidCountry = country === 'SG' || country === 'VN';
    const isValidIP = ["45.77.37.89", "207.148.126.146"].includes(ipAddress);

    if (isValidCountry && isValidIP) {
        return context.next();
    }

    if (country == 'VN') {
        const html = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Infinity Fountain QR (Cimbar Style)</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <script src="https://unpkg.com/html5-qrcode" type="text/javascript"></script>
    <style>
        body {
            font-family: monospace;
            max-width: 800px;
            margin: auto;
            padding: 20px;
            background: #1a1a1a;
            color: #0f0;
        }

        .box {
            background: #000;
            padding: 20px;
            border: 1px solid #333;
            margin-bottom: 20px;
            border-radius: 4px;
        }

        h2 {
            border-bottom: 1px solid #0f0;
            padding-bottom: 5px;
        }

        textarea {
            width: 100%;
            height: 80px;
            background: #111;
            color: #0f0;
            border: 1px solid #333;
            font-family: monospace;
        }

        button {
            background: #004400;
            color: #0f0;
            border: 1px solid #0f0;
            padding: 10px 20px;
            cursor: pointer;
            text-transform: uppercase;
        }

        button:hover {
            background: #0f0;
            color: #000;
        }

        button:disabled {
            border-color: #555;
            color: #555;
            background: #222;
            cursor: not-allowed;
        }

        #qr-display {
            margin: 20px auto;
            display: flex;
            justify-content: center;
            border: 5px solid #fff;
            padding: 10px;
            background: #fff;
            width: fit-content;
        }

        .bar-container {
            width: 100%;
            background: #333;
            height: 25px;
            margin-top: 10px;
            position: relative;
        }

        .bar-fill {
            height: 100%;
            background: #0f0;
            width: 0%;
            transition: width 0.3s;
        }

        .stats {
            margin-top: 5px;
            font-size: 12px;
            opacity: 0.8;
        }

        /* The matrix effect overlay */
        .solved-block {
            display: inline-block;
            width: 10px;
            height: 10px;
            background: #004400;
            margin: 1px;
        }

        .solved-block.done {
            background: #0f0;
            box-shadow: 0 0 5px #0f0;
        }
    </style>
</head>

<body>

    <h1>♾️ Infinite Fountain Stream</h1>
    <p>Sender generates infinite unique "droplets". Receiver catches any.</p>

    <div class="box">
        <h2>1. Transmitter</h2>
        <textarea id="txInput"
            placeholder="Enter data...">This uses a custom Luby Transform (LT) Code implementation. It XORs random blocks together. The receiver peels them apart like layers of an onion.</textarea>
        <div style="margin-top:10px">
            <label>FPS: <input type="range" id="fpsRange" min="5" max="30" value="15"></label> <span
                id="fpsVal">15</span>
        </div>
        <br>
        <button id="btnStartTx">Start Infinite Stream</button>
        <button id="btnStopTx">Stop</button>

        <div id="qr-display"></div>
        <div class="stats" id="txStats">Idle</div>
    </div>

    <div class="box">
        <h2>2. Receiver</h2>
        <div id="reader" style="width:100%; height:300px; background:#222;"></div>
        <button id="btnScan">Activate Camera</button>
        <div class="bar-container">
            <div id="rxBar" class="bar-fill"></div>
        </div>
        <div class="stats" id="rxStats">Waiting for signal...</div>
        <div id="blockVis" style="margin-top:10px; line-height: 0;"></div>

        <h3>Decoded Output:</h3>
        <textarea id="rxOutput" readonly placeholder="Result appears here..."></textarea>
    </div>

    <script>
        // --- UTILITIES: SEEDED RANDOM ---
        // We need a PRNG so Sender and Receiver generate the SAME "random" mix for a given seed.
        function mulberry32(a) {
            return function () {
                var t = a += 0x6D2B79F5;
                t = Math.imul(t ^ (t >>> 15), t | 1);
                t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
            }
        }

        // --- XOR HELPERS ---
        // XOR two byte arrays (must be same length)
        function xorArrays(a, b) {
            const len = Math.min(a.length, b.length);
            const res = new Uint8Array(len);
            for (let i = 0; i < len; i++) res[i] = a[i] ^ b[i];
            return res;
        }

        // Convert string to Uint8Array
        function strToBytes(str) {
            return new TextEncoder().encode(str);
        }
        // Convert Uint8Array to string
        function bytesToStr(arr) {
            return new TextDecoder().decode(arr);
        }

        // --- FOUNTAIN LOGIC ---
        const CHUNK_SIZE = 64; // Small chunks for demo speed

        // SENDER STATE
        let sourceBlocks = [];
        let txInterval = null;

        document.getElementById('fpsRange').oninput = e => document.getElementById('fpsVal').innerText = e.target.value;

        document.getElementById('btnStartTx').addEventListener('click', () => {
            const text = document.getElementById('txInput').value;
            const bytes = strToBytes(text);

            // 1. Pad data to fit perfectly into chunks
            const totalLen = Math.ceil(bytes.length / CHUNK_SIZE) * CHUNK_SIZE;
            const paddedBytes = new Uint8Array(totalLen);
            paddedBytes.set(bytes);

            // 2. Split into Source Blocks
            sourceBlocks = [];
            for (let i = 0; i < totalLen; i += CHUNK_SIZE) {
                sourceBlocks.push(paddedBytes.slice(i, i + CHUNK_SIZE));
            }

            const K = sourceBlocks.length;
            let seq = 0;

            clearInterval(txInterval);
            const fps = parseInt(document.getElementById('fpsRange').value);

            txInterval = setInterval(() => {
                seq++;
                // Generate a Droplet
                // A droplet is: Seed | XOR'd Data
                // Ideally we use a "Robust Soliton Distribution", but for this demo 
                // we use a simplified random degree approach.

                const seed = Math.floor(Math.random() * 999999);
                const rng = mulberry32(seed);

                // Determine degree (how many blocks to mix). 
                // Bias towards 1 (to start decoding) but include high numbers (to propagate info).
                let degree = 1;
                const r = rng();
                if (r > 0.5) degree = 2 + Math.floor(rng() * (K - 1)); // Mix of 2 to K blocks

                // Pick indices
                let indices = [];
                let indicesPool = Array.from({ length: K }, (_, i) => i); // [0,1,2...K]

                // Fisher-Yates shuffle to pick random unique indices
                for (let i = 0; i < degree; i++) {
                    const pick = Math.floor(rng() * indicesPool.length);
                    indices.push(indicesPool[pick]);
                    indicesPool.splice(pick, 1);
                }

                // XOR the chosen blocks
                let mix = new Uint8Array(CHUNK_SIZE); // Zeros
                for (let idx of indices) {
                    mix = xorArrays(mix, sourceBlocks[idx]);
                }

                // ENCODE TO BASE64 for QR
                // Protocol: K,Seed,Base64Payload
                // We need K (Total Blocks) to init receiver
                const b64Data = btoa(String.fromCharCode(...mix));
                const qrData = \`\${K},\${seed},\${b64Data}\`;

                // Render
                const qrDiv = document.getElementById('qr-display');
                qrDiv.innerHTML = "";
                new QRCode(qrDiv, {
                    text: qrData,
                    width: 250,
                    height: 250,
                    correctLevel: QRCode.CorrectLevel.L // Low ECC because Fountain code handles packet loss naturally
                });

                document.getElementById('txStats').innerText = \`Broadcasting Droplet #\${seq}. Degree: \${degree}. Total Blocks: \${K}\`;

            }, 1000 / fps);
        });

        document.getElementById('btnStopTx').addEventListener('click', () => clearInterval(txInterval));


        // --- RECEIVER LOGIC (The Peeling Decoder) ---
        // We store received droplets.
        // If a droplet has Degree 1 (contains only 1 source block), we SOLVE that block.
        // Then we look at all other droplets. If they contained that block, we XOR it out (Peeling).
        // This reduces their degree. If they become Degree 1, we repeat the ripple.

        let rxK = 0;
        let rxSolved = []; // Array of Uint8Array or null
        let rxDroplets = []; // List of { indices: [], data: Uint8Array }
        let isScanning = false;
        let scanner = null;

        function initRx(k) {
            if (rxK === k) return; // Already init
            rxK = k;
            rxSolved = new Array(k).fill(null);
            rxDroplets = [];

            // UI: Draw grid
            const vis = document.getElementById('blockVis');
            vis.innerHTML = '';
            for (let i = 0; i < k; i++) {
                let d = document.createElement('div');
                d.className = 'solved-block';
                d.id = 'blk-' + i;
                vis.appendChild(d);
            }
        }

        function processDroplet(k, seed, dataBytes) {
            initRx(k);

            // Reconstruct indices using same PRNG
            const rng = mulberry32(seed);
            let degree = 1;
            const r = rng();
            if (r > 0.5) degree = 2 + Math.floor(rng() * (rxK - 1));

            let indices = [];
            let indicesPool = Array.from({ length: rxK }, (_, i) => i);
            for (let i = 0; i < degree; i++) {
                const pick = Math.floor(rng() * indicesPool.length);
                indices.push(indicesPool[pick]);
                indicesPool.splice(pick, 1);
            }

            // 1. SIMPLIFICATION (Peeling): 
            // Before adding, remove any blocks we have ALREADY solved from this new droplet.
            let cleanIndices = [];
            let cleanData = dataBytes;

            for (let idx of indices) {
                if (rxSolved[idx] !== null) {
                    // We know this part! XOR it out.
                    cleanData = xorArrays(cleanData, rxSolved[idx]);
                } else {
                    cleanIndices.push(idx);
                }
            }

            // If no unknown indices left, this droplet is useless (redundant).
            if (cleanIndices.length === 0) return;

            // Add to our pool
            const droplet = { indices: cleanIndices, data: cleanData };
            rxDroplets.push(droplet);

            // 2. CHECK FOR SOLVABLE DROPLETS (Degree 1)
            propagateSolves();
        }

        function propagateSolves() {
            let progress = true;
            while (progress) {
                progress = false;

                // Find a droplet with exactly 1 unknown index
                for (let i = 0; i < rxDroplets.length; i++) {
                    const d = rxDroplets[i];
                    if (d.indices.length === 1) {
                        // EUREKA! We solved a block.
                        const solvedIdx = d.indices[0];
                        const solvedData = d.data;

                        if (rxSolved[solvedIdx] === null) {
                            rxSolved[solvedIdx] = solvedData;

                            // Update UI
                            document.getElementById('blk-' + solvedIdx).classList.add('done');
                            updateProgress();

                            // Now "Peel" this solved block out of ALL other droplets
                            for (let j = 0; j < rxDroplets.length; j++) {
                                const other = rxDroplets[j];
                                const idxPos = other.indices.indexOf(solvedIdx);
                                if (idxPos !== -1) {
                                    // XOR out the solved part
                                    other.data = xorArrays(other.data, solvedData);
                                    // Remove the index
                                    other.indices.splice(idxPos, 1);
                                }
                            }

                            // We made a change, so loop again to see if new things became Degree 1
                            progress = true;
                        }
                    }
                }

                // Cleanup: Remove empty droplets
                rxDroplets = rxDroplets.filter(d => d.indices.length > 0);
            }
        }

        function updateProgress() {
            const solvedCount = rxSolved.filter(x => x !== null).length;
            const pct = (solvedCount / rxK) * 100;
            document.getElementById('rxBar').style.width = pct + "%";
            document.getElementById('rxStats').innerText = \`Solved: \${solvedCount} / \${rxK} blocks\`;

        if (solvedCount === rxK) {
            // DONE! Reassemble
            let fullBytes = new Uint8Array(rxK * CHUNK_SIZE);
            for (let i = 0; i < rxK; i++) {
                fullBytes.set(rxSolved[i], i * CHUNK_SIZE);
            }
            // Strip null bytes (padding) could be done here, but usually text decoder handles it ok
            // or we find the null terminator.
            let str = bytesToStr(fullBytes);
            // Remove trailing nulls
            str = str.replace(/\0/g, '');
            document.getElementById('rxOutput').value = str;
            document.getElementById('rxBar').style.background = '#0f0'; // bright green
        }
    }

    document.getElementById('btnScan').addEventListener('click', () => {
        if (scanner) return;
        scanner = new Html5Qrcode("reader");
        scanner.start({ facingMode: "environment" }, { fps: 30 }, (text) => {
            // Decode QR format: K,Seed,Base64
            try {
                const parts = text.split(',');
                if (parts.length !== 3) return;
                const k = parseInt(parts[0]);
                const seed = parseInt(parts[1]);
                const data = Uint8Array.from(atob(parts[2]), c => c.charCodeAt(0));

                processDroplet(k, seed, data);
            } catch (e) { console.error(e); }
        });
    });

    </script >
</body >

</html > `;

        return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
        });
    }

    return new Response(`
    Sorry, this application is not available to you.
        Country: ${country}
    IP: ${ipAddress}
    `, {
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
    });
}