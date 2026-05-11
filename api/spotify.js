export default async function handler(req, res) {

  try {

    const query =
      String(req.query.q || '').trim();

    if (!query) {

      return res.status(400).json({
        error: 'Digite o nome de um álbum.'
      });
    }

    const clientId =
      process.env.SPOTIFY_CLIENT_ID;

    const clientSecret =
      process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {

      return res.status(500).json({
        error:
          'Credenciais do Spotify não configuradas.'
      });
    }

    const auth =
      Buffer
        .from(`${clientId}:${clientSecret}`)
        .toString('base64');

    // TOKEN

    const tokenResponse =
      await fetch(
        'https://accounts.spotify.com/api/token',
        {
          method: 'POST',

          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type':
              'application/x-www-form-urlencoded'
          },

          body:
            'grant_type=client_credentials'
        }
      );

    const tokenData =
      await tokenResponse.json();

    if (
      !tokenResponse.ok ||
      !tokenData.access_token
    ) {

      return res.status(500).json({
        error:
          'Erro ao gerar token do Spotify.',
        details:
          tokenData
      });
    }

    const accessToken =
      tokenData.access_token;

    // BUSCA ÁLBUNS

    const searchResponse =
      await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=8&market=BR`,
        {
          headers: {
            Authorization:
              `Bearer ${accessToken}`
          }
        }
      );

    const searchData =
      await searchResponse.json();

    if (!searchResponse.ok) {

      return res.status(500).json({
        error:
          'Erro ao buscar álbuns.',
        details:
          searchData
      });
    }

    const albums =
      searchData.albums?.items || [];

    // TRACKLIST

    const albumsWithTracks =
      await Promise.all(

        albums.map(async (album) => {

          try {

            const tracksResponse =
              await fetch(
                `https://api.spotify.com/v1/albums/${album.id}/tracks?market=BR&limit=50`,
                {
                  headers: {
                    Authorization:
                      `Bearer ${accessToken}`
                  }
                }
              );

            const tracksData =
              await tracksResponse.json();

            const tracks =
              (tracksData.items || []).map(track => ({
                title:
                  track.name ||
                  'Faixa sem nome',

                score:
                  null
              }));

            return {

              id:
                album.id,

              name:
                album.name,

              artist:
                album.artists
                  ?.map(artist => artist.name)
                  .join(', ')
                || 'Artista desconhecido',

              year:
                album.release_date
                  ?.slice(0, 4)
                || '',

              cover:
                album.images?.[0]?.url
                || '',

              spotifyUrl:
                album.external_urls?.spotify
                || '',

              tracks
            };

          } catch (error) {

            console.error(
              'Erro faixas:',
              error
            );

            return {

              id:
                album.id,

              name:
                album.name,

              artist:
                album.artists
                  ?.map(artist => artist.name)
                  .join(', ')
                || 'Artista desconhecido',

              year:
                album.release_date
                  ?.slice(0, 4)
                || '',

              cover:
                album.images?.[0]?.url
                || '',

              spotifyUrl:
                album.external_urls?.spotify
                || '',

              tracks: []
            };
          }
        })
      );

    return res.status(200).json({
      albums:
        albumsWithTracks
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error:
        'Erro interno no servidor.'
    });
  }
}