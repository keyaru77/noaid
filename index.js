const express = require('express');
const cors = require('cors');
const scraper = require('./scraper');

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

app.get('/ongoing', async (req, res) => {
    try {
        const data = await scraper.scrapeOngoing();
        res.json(data);
    } catch (error) {
        res.status(403).json({ error: 'Request rejected', message: error.message });
    }
});

app.get('/anime/:endpoint', async (req, res) => {
    try {
        const data = await scraper.scrapeAnime(req.params.endpoint);
        res.json(data);
    } catch (error) {
        res.status(403).json({ error: 'Request rejected', message: error.message });
    }
});

app.get('/episode/:endpoint', async (req, res) => {
    try {
        const data = await scraper.scrapeEpisode(req.params.endpoint);
        res.json(data);
    } catch (error) {
        res.status(403).json({ error: 'Request rejected', message: error.message });
    }
});

app.get('/search/:endpoint/:page', async (req, res) => {
    try {
        const data = await scraper.scrapeSearch(req.params.endpoint, req.params.page);
        res.json(data);
    } catch (error) {
        res.status(403).json({ error: 'Request rejected', message: error.message });
    }
});

app.get('/daftar/:page', async (req, res) => {
    try {
        const data = await scraper.scrapeList(req.params.page);
        res.json(data);
    } catch (error) {
        res.status(403).json({ error: 'Request rejected', message: error.message });
    }
});

app.get('/animeid/:genre/:season/:page', async (req, res) => {
    try {
        const data = await scraper.scrapeGenreSeason(req.params.genre, req.params.season, req.params.page);
        res.json(data);
    } catch (error) {
        res.status(403).json({ error: 'Request rejected', message: error.message });
    }
});

app.get('/jadwal', async (req, res) => {
    try {
        const data = await scraper.scrapeSchedule();
        res.json(data);
    } catch (error) {
        res.status(403).json({ error: 'Request rejected', message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
                              
