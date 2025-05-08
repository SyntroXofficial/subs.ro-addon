const { addonBuilder } = require("stremio-addon-sdk");
const axios = require("axios");
const cheerio = require("cheerio");

const manifest = {
  id: "subsro.stremio",
  version: "1.0.0",
  name: "Subs.ro Subtitles",
  description: "Romanian subtitles from Subs.ro",
  types: ["movie", "series"],
  resources: ["subtitles"],
  idPrefixes: ["tt"],
  catalogs: [],
  behaviorHints: {
    configurable: false
  }
};

const builder = new addonBuilder(manifest);

builder.defineSubtitlesHandler(async ({ id }) => {
  try {
    const imdbId = id.replace("tt", "");
    const url = `https://subs.ro/subtitrari/?search=${imdbId}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const subtitles = [];

    $(".subtitle-entry").each((i, el) => {
      const link = $(el).find("a").attr("href");
      const title = $(el).find(".subtitle-title").text().trim();
      const lang = "ro";
      if (link) {
        subtitles.push({
          id: link,
          lang,
          url: "https://subs.ro" + link,
          name: title
        });
      }
    });

    return { subtitles };
  } catch (err) {
    console.error(err);
    return { subtitles: [] };
  }
});

module.exports = builder.getInterface();