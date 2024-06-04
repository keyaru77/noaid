const express = require('express');
const cors = require('cors');
const scraper = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/ongoing', scraper.getOngoing);
app.get('/anime/:endpoint', scraper.getAnime);
app.get('/episode/:endpoint', scraper.getEpisode);
app.get('/search/:endpoint/:page', scraper.search);
app.get('/daftar/:page', scraper.getList);
app.get('/animeid/:genre/:season/:page', scraper.getGenreSeason);
app.get('/jadwal', scraper.getJadwal);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
