import Photo from './Photo';

/** Page header with a background photo, used by region, district and place pages. */
export default function Banner({ image, icon, kicker, title, titleMr, children }) {
  return (
    <header className="banner">
      <Photo image={image} alt="" icon={icon} className="banner-photo" eager />
      <div className="banner-text">
        {kicker && <p className="banner-kicker">{kicker}</p>}
        <h1>
          {title}
          {titleMr && <span lang="mr">{titleMr}</span>}
        </h1>
        {children}
      </div>
    </header>
  );
}
