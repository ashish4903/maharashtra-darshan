import useLang from '../lib/useLang';
import useCommonsGallery from '../lib/useCommonsGallery';
import { categoryUrl, fileCaption } from '../lib/commons';
import { commonsUrl } from '../lib/catalogue';

/**
 * More photos of a place from its Wikimedia Commons category. Each one links
 * to its file page and shows its author and licence, as the licences ask.
 * Hidden while loading, and when there are none or Commons can't be reached.
 */
export default function Gallery({ category, skipFile, placeName }) {
  const { t } = useLang();
  const { photos } = useCommonsGallery(category, skipFile);
  if (photos.length === 0) return null;

  return (
    <section className="gallery" aria-label={t('gallery.label', { name: placeName })}>
      <h2 className="gallery-title">{t('gallery.title')}</h2>
      <ul className="gallery-grid">
        {photos.map((p) => (
          <li key={p.file}>
            <figure>
              <a href={commonsUrl(p.file)} target="_blank" rel="noreferrer">
                <img
                  src={p.src}
                  alt={fileCaption(p.file)}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </a>
              <figcaption lang="en">
                {p.author && <span className="gallery-author">{p.author}</span>}
                <span className="gallery-licence">{p.licence}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p className="source-note">
        {t('gallery.note')}{' '}
        <a href={categoryUrl(category)} target="_blank" rel="noreferrer">
          {t('gallery.more')}
        </a>
      </p>
    </section>
  );
}
