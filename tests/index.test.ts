import { get_album, get_albums } from "../src/index";
import { AlbumPreview } from "../src/types";

const CYANOTYPE_ALBUM: AlbumPreview = {
  title: "Cyanotype Daydream -The Girl Who Dreamed the World-",
  cover_url:
    "https://kappa.vgmsite.com/soundtracks/cyanotype-daydream-the-girl-who-dreamed-the-world-switch-windows-gamerip-2022/thumbs_small/cover.jpg",
  platforms: ["Switch", "Windows"],
  type: "Gamerip",
  year: 2022,
  url: new URL(
    "https://downloads.khinsider.com/game-soundtracks/album/cyanotype-daydream-the-girl-who-dreamed-the-world-switch-windows-gamerip-2022"
  ),
};

test("get_albums: test query with results", () => {
  return get_albums("cyanotype").then((response) => {
    expect(response[0]).toStrictEqual(CYANOTYPE_ALBUM);
  });
});

test("get_albums: test query query complexe with results", () => {
  const EXPECTED_RESPONSE = {
    title: "Professor Layton and The Azran Legacy",
    cover_url:
      "https://vgmsite.com/soundtracks/professor-layton-and-the-azran-legacy/thumbs_small/folder.jpg",
    platforms: ["3DS"],
    type: "Gamerip",
    year: 2013,
    url: new URL(
      "https://downloads.khinsider.com/game-soundtracks/album/professor-layton-and-the-azran-legacy"
    ),
  };
  return get_albums("professor layton").then((response) => {
    expect(response[0]).toStrictEqual(EXPECTED_RESPONSE);
  });
});

test("get_albums: no results", () => {
  return get_albums("zzzzzzzz").then((response) => {
    expect(response.length).toBe(0);
  });
});

test("get_album", async () => {
  return get_album(CYANOTYPE_ALBUM).then((response) => {
    expect(response.musics.length).toBe(85);
  });
});
