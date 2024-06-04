const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = 'https://nontonanimeid.cyou/';

const headers = {
    'Origin': baseUrl,
    'Referer': baseUrl,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

async function fetchData(url) {
    try {
        const { data } = await axios.get(url, { headers });
        return cheerio.load(data);
    } catch (error) {
        throw new Error(error.message);
    }
}

async function scrapeOngoing() {
    const $ = await fetchData(baseUrl);
    const result = [];
    $('article.animeseries').each((i, element) => {
        const title = $(element).find('h3.title span').text();
        const link = $(element).find('a').attr('href');
        const img = $(element).find('img').attr('src');
        result.push({ title, link, img });
    });
    return result;
}

async function scrapeAnime(endpoint) {
    const $ = await fetchData(`${baseUrl}anime/${endpoint}`);
    const title = $('h1.entry-title.cs').text();
    const imgSrc = $('.poster img').attr('src');
    const spans = $('.extra span').toArray().map(span => $(span).text());
    const score = $('.scoreseries .nilaiseries').text();
    const type = $('.scoreseries .typeseries').text();
    const episodes = $('.latestest .latestheader').toArray().map(header => ({
        episode: $(header).text(),
        link: $(header).find('a').attr('href')
    }));
    const tags = $('.tagline rel').toArray().map(rel => $(rel).text());
    const trailer = $('[data-fancybox]').attr('href');
    const description = $('.seriesdesc h2.bold').text();
    const episodesList = $('.episodelist li').toArray().map(li => ({
        title: $(li).find('.t1 a').text(),
        link: $(li).find('.t1 a').attr('href'),
        date: $(li).find('.t3').text()
    }));
    const related = $('#related-series li').toArray().map(li => ({
        title: $(li).find('h3').text(),
        link: $(li).find('a').attr('href'),
        img: $(li).find('img').attr('src'),
        description: $(li).find('p').text()
    }));
    return { title, imgSrc, spans, score, type, episodes, tags, trailer, description, episodesList, related };
}

async function scrapeEpisode(endpoint) {
    const $ = await fetchData(`${baseUrl}${endpoint}`);
    const title = $('h1.entry-title').text();
    const datetime = $('time.updated').attr('datetime');
    const videoSrc = $('#videoku iframe').attr('src');
    const navigation = {
        prev: $('#navigation-episode .nvs').first().find('a').attr('href'),
        allEpisodes: $('#navigation-episode .nvsc a').attr('href'),
        next: $('#navigation-episode .nvs').last().find('a').attr('href')
    };
    const downloads = $('#download_area .listlink a').toArray().map(a => ({
        title: $(a).text(),
        link: $(a).attr('href')
    }));
    return { title, datetime, videoSrc, navigation, downloads };
}

async function scrapeSearch(endpoint, page) {
    const $ = await fetchData(`${baseUrl}page/${page}/?s=${endpoint}`);
    const results = [];
    $('.result li').each((i, element) => {
        const title = $(element).find('h2').text();
        const link = $(element).find('a').attr('href');
        const img = $(element).find('img').attr('src');
        const desc = $(element).find('.descs').text();
        const score = $(element).find('.nilaiseries').text();
        const type = $(element).find('.typeseries').text();
        const rated = $(element).find('.rsrated').text();
        const genres = $(element).find('.genre').toArray().map(span => $(span).text());
        results.push({ title, link, img, desc, score, type, rated, genres });
    });
    const pagination = {
        current: $('.current').text(),
        next: $('.nextpostslink').attr('href'),
        prev: $('.previouspostslink').attr('href')
    };
    return { results, pagination };
}

async function scrapeList(page) {
    const $ = await fetchData(`${baseUrl}page/${page}`);
    const results = [];
    $('article.animepost').each((i, element) => {
        const title = $(element).find('h3').text();
        const link = $(element).find('a').attr('href');
        const img = $(element).find('img').attr('src');
        const desc = $(element).find('.descs').text();
        const score = $(element).find('.nilaiseries').text();
        const type = $(element).find('.typeseries').text();
        const rated = $(element).find('.rsrated').text();
        const genres = $(element).find('.genre').toArray().map(span => $(span).text());
        results.push({ title, link, img, desc, score, type, rated, genres });
    });
    const pagination = {
        current: $('.current').text(),
        next: $('.nextpostslink').attr('href'),
        prev: $('.previouspostslink').attr('href')
    };
    return { results, pagination };
}

async function scrapeGenreSeason(genre, season, page) {
    const $ = await fetchData(`${baseUrl}genres/${genre}/${season}/page/${page}`);
    const results = [];
    $('article.animepost').each((i, element) => {
        const title = $(element).find('h3').text();
        const link = $(element).find('a').attr('href');
        const img = $(element).find('img').attr('src');
        const desc = $(element).find('.descs').text();
        const score = $(element).find('.nilaiseries').text();
        const type = $(element).find('.typeseries').text();
        const rated = $(element).find('.rsrated').text();
        const genres = $(element).find('.genre').toArray().map(span => $(span).text());
        results.push({ title, link, img, desc, score, type, rated, genres });
    });
    const pagination = {
        current: $('.current').text(),
        next: $('.nextpostslink').attr('href'),
        prev: $('.previouspostslink').attr('href')
    };
    return { results, pagination };
}

async function scrapeSchedule() {
    const $ = await fetchData(`${baseUrl}jadwal-rilis/`);
    const schedule = {};
    $('.tabel').each((i, element) => {
        const day = $(element).find('thead tr th').text();
        const episodes = $(element).find('tbody tr').toArray().map(tr => ({
            time: $(tr).find('td').eq(0).text(),
            title: $(tr).find('td').eq(1).text(),
            link: $(tr).find('td').eq(1).find('a').attr('href')
        }));
        schedule[day] = episodes;
    });
    return schedule;
}

module.exports = {
    scrapeOngoing,
    scrapeAnime,
    scrapeEpisode,
    scrapeSearch,
    scrapeList,
    scrapeGenreSeason,
    scrapeSchedule
};
