import tmdbLogo from '../assets/tmdb-logo.svg'
import lastfmLogo from '../assets/lastfm-logo.svg'

function DataCredits() {
  return (
    <footer
      className="mx-auto max-w-5xl px-3 py-6 sm:px-4"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      <div
        className="rounded-xl px-4 py-5 sm:px-6"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Data Credits
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* TMDb */}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TMDB"
            className="transition-opacity hover:opacity-80"
          >
            <img src={tmdbLogo} alt="TMDB logo" className="h-4 w-auto sm:h-5" />
          </a>

          {/* Last.fm */}
          <a
            href="https://www.last.fm/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Last.fm"
            className="transition-opacity hover:opacity-80"
          >
            <img
              src={lastfmLogo}
              alt="Last.fm logo"
              className="h-4 w-auto sm:h-5"
            />
          </a>
        </div>

        <p
          className="mt-3 text-xs leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          This product uses the TMDB API but is not endorsed or certified by
          TMDB. Music data is provided by Last.fm.
        </p>
      </div>
    </footer>
  )
}

export default DataCredits
