#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const input = process.argv[2];

if (!input) {
  console.error('Usage:');
  console.error('  Import from YouTube Playlist:');
  console.error('    node import-playlist.js <youtube_playlist_url_or_id>');
  console.error('  Import from Text File (one song per line):');
  console.error('    node import-playlist.js <path_to_txt_file>');
  process.exit(1);
}

const targetFile = path.join(__dirname, 'tracks.json');

// Helper to clean titles for iTunes search
function cleanTitle(title) {
  return title
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/official\s+(music\s+)?video/gi, '')
    .replace(/official\s+lyric\s+video/gi, '')
    .replace(/lyric\s+video/gi, '')
    .replace(/lyrics/gi, '')
    .replace(/hd/gi, '')
    .replace(/4k/gi, '')
    .replace(/ft\./gi, '')
    .replace(/feat\./gi, '')
    .replace(/[\-\|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper to parse durations like "5:04" or "2:30:15" into seconds
function parseDuration(durationStr) {
  if (!durationStr) return 180; // default 3 min
  const parts = durationStr.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return Number(durationStr) || 180;
}

// Search iTunes for high-res covers and clean tags
async function getiTunesMetadata(query, videoId) {
  const cleaned = cleanTitle(query);
  console.log(`Searching iTunes for: "${cleaned}"...`);
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(cleaned)}&entity=song&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.resultCount > 0) {
      const result = data.results[0];
      const cover = result.artworkUrl100 
        ? result.artworkUrl100.replace('/100x100bb.jpg', '/600x600bb.jpg')
        : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      return {
        title: result.trackName,
        artist: result.artistName,
        album: result.collectionName || 'Single',
        cover: cover,
        duration: Math.round(result.trackTimeMillis / 1000)
      };
    }
  } catch (err) {
    console.warn(`iTunes search failed for "${cleaned}":`, err.message);
  }
  return null;
}

// Search YouTube for a query and return the first video ID found
async function searchYouTube(query) {
  console.log(`Searching YouTube for: "${query}"...`);
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const html = await res.text();
    const match = html.match(/var ytInitialData = ({.*?});/);
    if (!match) return null;

    const data = JSON.parse(match[1]);
    const videoIds = [];
    
    function findVideoIds(obj) {
      if (!obj || typeof obj !== 'object') return;
      if (obj.videoId) {
        videoIds.push(obj.videoId);
      }
      for (const key of Object.keys(obj)) {
        findVideoIds(obj[key]);
      }
    }
    findVideoIds(data);
    
    const uniqueIds = [...new Set(videoIds)];
    return uniqueIds.length > 0 ? uniqueIds[0] : null;
  } catch (err) {
    console.error(`YouTube search failed for "${query}":`, err.message);
    return null;
  }
}

// Main logic
async function main() {
  let tracks = [];

  // Check if input is a text file
  const isTextFile = fs.existsSync(input) && (input.endsWith('.txt') || fs.statSync(input).isFile());

  if (isTextFile) {
    console.log(`Reading track list from file: ${input}`);
    const content = fs.readFileSync(input, 'utf-8');
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));

    console.log(`Found ${lines.length} songs to import.`);
    for (const line of lines) {
      const videoId = await searchYouTube(line);
      if (!videoId) {
        console.error(`Could not find a YouTube video for: "${line}". Skipping.`);
        continue;
      }

      console.log(`Found YouTube Video ID: ${videoId} for "${line}"`);
      const itunes = await getiTunesMetadata(line, videoId);
      
      if (itunes) {
        tracks.push({
          id: videoId,
          title: itunes.title,
          artist: itunes.artist,
          album: itunes.album,
          duration: itunes.duration,
          cover: itunes.cover,
          rawTitle: line
        });
      } else {
        tracks.push({
          id: videoId,
          title: cleanTitle(line),
          artist: 'Unknown Artist',
          album: 'Single',
          duration: 180,
          cover: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          rawTitle: line
        });
      }

      // Small delay to prevent rate-limiting
      await new Promise(r => setTimeout(r, 300));
    }
  } else {
    // Treat as YouTube playlist URL or ID
    let playlistId = input;
    if (input.includes('list=')) {
      const match = input.match(/[&?]list=([^&]+)/);
      if (match) playlistId = match[1];
    }

    const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
    console.log(`Fetching YouTube playlist: ${playlistId}`);

    try {
      const res = await fetch(playlistUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const html = await res.text();
      const match = html.match(/var ytInitialData = ({.*?});/);
      if (!match) throw new Error('Could not find playlist data on page.');

      const data = JSON.parse(match[1]);
      const rawVideos = [];

      function findLockups(obj) {
        if (!obj || typeof obj !== 'object') return;
        if (obj.lockupViewModel) {
          rawVideos.push(obj.lockupViewModel);
        }
        for (const key of Object.keys(obj)) {
          findLockups(obj[key]);
        }
      }
      findLockups(data);

      if (rawVideos.length === 0) {
        throw new Error('No videos found in the playlist. Make sure the playlist is public.');
      }

      console.log(`Found ${rawVideos.length} items in playlist.`);
      const seenIds = new Set();

      for (const item of rawVideos) {
        const videoId = item.contentId;
        if (!videoId || seenIds.has(videoId)) continue;
        seenIds.add(videoId);

        const rawTitle = item.metadata?.lockupMetadataViewModel?.title?.content || 'Unknown Title';
        
        let rawArtist = '';
        try {
          const rows = item.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows;
          if (rows && rows[0]?.metadataParts && rows[0]?.metadataParts[0]?.text?.content) {
            rawArtist = rows[0].metadataParts[0].text.content;
          }
        } catch (e) {}

        let durationStr = '';
        try {
          const overlays = item.contentImage?.thumbnailViewModel?.overlays;
          if (overlays && overlays[0]?.thumbnailBottomOverlayViewModel?.badges[0]?.thumbnailBadgeViewModel?.text) {
            durationStr = overlays[0].thumbnailBottomOverlayViewModel.badges[0].thumbnailBadgeViewModel.text;
          }
        } catch (e) {}
        const ytDuration = parseDuration(durationStr);

        console.log(`Processing: "${rawTitle}" (ID: ${videoId})`);
        const itunes = await getiTunesMetadata(rawTitle, videoId);

        if (itunes) {
          tracks.push({
            id: videoId,
            title: itunes.title,
            artist: itunes.artist,
            album: itunes.album,
            duration: itunes.duration || ytDuration,
            cover: itunes.cover,
            rawTitle: rawTitle
          });
        } else {
          tracks.push({
            id: videoId,
            title: cleanTitle(rawTitle),
            artist: rawArtist || 'Unknown Artist',
            album: 'Single',
            duration: ytDuration,
            cover: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            rawTitle: rawTitle
          });
        }

        await new Promise(r => setTimeout(r, 200));
      }
    } catch (err) {
      console.error('Failed to import playlist:', err.message);
      process.exit(1);
    }
  }

  if (tracks.length > 0) {
    fs.writeFileSync(targetFile, JSON.stringify(tracks, null, 2), 'utf-8');
    console.log(`Successfully imported ${tracks.length} tracks into ${targetFile}!`);
  } else {
    console.log('No tracks were imported.');
  }
}

main();
