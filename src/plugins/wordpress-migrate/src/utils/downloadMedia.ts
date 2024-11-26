import axios from 'axios';
import { Payload } from 'payload';

export async function downloadMedia(mediaId: number, wp: any, payload: Payload) {
  try {
    const media = await wp.media().id(mediaId).get();
    const response = await axios.get(media.source_url, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data, 'binary');
    const filename = media.slug + '.' + media.mime_type.split('/')[1];

    const uploadedMedia = await payload.create({
      collection: 'media',
      data: {
        alt: media.alt_text || '',
      },
      file: {
        buffer,
        filename,
        mimetype: media.mime_type,
      },
    });

    return uploadedMedia.id;
  } catch (error) {
    console.error('Error downloading media:', error);
    return null;
  }
}