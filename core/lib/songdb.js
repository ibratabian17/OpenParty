//Songdbs Property
const songdbF = {}
const main = {
  songdb: { "2016": {}, "2017": {}, "2018": {}, "2019": {}, "2020": {}, "2021": {}, "2022": {} },
  localisation: require('../../database/Platforms/openparty-all/localisation.json')
}

songdbF.db = require('../../database/Platforms/openparty-all/songdbs.json')
songdbF.missingAssets = { pc: [] }
songdbF.assetsPlaceholder = {
  "banner_bkgImageUrl": "https://cdn.discordapp.com/attachments/1119503808653959218/1119518680733192222/New_Project_82_Copy_0ED1403.png",
  "coach1ImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/x1/WantUBack_Coach_1.tga.ckd/5e3b1feb1e38f523cbab509a1590df59.ckd",
  "phoneCoach1ImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/WantUBack_Coach_1_Phone.png/5541105eacbc52648bd1462e564d2680.png",
  "coach2ImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/x1/WantUBack_Coach_1.tga.ckd/5e3b1feb1e38f523cbab509a1590df59.ckd",
  "phoneCoach2ImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/WantUBack_Coach_1_Phone.png/5541105eacbc52648bd1462e564d2680.png",
  "coach3ImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/x1/WantUBack_Coach_1.tga.ckd/5e3b1feb1e38f523cbab509a1590df59.ckd",
  "phoneCoach3ImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/WantUBack_Coach_1_Phone.png/5541105eacbc52648bd1462e564d2680.png",
  "coach4ImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/x1/WantUBack_Coach_1.tga.ckd/5e3b1feb1e38f523cbab509a1590df59.ckd",
  "phoneCoach4ImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/WantUBack_Coach_1_Phone.png/5541105eacbc52648bd1462e564d2680.png",
  "coverImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/x1/WantUBack_Cover_Generic.tga.ckd/f61d769f960444bec196d94cfd731185.ckd",
  "cover_1024ImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/WantUBack_Cover_1024.png/9e82873097800b27569f197e0ce848cd.png",
  "cover_smallImageUrl": "https://cdn.discordapp.com/attachments/1119503808653959218/1119518681039384627/New_Project_82_8981698.png",
  "expandBkgImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/x1/WantUBack_Cover_AlbumBkg.tga.ckd/6442844a971a9690bd2bf43f1f635696.ckd",
  "expandCoachImageUrl": "https://jd-s3.cdn.ubi.com/public/map/WantUBack/x1/WantUBack_Cover_AlbumCoach.tga.ckd/dc01eb7b94e0b10c0f52a0383e51312e.ckd",
  "phoneCoverImageUrl": "https://cdn.discordapp.com/attachments/1119503808653959218/1119518681039384627/New_Project_82_8981698.png",
  "videoPreviewVideoURL": "",
  "map_bkgImageUrl": "https://cdn.discordapp.com/attachments/1119503808653959218/1119518680733192222/New_Project_82_Copy_0ED1403.png"
}
songdbF.generateSongdb = function (platform = 'pc', version = '2017', style = false) {
  const newdb = JSON.parse(JSON.stringify({}))
  if (parseInt(version) > 2020) {
    Object.keys(songdbF.db).forEach(codename => {
      var song = JSON.parse(JSON.stringify(songdbF.db[codename]))
      var assets = JSON.parse(JSON.stringify(songdbF.getAsset(platform, codename, style)))
      if (assets !== songdbF.assetsPlaceholder) {
        song.assets = assets
      }
      songdbF.multimpd = {
        "videoEncoding": {
          "vp8": `<?xml version=\"1.0\"?>\r\n<MPD xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"urn:mpeg:DASH:schema:MPD:2011\" xsi:schemaLocation=\"urn:mpeg:DASH:schema:MPD:2011\" type=\"static\" mediaPresentationDuration=\"PT30S\" minBufferTime=\"PT1S\" profiles=\"urn:webm:dash:profile:webm-on-demand:2012\">\r\n\t<Period id=\"0\" start=\"PT0S\" duration=\"PT30S\">\r\n\t\t<AdaptationSet id=\"0\" mimeType=\"video/webm\" codecs=\"vp8\" lang=\"eng\" maxWidth=\"720\" maxHeight=\"370\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" bitstreamSwitching=\"true\">\r\n\t\t\t<Representation id=\"0\" bandwidth=\"495833\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_LOW.vp8.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"621-1110\">\r\n\t\t\t\t\t<Initialization range=\"0-621\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t\t<Representation id=\"1\" bandwidth=\"1478538\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_MID.vp8.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"622-1112\">\r\n\t\t\t\t\t<Initialization range=\"0-622\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t\t<Representation id=\"2\" bandwidth=\"2880956\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_HIGH.vp8.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"622-1112\">\r\n\t\t\t\t\t<Initialization range=\"0-622\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t\t<Representation id=\"3\" bandwidth=\"3428057\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_ULTRA.vp8.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"622-1112\">\r\n\t\t\t\t\t<Initialization range=\"0-622\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t</AdaptationSet>\r\n\t</Period>\r\n</MPD>\r\n`,
          "vp9": `<?xml version=\"1.0\"?>\r\n<MPD xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"urn:mpeg:DASH:schema:MPD:2011\" xsi:schemaLocation=\"urn:mpeg:DASH:schema:MPD:2011\" type=\"static\" mediaPresentationDuration=\"PT30S\" minBufferTime=\"PT1S\" profiles=\"urn:webm:dash:profile:webm-on-demand:2012\">\r\n\t<Period id=\"0\" start=\"PT0S\" duration=\"PT30S\">\r\n\t\t<AdaptationSet id=\"0\" mimeType=\"video/webm\" codecs=\"vp9\" lang=\"eng\" maxWidth=\"720\" maxHeight=\"370\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" bitstreamSwitching=\"true\">\r\n\t\t\t<Representation id=\"0\" bandwidth=\"648085\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_LOW.vp9.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"621-1111\">\r\n\t\t\t\t\t<Initialization range=\"0-621\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t\t<Representation id=\"1\" bandwidth=\"1492590\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_MID.vp9.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"621-1111\">\r\n\t\t\t\t\t<Initialization range=\"0-621\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t\t<Representation id=\"2\" bandwidth=\"2984529\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_HIGH.vp9.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"621-1111\">\r\n\t\t\t\t\t<Initialization range=\"0-621\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t\t<Representation id=\"3\" bandwidth=\"5942260\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_ULTRA.vp9.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"621-1118\">\r\n\t\t\t\t\t<Initialization range=\"0-621\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t</AdaptationSet>\r\n\t</Period>\r\n</MPD>\r\n`
        }
      }
      song.mapPreviewMpd = songdbF.multimpd
      if (song.customTypeNameId) song.customTypeName = main.localisation[song.customTypeNameId] ? main.localisation[song.customTypeNameId].en || "" : `MISSING:${[song.customTypeNameId]}`
      //check does previewVideoExist??
      if (!song.urls || (song.urls && !song.urls[`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_ULTRA.vp9.webm`])) {
        var tempaudioPrev = (song.urls && song.urls[`jmcs://jd-contents/${codename}/${codename}_AudioPreview.ogg`]) || ""
        song.urls = {
          [`jmcs://jd-contents/${codename}/${codename}_AudioPreview.ogg`]: tempaudioPrev,
          [`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_HIGH.vp8.webm`]: "",
          [`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_HIGH.vp9.webm`]: "",
          [`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_LOW.vp8.webm`]: "",
          [`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_LOW.vp9.webm`]: "",
          [`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_MID.vp8.webm`]: "",
          [`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_MID.vp9.webm`]: "",
          [`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_ULTRA.vp8.webm`]: "",
          [`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_ULTRA.vp9.webm`]: ""
        }
      }
      newdb[codename] = song
    });
  }
  if (parseInt(version) < 2020) {
    Object.keys(songdbF.db).forEach(codename => {
      var song = JSON.parse(JSON.stringify(songdbF.db[codename]))
      var assets = {}

      if (platform == "pcdreyn") {
        assets = JSON.parse(JSON.stringify(songdbF.getAsset(platform, codename, style, function (platformAssets) {
          platformAssets.expandBkgImageUrl = platformAssets.cover_1024ImageUrl
          if (platformAssets.song_TitleImageUrl) platformAssets.cover_smallImageUrl = platformAssets.song_TitleImageUrl
          return platformAssets
        })))
        const jDiff = { "1": "Easy", "2": "Medium", "3": "Hard", "4": "Extreme" }
        const jCoaches = { "1": "Easy", "2": "Medium", "3": "Hard", "4": "Extreme" }
        song.credits = `${song.difficulty}: ${jDiff[song.difficulty]} ${song.coachCount}: ${jCoaches[song.coachCount]}`
      } else {
        assets = JSON.parse(JSON.stringify(songdbF.getAsset(platform, codename, style)))
      }
      if (assets !== songdbF.assetsPlaceholder) {
        song.assets = assets
      }

      songdbF.singlempd = `<?xml version=\"1.0\"?>\r\n<MPD xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"urn:mpeg:DASH:schema:MPD:2011\" xsi:schemaLocation=\"urn:mpeg:DASH:schema:MPD:2011\" type=\"static\" mediaPresentationDuration=\"PT30S\" minBufferTime=\"PT1S\" profiles=\"urn:webm:dash:profile:webm-on-demand:2012\">\r\n\t<Period id=\"0\" start=\"PT0S\" duration=\"PT30S\">\r\n\t\t<AdaptationSet id=\"0\" mimeType=\"video/webm\" codecs=\"vp9\" lang=\"eng\" maxWidth=\"720\" maxHeight=\"370\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" bitstreamSwitching=\"true\">\r\n\t\t\t<Representation id=\"0\" bandwidth=\"648085\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_LOW.vp9.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"621-1111\">\r\n\t\t\t\t\t<Initialization range=\"0-621\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t\t<Representation id=\"1\" bandwidth=\"1492590\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_MID.vp9.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"621-1111\">\r\n\t\t\t\t\t<Initialization range=\"0-621\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t\t<Representation id=\"2\" bandwidth=\"2984529\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_HIGH.vp9.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"621-1111\">\r\n\t\t\t\t\t<Initialization range=\"0-621\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t\t<Representation id=\"3\" bandwidth=\"5942260\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_ULTRA.vp9.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"621-1118\">\r\n\t\t\t\t\t<Initialization range=\"0-621\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t</AdaptationSet>\r\n\t</Period>\r\n</MPD>\r\n`
      var vp9Preview = song.mapPreviewMpd && song.mapPreviewMpd.vp9 ? song.mapPreviewMpd.vp9 : false;
      song.mapPreviewMpd = vp9Preview || songdbF.singlempd
      if (!Array.isArray(song.skuIds)) {
        var skuIds = song.skuIds || {}
        song.skuIds = Object.values(skuIds)
      }
      if (!Array.isArray(song.tags)) {
        var tags = song.tags || {}
        song.tags = Object.values(tags)
      }
      if (!Array.isArray(song.searchTagsLocIds)) {
        var searchTagsLocIds = song.searchTagsLocIds || {}
        song.searchTagsLocIds = Object.values(searchTagsLocIds)
      } else if (song.searchTagsLocIds == undefined) {
        song.searchTagsLocIds = ["30000315"]
      }
      if (!Array.isArray(song.searchTags)) {
        var searchTags = song.searchTags || {}
        song.searchTags = Object.values(searchTags)
      } else if (song.searchTags == undefined) {
        song.searchTags = []
      }
      if (!Array.isArray(song.jdmAttributes)) {
        var jdmAttributes = song.jdmAttributes || {}
        song.jdmAttributes = Object.values(jdmAttributes)
      }
      if (song.customTypeNameId) song.customTypeName = main.localisation[song.customTypeNameId] ? main.localisation[song.customTypeNameId].en || "" : `MISSING:${[song.customTypeNameId]}`
      if (!song.urls || (song.urls && !song.urls[`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_ULTRA.vp9.webm`])) {
        var tempaudioPrev = (song.urls && song.urls[`jmcs://jd-contents/${codename}/${codename}_AudioPreview.ogg`]) || ""
        song.urls = {
          [`jmcs://jd-contents/${codename}/${codename}_AudioPreview.ogg`]: tempaudioPrev,
          [`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_HIGH.vp8.webm`]: "",
          [`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_HIGH.vp9.webm`]: "",
          [`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_LOW.vp8.webm`]: "",
          [`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_LOW.vp9.webm`]: "",
          [`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_MID.vp8.webm`]: "",
          [`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_MID.vp9.webm`]: "",
          [`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_ULTRA.vp8.webm`]: "",
          [`jmcs://jd-contents/${codename}/${codename}_MapPreviewNoSoundCrop_ULTRA.vp9.webm`]: ""
        }
      }
      newdb[codename] = song
    });
  }
  return newdb
}
songdbF.getAsset = function (platform, codename, style = false, modifier = function (a) { return a }) {
  var CurrentPlatform = platform
  var platformAssets = JSON.parse('{}')
  if (platform == 'pc') { CurrentPlatform = 'x1' }
  if (!songdbF.areAllValuesEmpty(songdbF.db[codename].assets[CurrentPlatform]) || songdbF.db[codename].assets[CurrentPlatform] == {}) {
    platformAssets = JSON.parse(JSON.stringify(songdbF.db[codename].assets[CurrentPlatform]));
  }
  else if (!songdbF.areAllValuesEmpty(songdbF.db[codename].assets.common) || songdbF.db[codename].assets[CurrentPlatform] == {}) {
    platformAssets = JSON.parse(JSON.stringify(songdbF.db[codename].assets.common));
  }
  else {
    platformAssets = songdbF.assetsPlaceholder
  }
  // Return the platformAssets
  // Check if style is true or banner_bkgImageUrl is empty, then set banner_bkgImageUrl to map_bkgImageUrl
  if (style == true || (!platformAssets.banner_bkgImageUrl || (platformAssets.banner_bkgImageUrl && platformAssets.banner_bkgImageUrl == ""))) {
    platformAssets.banner_bkgImageUrl = ""
    platformAssets.banner_bkgImageUrl = platformAssets.map_bkgImageUrl
  }
  platformAssets = JSON.parse(JSON.stringify(modifier(JSON.parse(JSON.stringify(platformAssets)))))
  return JSON.parse(JSON.stringify(platformAssets));
}
songdbF.generate = function () {
  Object.keys(main.songdb).forEach((version) => {
    const a = {}
    if (version == 2017) a.pcdreyn = JSON.parse(JSON.stringify(songdbF.generateSongdb('pcdreyn', version, true)))
    a.pcparty = JSON.parse(JSON.stringify(songdbF.generateSongdb('pc', version, true)))
    a.pc = JSON.parse(JSON.stringify(songdbF.generateSongdb('pc', version, false)))
    a.nx = JSON.parse(JSON.stringify(songdbF.generateSongdb('nx', version, false)))
    a.wiiu = JSON.parse(JSON.stringify(songdbF.generateSongdb('wiiu', version, false)))
    main.songdb[version] = a
  })
}
songdbF.areAllValuesEmpty = function (obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== "") {
      return false;
    }
  }
  return true;
}

songdbF.generateSonglist = function () {
  console.log(`[SONGDB] Processing Songdbs`)
  songdbF.generate()
  console.log(`[SONGDB] ${Object.keys(main.songdb[2017].pc).length} Maps Loaded`)
  return main.songdb
}

module.exports = { songdbF }