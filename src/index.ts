import { Album, AlbumPreview, Music } from "./types";
import { JSDOM } from "jsdom";

const BASE_URL = "https://downloads.khinsider.com";

function fetch_api(url: URL): Promise<Response> {
  return fetch(url.toString())
}

export async function get_albums(query: string): Promise<AlbumPreview[]> {
    const url = new URL(BASE_URL + "/search");
    url.searchParams.append("search", query);
  const response = await fetch_api(url)

  if (!response.ok) {
    throw new Error("Failed to fetch albums");
  }

  const text = await response.text();

  // Create the DOM
  const parser = new JSDOM(text);
  const doc = parser.window.document;

  // Get the table or return empty
  const table = doc.querySelector(".albumList");
  if (!table) {
    return [];
  }

  const rows = Array.from(table.querySelectorAll("tr")).slice(1);
  return Array.from(rows).map((row) => {
    const cells = row.querySelectorAll("td");
    const platforms_content = cells[2].textContent?.trim();
    return {
      title: cells[1].querySelector("a")?.textContent || "",
      cover_url: cells[0].querySelector("img")?.src || "",
      platforms: platforms_content ? platforms_content.split(", ") : [],
      type: cells[3].textContent || "",
      year: parseInt(cells[4].textContent ?? "0"),
      url: new URL(BASE_URL + cells[1].querySelector("a")?.href),
    };
  });
}

export async function get_album(album: AlbumPreview): Promise<Album> {

    const response = await fetch_api(album.url);
    
    if (!response.ok) {
        throw new Error("Failed to fetch album");
    }

    const text = await response.text();

    // Create the DOM
    const parser = new JSDOM(text);
    const doc = parser.window.document;

    const page_content = doc.querySelector("#pageContent");

    if (!page_content) {
        throw new Error("Failed to detect the page content");
    }

    const script = page_content.firstChild?.nextSibling
    const title = script?.nextSibling;
    const subtitle = script?.nextSibling;

    const list_prefix = get_list_prefix(script?.textContent || "");
    const list_entities = get_list_entities(script?.textContent || "");

    const list_entities_decoded = decodeJsonList(list_entities, list_prefix);

    /* console.log(list_entities);
    console.log(list_prefix);
    console.log(list_entities_decoded); */

    // Get the table or return empty
    const table = doc.querySelector('#songlist');
    if (table === null) {
        throw new Error("No table detected")
    }

    const rows = Array.from(table.querySelectorAll('tr'));
    const is_multiple_disc = rows[0].cells[1].textContent === "CD";
    const pad = is_multiple_disc ? 1 : 0;

    const artist = "[TO CHANGE]";

    const musics: Music[] = Array.from(rows.slice(1, -1)).map((row,i) => {
        const cells = row.querySelectorAll('td');
        const entity = list_entities_decoded[i]
        const decoded_url = decode_url(entity["file"], list_prefix);
        return {
            title: entity["name"],
            artist,
            cover_url: album.cover_url,
            year: album.year,
            url: new URL("https://" + decoded_url),
            length: timeToSeconds(entity["length"]),
            length_formated: entity["length"],
            album_name: album.title,
        }
    });

    return {
        ...album,
        title: title?.textContent || "",
        subtitle: subtitle?.textContent || "",
        images: [],
        files_number: musics.length,
        developed_by: "",
        published_by: "",
        uploaded_by: "",
        uploaded_date: "",
        total_size: {
            mp3: "",
            flac: "",
        },
        musics,
    }
    
}

function timeToSeconds(time: string): number {
    // Sépare la chaîne à l'aide du caractère ":"
    const [minutes, seconds] = time.split(':').map(Number);

    // Si la chaîne est mal formatée ou les valeurs ne sont pas des nombres valides
    if (isNaN(minutes) || isNaN(seconds)) {
        throw new Error("Format de temps invalide");
    }

    // Convertir en secondes totales
    return minutes * 60 + seconds;
}

function get_list_prefix(doc: string): string[] {
    const regex = /\|\|\|(.*?)\.split\('\|'\),0,\{/;
    const match = doc.match(regex);

    let list_prefix: string[] = [];

    if (!match || !match[1]) {
        throw new Error("No match found");
    }

    const extractedContent = match[1];
    list_prefix = extractedContent.split('|');
    list_prefix = ["", "", "", ...list_prefix]

    return list_prefix;
}

type ObjectResponse = {
    [key: string]: string
}

function get_list_entities(doc: string): ObjectResponse[] {
    const regex = /\[\{(.*?)\},\]/;
    const match = doc.match(regex);

    if (!match || !match[1]) {
        throw new Error("No match found");
    }

    let extractedContent = "[{" + match[1] + "}]"
    //extractedContent = extractedContent.replace(/\\/g, '\\\\');
    //extractedContent = extractedContent.replace(/"t":(\d+)([A-Za-z])/g, '"t":"$1$2"');
    //console.log(extractedContent);
    return JSON.parse(extractedContent);

}

type DecodedDataTrack = {
    name: string,
    file: string,
    length: string,
    track: number
}
function decodeJsonList(
    jsonList: Array<Record<string, string | number>>,
    listPrefix: string[]
  ): Array<DecodedDataTrack> {
    const decodeUrl = (hash: string): string => {
        const getNumber = (char: string): number => {
            const code = char.charCodeAt(0);
            if (code >= 48 && code <= 57) return code - 48; // '0'-'9' -> 0-9
            if (code >= 97 && code <= 122) return code - 97 + 10; // 'a'-'z' -> 10-35
            return code - 65 + 36; // 'A'-'Z' -> 36-61
        };
  
        return hash.replace(/(\w*)([A-Za-z0-9])/g, (match, prefix, letter) => {
            let index = getNumber(letter);
            if (prefix) index += getNumber(prefix) * 62;
            const replacement = listPrefix[index] || "";
            return replacement || `${prefix}${letter}`;
        });
    };
  
    return jsonList.map((obj) => {
        const decodedObj: Record<string, string | number> = {};
  
        for (const [key, value] of Object.entries(obj)) {
            const decodedKey = decodeUrl(key);
  
            // Decode value only if it's a string
            const decodedValue = typeof value === "string" ? decodeUrl(value) : value;
  
            decodedObj[decodedKey] = decodedValue;
        }
  
        // Add security on fields

        return decodedObj as DecodedDataTrack;
    });
  }

function decode_url(hash: string, listPrefix: string[]): string {
    // Helper function to convert a character to its corresponding numeric value
    const getNumber = (char: string): number => {
        const code = char.charCodeAt(0);
        if (code >= 48 && code <= 57) return code - 48; // '0'-'9' -> 0-9
        if (code >= 97 && code <= 122) return code - 97 + 10; // 'a'-'z' -> 10-35
        return code - 65 + 36; // 'A'-'Z' -> 36-61
    };

    // Replace matches in the hash string
    return hash.replace(/(\w*)([A-Za-z0-9])/g, (match, prefix, letter) => {
        let index = getNumber(letter);

        // Include prefix if present
        if (prefix) {
            index += getNumber(prefix) * 62;
        }

        // Fetch the mapped value from the list
        const replacement = listPrefix[index] || "";
        return replacement || `${prefix}${letter}`;
    });
}


/* function decode_url(hash: string, list_prefix: string[]): string {
    return hash.replace(/(\w*)([A-Za-z0-9])/g, (match, prefix, letter) => {
        let index = get_number(letter);

        if (prefix !== "") {
            index += get_number(prefix) * 62;
        }

        let out = list_prefix[index];

        if (out === "") {
            return prefix + letter;
        }

        return out;

    });
}

function get_number(char: string): number {

    // if number
    if (char.charCodeAt(0) >= 48 && char.charCodeAt(0) <= 57) {
        return char.charCodeAt(0) - 48;
    }

    // if letter if lower case
    if (char.charCodeAt(0) >= 97 && char.charCodeAt(0) <= 122) {
        return char.charCodeAt(0) - 97 + 10;
    }

    return char.charCodeAt(0) - 65 + 36;

} */