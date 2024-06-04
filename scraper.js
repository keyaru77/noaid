const axios = require('axios');
const cheerio = require('cheerio');

const headers = {
    'Origin': 'https://nontonanimeid.cyou',
    'Cookie': '_ga=GA1.2.826878888.1673844093; _gid=GA1.2.1599003702.1674031831; _gat=1',
    'Referer': 'https://nontonanimeid.cyou',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
};

const userAgents = [
    'Mozilla/5.0 (Android 10; Mobile; rv:101.0) Gecko/101.0 Firefox/101.0',
    'Mozilla/5.0 (Linux; Android 9; Mobile; rv:100.0) Gecko/100.0 Firefox/100.0',
    'Mozilla/5.0 (Android 8.1; Mobile; rv:98.0) Gecko/98.0 Firefox/98.0',
    'Mozilla/5.0 (Linux; Android 7.1.1; Mobile; rv:97.0) Gecko/97.0 Firefox/97.0',
    'Mozilla/5.0 (Linux; Android 6.0; Mobile; rv:96.0) Gecko/96.0 Firefox/96.0'
];

function getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function fetchData(url) {
    try {
        const response = await axios.get(url, { headers: { ...headers, 'User-Agent': getRandomUserAgent() } });
        return cheerio.load(response.data);
    } catch (error) {
        if (error.response && error.response.status === 403) {
            console.log('Access forbidden, retrying...');
            return fetchData(url);
        }
        throw error;
    }
}

async function getOngoing(req, res) {
    try {
        const url = 'https://nontonanimeid.cyou/';
        const $ = await fetchData(url);

        const ongoing = [];
        $('article.animeseries').each((i, element) => {
            const title = $(element).find('h3.title span').text();
            const link = $(element).find('a').attr('href');
            const img = $(element).find('img').attr('src');

            ongoing.push({ title, link, img });
        });

        res.json(ongoing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function search(req, res) {
    try {
        const { endpoint, page } = req.params;
        const url = `https://nontonanimeid.cyou/page/${page}/?s=${endpoint}`;
        const $ = await fetchData(url);

        const results = [];
        $('div.result li').each((i, element) => {
            const title = $(element).find('h2').text();
            const link = $(element).find('a').attr('href');
            const img = $(element).find('img').attr('src');
            const rating = $(element).find('.nilaiseries').text();
            const type = $(element).find('.typeseries').text();
            const genres = [];
            $(element).find('.genrebatas .genre').each((i, el) => {
                genres.push($(el).text());
            });

            results.push({ title, link, img, rating, type, genres });
        });

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getList(req, res) {
    try {
        const { page } = req.params;
        const url = `https://nontonanimeid.cyou/anime/page/${page}`;
        const $ = await fetchData(url);

        const list = [];
        $('div.result li').each((i, element) => {
            const title = $(element).find('h2').text();
            const link = $(element).find('a').attr('href');
            const img = $(element).find('img').attr('src');
            const rating = $(element).find('.nilaiseries').text();
            const type = $(element).find('.typeseries').text();
            const genres = [];
            $(element).find('.genrebatas .genre').each((i, el) => {
                genres.push($(el).text());
            });

            list.push({ title, link, img, rating, type, genres });
        });

        res.json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getGenreSeason(req, res) {
    try {
        const { genre, season, page } = req.params;
        let url;
        if (genre && season) {
            url = `https://nontonanimeid.cyou/anime/page/${page}/?mode=&sort=series_skor&status=&type=&genre%5B%5D=${genre}&season%5B%5D=${season}`;
        } else if (genre) {
            url = `https://nontonanimeid.cyou/anime/page/${page}/?mode=&sort=series_skor&status=&type=&genre%5B%5D=${genre}`;
        } else if (season) {
            url = `https://nontonanimeid.cyou/anime/page/${page}/?mode&sort=series_skor&status&type&season%5B0%5D=${season}`;
        }

        const $ = await fetchData(url);

        const results = [];
        $('div.result li').each((i, element) => {
            const title = $(element).find('h2').text();
            const link = $(element).find('a').attr('href');
            const img = $(element).find('img').attr('src');
            const rating = $(element).find('.nilaiseries').text();
            const type = $(element).find('.typeseries').text();
            const genres = [];
            $(element).find('.genrebatas .genre').each((i, el) => {
                genres.push($(el).text());
            });

            results.push({ title, link, img, rating, type, genres });
        });

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getJadwal(req, res) {
    try {
        const url = 'https://nontonanimeid.cyou/jadwal-rilis/';
        const $ = await fetchData(url);

        const jadwal = [];
        for (let i = 1; i <= 7; i++) {
            const day = $(`#tab-${i} .result li`).map((i, element) => {
                const title = $(element).find('h2').text();
                const link = $(element).find('a').attr('href');
                const img = $(element).find('img').attr('src');
                const totalEps = $(element).find('.epsright').text().trim();

                return { title, link, img, totalEps };
            }).get();

            jadwal.push(day);
        }

        res.json(jadwal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getAnime(req, res) {
    try {
        const { endpoint } = req.params;
        const url = `https://nontonanimeid.cyou/anime/${endpoint}`;
        const $ = await fetchData(url);

        const title = $('h1.entry-title').text().trim();
        const info = {};
        $('div.info-content ul li').each((i, element) => {
            const text = $(element).text();
            const [key, value] = text.split(':');
            if (key && value) {
                info[key.trim()] = value.trim();
            }
        });

        const episodes = [];
        $('div.episodelist ul li').each((i, element) => {
            const episodeTitle = $(element).find('h3.title').text().trim();
            const link = $(element).find('a').attr('href');

            episodes.push({ title: episodeTitle, link });
        });

        res.json({ title, info, episodes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getEpisode(req, res) {
    try {
        const { endpoint } = req.params;
        const url = `https://nontonanimeid.cyou/${endpoint}`;
        const $ = await fetchData(url);

        const title = $('h1.entry-title').text().trim();
        const videoLinks = [];
        $('div.player-embed iframe').each((i, element) => {
            const src = $(element).attr('src');
            videoLinks.push(src);
        });

        res.json({ title, videoLinks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getOngoing,
    search,
    getList,
    getGenreSeason,
    getJadwal,
    getAnime,
    getEpisode
};
