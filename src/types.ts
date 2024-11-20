export type AlbumPreview = {
    title: string;
    platforms: string[];
    type: string;
    year: number;
    url: URL;
    cover_url: string;
}

export type Album = AlbumPreview & {
    subtitle: string;
    images: string[];
    files_number: number;
    developed_by: string;
    published_by: string;
    uploaded_by: string;
    uploaded_date: string;
    total_size: {
        mp3: string;
        flac: string;
    }
    musics: Music[];
}

export type Music = {
    title: string;
    length: number;
    length_formated: string;
    artist: string;
    cover_url: string;
    year: number;
    url: URL;
    album_name: string;
}