const https = require('https');
const fs = require('fs');
const url = require('url');

// Read SSL certificate and key for HTTPS
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

// Placeholder to store poll data
let pollDataStore = [];

// Create HTTPS server
https.createServer(options, (req, res) => {
    const { pathname } = url.parse(req.url, true);
    console.log('Request received:', pathname);

    if (pathname === '/submit-vote' && req.method === 'POST') {
        let body = '';

        // Collect incoming data chunks
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            console.log('Received body:', body); // Log the raw body
            try {
                const pollData = JSON.parse(body);

                if (!pollData || !pollData.votedFor) {
                    throw new Error('Invalid data received');
                }

                // Log and store the poll data
                console.log('Received poll data:', pollData);
                pollDataStore.push(pollData);

                // Send a success response
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Vote submitted successfully!' }));
            } catch (error) {
                console.error('Error processing request:', error.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Failed to process vote data.' }));
            }
        });
    } else {
        // Handle 404 for unknown routes
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '404: Endpoint not found' }));
    }
}).listen(4433, () => {
    console.log('Server running at https://localhost:4433');
});
