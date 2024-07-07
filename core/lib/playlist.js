const { loadJsonFile } = require('../helper')
const inputJson = loadJsonFile('carousel/playlist.json', '../database/carousel/playlist.json');
const ClassList = require('./playlist-Class.json')
const WEEKLY_PLAYLIST_PREFIX = 'DFRecommendedFU';

const generatePlaylist = () => {
    let playlistdb = ClassList.playlistdb;
    let playlistcategory = ClassList.playlistcategory;

    let a = 6
    inputJson.forEach(item => {
        if (!item.name.startsWith(WEEKLY_PLAYLIST_PREFIX)) {
            playlistdb.db[item.id] = {
                "filters": item.filters,
                "maps": item.songlist,
                "__class": "PlaylistDbService::Playlist",
                "title": item.name,
                "description": item.description,
                "coverURL": item.coverURL,
                "fixedMapOrder": item.fixedMapOrder,
                "fallback": item.fallback,
                "pinned": item.pinned
            };
            
            playlistcategory.categories[1].items.push({
                "__class": "Item",
                "isc": "grp_row",
                "act": "ui_carousel",
                "actionList": "_None",
                "actionListUpsell": "_None",
                "components": [
                    {
                        "__class": "JD_CarouselContentComponent_Playlist",
                        "playlistID": item.id,
                        "displayCode": a,
                        "displayMethod": "manual"
                    }
                ]
            });
            a++;
        }
    });

    return {
        playlistdb,
        playlistcategory
    };
};

module.exports = {
    generatePlaylist
}
