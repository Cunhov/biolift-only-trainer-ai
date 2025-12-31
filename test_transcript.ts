import { YoutubeTranscript } from 'youtube-transcript';

const testUrl = 'https://www.youtube.com/watch?v=IODxDxX7oi4'; // Example video

async function test() {
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(testUrl);
        console.log('Success! Transcript length:', transcript.length);
        console.log('Sample:', transcript.slice(0, 3).map(t => t.text).join(' '));
    } catch (e) {
        console.error('Failed:', e);
    }
}

test();
