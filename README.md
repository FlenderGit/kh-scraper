# 💡About
kh-scraper is a small projet to get data from the website [KHInsider](https://downloads.khinsider.com/).
This project is not affiliated with or endorsed by KHInsider.
We encourage users to support KHInsider by contributing music or making a donation through their [official website](https://downloads.khinsider.com/forums/index.php?account/upgrades).

# 💻Installation
To download the librarie, use :
```bash
npm install @flendergit/kh-scraper@1.0.0
```
Be carefull, the package is published on Github Package, so please use `https://npm.pkg.github.com` as basepath.

# 📘Usage
For now, only a few fonctionnalities are includes.
## Retrieve albums
You a retrieve severals albums using a query string.
Be carefull, the data return is AlbumPreview. To get more detailled data, use the following methode `get_album`
```js
import { get_albums } from '@flendergit/kh-scraper';

const albums = await get_albums('cyanotype');
```
The following code gives:
```js
[
  {
    title: 'Cyanotype Daydream -The Girl Who Dreamed the World-',  
    cover_url: 'the-cover-url',
    platforms: [ 'Switch', 'Windows' ],
    type: 'Gamerip',
    year: 2022,
    url: "the-url-of-the-album-as-url-object"
  },
  ...
]
```

## Retrieve album advance
You a get more data on a album.

```js
import { get_album } from '@flendergit/kh-scraper';

// Album got with the previous method
const album_cyanotype = ...; 

const albums = await get_album('cyanotype');
```
The following code gives:
```js
{
  title: 'Cyanotype Daydream -The Girl Who Dreamed the World-',
  cover_url: 'the-cover-url',
  platforms: [ 'Switch', 'Windows' ],
  type: 'Gamerip',
  year: 2022,
  url: 'the-url-on-khinsider'
  subtitle: 'a-subtitle',
  images: [ "can-be-multiples-cover-url" ],
  files_number: 85,
  developed_by: 'Laplacian',
  published_by: 'Laplacian, Syawase Works',
  uploaded_by: 'peterdao',
  uploaded_date: 'Sep 7th, 2024',
  total_size: { mp3: '', flac: '' },
  musics: [
    {
      title: 'bgm3 op',
      artist: 'Laplacian',
      cover_url: 'the-album-cover',
      year: 2022,
      url: 'the-url-of-the-mp3',
      length: 90,
      length_formated: '1:30',
      album_name: 'Cyanotype Daydream -The Girl Who Dreamed the World-'
    },
    ...
  ]
}
```



# 🚧Test
To start test on this project.
```bash
npm test
```
The test suite use Jest.
