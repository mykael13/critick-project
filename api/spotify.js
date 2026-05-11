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
          'Credenciais do Spotify não configuradas.',
        hint:
          'Adicione SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET na Vercel.'
      });
    }

    const auth =
      Buffer
        .from(`${clientId}:${clientSecret}`)
        .toString('base64');

    // =========================
    // TOKEN
    // =========================

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

      console.error(
        'ERRO TOKEN:',
        tokenData
      );

      return res.status(500).json({
        error:
          'Erro ao gerar token do Spotify.',

        details:
          tokenData
      });
    }

    // =========================
    // BUSCA ÁLBUNS
    // =========================

    const searchUrl =
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=8&market=BR`;

    const searchResponse =
      await fetch(searchUrl, {

        headers: {
          Authorization:
            `Bearer ${tokenData.access_token}`
        }
      });

    const searchData =
      await searchResponse.json();

    if (!searchResponse.ok) {

      console.error(
        'ERRO SEARCH:',
        searchData
      );

      return res.status(500).json({
        error:
          'Erro ao buscar álbuns.',

        details:
          searchData
      });
    }

    const spotifyAlbums =
      searchData.albums?.items || [];

    // =========================
    // TRACKLIST
    // =========================

    const albumsWithTracks =
      await Promise.all(

        spotifyAlbums.map(async (album) => {

          try {

            const albumResponse =
              await fetch(
                `https://api.spotify.com/v1/albums/${album.id}?market=BR`,
                {
                  headers: {
                    Authorization:
                      `Bearer ${tokenData.access_token}`
                  }
                }
              );

            const albumData =
              await albumResponse.json();

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

              tracks:
                albumData.tracks?.items?.map(track => ({
                  title: track.name,
                  score: null
                })) || []
            };

          } catch (albumError) {

            console.error(
              'ERRO TRACKLIST:',
              albumError
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

    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({
      albums:
        albumsWithTracks
    });

  } catch (error) {

    console.error(
      'ERRO GERAL:',
      error
    );

    return res.status(500).json({
      error:
        'Erro interno no servidor.',

      details:
        error.message
    });
  }
}